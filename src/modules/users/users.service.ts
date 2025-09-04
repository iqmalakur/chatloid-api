import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { UsersRepository } from './users.repository';
import { UserInfoResDto } from './users.dto';

@Injectable()
export class UsersService extends BaseService {
  public constructor(private readonly repository: UsersRepository) {
    super();
  }

  public async handleUserInfo(userId: string): Promise<UserInfoResDto> {
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan!');
    }

    return user;
  }
}
