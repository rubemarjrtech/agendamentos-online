import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import schedulingConfig from './config/scheduling-config';
import { CacheModule } from '@cache/cache.module';
import { DatabaseModule } from '@database/database.module';
import { TokenModule } from '@token/token.module';

@Module({
  imports: [ConfigModule.forFeature(schedulingConfig), CacheModule, DatabaseModule, TokenModule],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
