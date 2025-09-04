import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository {}
