import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ROUTES } from '../../common/constants/routes/routes';
import { CreateUserResponseDto } from './dto/create-user-respose.dto';

@ApiTags('Users')
@Controller(ROUTES.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a user record in the database and returns the user object excluding the password.',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g., invalid email or weak password).',
  })
  @ApiConflictResponse({
    description: 'A user with this email address already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server-side error. Please try again later.',
  })
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    return this.usersService.createUser(dto);
  }
}
