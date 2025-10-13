import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { MONGODB_URL } from 'src/configs/mongo.config';
import { LoggerUtil } from 'src/utils/logger.util';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerUtil;
  private client: MongoClient;
  private database: Db;

  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public getDatabase(): Db {
    return this.database;
  }

  public async onModuleInit() {
    if (this.database) return;

    const uri = MONGODB_URL;

    if (!uri) {
      throw new Error('MONGODB_URL is not defined');
    }

    this.client = new MongoClient(uri);

    try {
      await this.client.connect();
      this.database = this.client.db('chatloid_messages');
      this.logger.info('Connected to MongoDB');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async onModuleDestroy() {
    await this.client.close();
    this.logger.info('MongoDB connection closed');
  }
}
