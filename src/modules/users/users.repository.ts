import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserInfoSelection, UserUpdateFields } from './users.type';

@Injectable()
export class UsersRepository extends BaseRepository {
  public async findUserById(userId: string): Promise<UserInfoSelection | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        picture: true,
      },
    });
  }

  public async isUsernameTaken(username: string): Promise<boolean> {
    const result = await this.prisma.user.count({
      where: { username },
    });
    return result > 0;
  }

  public async updateUser(
    id: string,
    data: UserUpdateFields,
  ): Promise<UserInfoSelection | null> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        picture: true,
      },
    });
  }
}
