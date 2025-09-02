import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserInsert, UserSelection } from './auth.type';

@Injectable()
export class AuthRepository extends BaseRepository {
  public async findUserByGoogleId(
    googleId: string,
  ): Promise<UserSelection | null> {
    return this.prisma.user.findFirst({
      select: { id: true },
      where: { googleId },
    });
  }

  public async isUsernameTaken(username: string): Promise<boolean> {
    return (await this.prisma.user.count({ where: { username } })) > 0;
  }

  public async saveUser(user: UserInsert): Promise<UserSelection | null> {
    return this.prisma.user.create({
      data: {
        googleId: user.googleId,
        name: user.name,
        username: user.username,
        email: user.email,
        picture: user.picture,
      },
      select: { id: true },
    });
  }
}
