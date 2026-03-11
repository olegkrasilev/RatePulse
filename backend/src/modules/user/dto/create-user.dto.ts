import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password is too long' })
  password: string;
}
