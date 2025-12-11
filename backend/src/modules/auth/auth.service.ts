import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, telefono, contrasena, ...userData } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { telefono }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('El email ya está registrado');
      }
      if (existingUser.telefono === telefono) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(
      contrasena,
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );

    // Obtener rol de Cliente
    const clienteRole = await this.rolesRepository.findOne({
      where: { nombre: 'Cliente' },
    });

    if (!clienteRole) {
      throw new BadRequestException('Rol de cliente no encontrado');
    }

    // Crear usuario
    const user = this.usersRepository.create({
      ...userData,
      email,
      telefono,
      contrasena: hashedPassword,
      roles: [clienteRole],
    });

    await this.usersRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Excluir contraseña de la respuesta
    delete user.contrasena;

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.contrasena);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    if (user.blacklist) {
      throw new UnauthorizedException(
        'Usuario bloqueado. Contacte con soporte.',
      );
    }

    // Actualizar último login
    await this.usersRepository.update(user.id, {
      ultimo_login: new Date(),
    });

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Excluir contraseña
    delete user.contrasena;

    return {
      user,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.contrasena);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async refreshToken(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.nombre),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: process.env.JWT_EXPIRATION || '15m',
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
