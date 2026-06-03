import { Controller, Get, Post, Body, Param, Query, Put, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'justifications');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  async markBulk(@Body() data: any) {
    try {
      return await this.attendanceService.markBulk({
        ...data,
        date: new Date(data.date),
      });
    } catch (error: any) {
      console.error('Error in markBulk:', error);
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('class/:classId')
  findByClass(@Param('classId') classId: string, @Query('date') date: string) {
    return this.attendanceService.findByClassAndDate(classId, new Date(date));
  }

  @Get('student/:userId')
  getStudentAttendance(@Param('userId') userId: string) {
    return this.attendanceService.getStudentAttendance(userId);
  }

  @Post(':id/submit-justification')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: require('node:path').join(process.cwd(), 'uploads', 'justifications'),
      filename: (req, file, cb) => {
        const ext = require('node:path').extname(file.originalname);
        const name = require('node:path').basename(file.originalname, ext).replaceAll(/\\s+/g, '_');
        cb(null, `${name}_${Date.now()}${ext}`);
      },
    }),
  }))
  submitJustification(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Aucun fichier fourni', HttpStatus.BAD_REQUEST);
    }
    const fileUrl = `/uploads/justifications/${file.filename}`;
    return this.attendanceService.submitJustification(id, fileUrl);
  }

  @Get('pending')
  getPending(@Query('schoolId') schoolId: string) {
    return this.attendanceService.getPendingJustifications(schoolId);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.attendanceService.approveJustification(id);
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.attendanceService.rejectJustification(id);
  }
}
