import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
