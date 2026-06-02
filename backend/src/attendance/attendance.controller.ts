import { Controller, Get, Post, Body, Param, Query, Put, HttpException, HttpStatus } from '@nestjs/common';
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
  submitJustification(@Param('id') id: string, @Body() data: { fileUrl: string }) {
    return this.attendanceService.submitJustification(id, data.fileUrl);
  }

  @Get('pending')
  getPending() {
    return this.attendanceService.getPendingJustifications();
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
