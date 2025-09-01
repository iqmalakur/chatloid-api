import { LoggerUtil } from 'src/utils/logger.util';

export abstract class BaseService {
  protected readonly logger: LoggerUtil;
  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }
}
