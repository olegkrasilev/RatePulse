import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const { email, name, password } = dto;

    this.logger.log(
      `[createUser] 🚀 Starting user creation process for: ${email}`,
    );

    this.logger.log(
      `[createUser] 🔍 Step 1: Checking if user with email "${email}" already exists`,
    );
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(
        `[createUser] 🚫 Step 1 Failed: User with email "${email}" already exists. Throwing Conflict error`,
      );
      throw new UserAlreadyExistsError(email);
    }

    this.logger.log(`[createUser] 🔐 Step 2: Hashing password...`);
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    this.logger.log(
      `[createUser] 💾 Step 3: Mapping data to User entity and saving to database`,
    );
    const user = this.usersRepository.create({
      name,
      email,
      password_hash: passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);

    this.logger.log(
      `[createUser] ✅ Step 4: User successfully created and saved with ID: ${savedUser.id}`,
    );

    return savedUser;
  }
}
