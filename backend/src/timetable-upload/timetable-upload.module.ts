import { Module } from '@nestjs/common';
import { TimetableUploadService } from './timetable-upload.service';
import { TimetableUploadController } from './timetable-upload.controller';

@Module({
  providers: [TimetableUploadService],
  controllers: [TimetableUploadController]
})
export class TimetableUploadModule {}
