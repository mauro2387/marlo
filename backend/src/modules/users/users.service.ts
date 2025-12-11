import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      relations: ['roles'],
      select: ['id', 'nombre', 'apellido', 'email', 'telefono', 'activo', 'created_at'],
    });
  }

  async findOne(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: ['id', 'nombre', 'apellido', 'email', 'telefono', 'activo', 'created_at'],
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }
}
