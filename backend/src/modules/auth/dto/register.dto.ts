import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido debe tener máximo 100 caracteres' })
  apellido: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Teléfono del usuario (formato: +56912345678)',
    example: '+56912345678',
  })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^\+56\d{9}$/, {
    message: 'El teléfono debe tener el formato +56XXXXXXXXX',
  })
  telefono: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 6 caracteres)',
    example: 'Password123!',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (opcional)',
    example: '1990-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  fecha_nacimiento?: string;

  @ApiProperty({
    description: 'Dirección (opcional)',
    example: 'Av. Principal 123, Santiago',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @MaxLength(500, { message: 'La dirección debe tener máximo 500 caracteres' })
  direccion?: string;
}
