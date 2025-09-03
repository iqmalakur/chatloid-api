import { LoggerUtil } from 'src/utils/logger.util';
import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseRepository {
  protected readonly logger: LoggerUtil;
  public constructor(protected readonly prisma: PrismaService) {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
