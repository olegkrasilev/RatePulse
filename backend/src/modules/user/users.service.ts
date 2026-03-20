import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';
import { CreateUserDto } from './dto/create-user.dto';
import { PASSWORD_SALT_ROUNDS } from '../../common/constants/password/password-salt';
import { CreateUserResponseDto } from './dto/create-user-respose.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const { email, name, password } = dto;
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      // this.logger.warn(
      //   { email },
      //   'user creation failed: email already exists (pre-check)',
      // );
      throw new UserAlreadyExistsError(email);
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const user = this.usersRepository.create({
      name,
      email,
      password_hash: passwordHash,
    });
    const savedUser = await this.usersRepository.save(user);

    // this.logger.info(
    //   { userId: savedUser.id, email: savedUser.email },
    //   'user created successfully',
    // );

    return savedUser;
  }
}
