import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({}),
  ],
  providers: [ResourcesService],
  controllers: [ResourcesController],
})
export class ResourcesModule {}
