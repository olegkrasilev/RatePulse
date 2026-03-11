import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user',
    minLength: 2,
    maxLength: 50,
    description: 'User full name. Only letters, spaces and hyphens allowed.',
    pattern: '^[a-zA-Zа-яА-ЯёЁ\\s-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50, { message: 'Name is too long' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, {
    message: 'Name contains invalid characters',
  })
  @Transform(({ value }: { value: string }) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  })
  name: string;

  @ApiProperty({
    example: 'user@test.com',
    maxLength: 255,
    description: 'Unique email address',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
  })
  email: string;

  @ApiProperty({
    example: 'strongpassword123',
    minLength: 8,
    maxLength: 128,
    description: 'User password',
    format: 'password',
    writeOnly: true,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password is too long' })
  password: string;
}
