import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService extends BaseService {
  public constructor(private readonly repository: UsersRepository) {
    super();
  }
}
