import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { ROUTES } from '../../common/constants/routes/routes';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(ROUTES.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(dto);
  }
}
