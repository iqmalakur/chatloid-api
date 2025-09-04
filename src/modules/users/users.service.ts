import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { UsersRepository } from './users.repository';
import { UserInfoResDto } from './users.dto';
import { UserUpdateFields } from './users.type';

@Injectable()
export class UsersService extends BaseService {
  public constructor(private readonly repository: UsersRepository) {
    super();
  }

  public async handleUserInfo(userId: string): Promise<UserInfoResDto> {
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User is not found!');
    }

    return user;
  }

  public async handleUserUpdate(
    userId: string,
    body: UserUpdateFields,
  ): Promise<UserInfoResDto> {
    await this.ensureUserExists(userId);
    await this.ensureUsernameAvailable(body.username);

    const updatedUser = await this.repository.updateUser(userId, body);
    if (!updatedUser) {
      throw new InternalServerErrorException();
    }

    return updatedUser;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User is not found!');
    }
  }

  private async ensureUsernameAvailable(username?: string) {
    if (!username) return;

    const usernameTaken = await this.repository.isUsernameTaken(username);
    if (usernameTaken) {
      throw new ConflictException('Username is not available');
    }
  }
}
