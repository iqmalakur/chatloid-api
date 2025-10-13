import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MongoService } from './mongo.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: MongoService,
      useFactory: async () => {
        const service = new MongoService();
        await service.onModuleInit();
        return service;
      },
    },
  ],
  exports: [PrismaService, MongoService],
})
export class SharedModule {}
