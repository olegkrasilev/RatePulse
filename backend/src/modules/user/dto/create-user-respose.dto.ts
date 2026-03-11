import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../user.entity';

export class CreateUserResponseDto extends OmitType(User, [
  'password_hash',
] as const) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user identifier (UUID).',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'user',
    description: 'User full name. Only letters, spaces and hyphens allowed.',
  })
  name: string;

  @ApiProperty({
    example: 'user@test.com',
    description: 'Unique email address',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    example: '2026-03-11T10:00:00Z',
    description: 'Date and time when the user record was created.',
    format: 'date-time',
  })
  createdAt: Date;
}
