import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserInfoSelection } from './users.type';

@Injectable()
export class UsersRepository extends BaseRepository {
  public async findUserById(userId: string): Promise<UserInfoSelection | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        username: true,
        picture: true,
      },
    });
  }
}
