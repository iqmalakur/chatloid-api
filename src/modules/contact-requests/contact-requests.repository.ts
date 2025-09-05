import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';

@Injectable()
export class ContactRequestsRepository extends BaseRepository {}
