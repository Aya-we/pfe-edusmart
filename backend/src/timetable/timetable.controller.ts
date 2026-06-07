import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('all')
  getAllForSchool(@Query('schoolId') schoolId: string, @Query('period') period: string = 'Standard') {
    return this.timetableService.getAllForSchool(schoolId, period);
  }

  @Get('periods')
  getPeriods(@Query('schoolId') schoolId: string) {
    return this.timetableService.getPeriods(schoolId);
  }

  @Get('stats/hours')
  getTeacherHoursStats(@Query('schoolId') schoolId: string, @Query('period') period: string = 'Standard') {
    return this.timetableService.getTeacherHoursStats(schoolId, period);
  }

  @Get('mine')
  async getMine(@Query('userId') userId: string, @Query('role') role: string, @Query('period') period: string = 'Standard') {
    if (role === 'TEACHER') {
      return this.timetableService.getByTeacher(userId, period);
    } else if (role === 'STUDENT') {
      // Find student profile to get classId
      const student = await this.timetableService.getStudentByUserId(userId);
      if (student) {
        return this.timetableService.getByClass(student.classId, period);
      }
    }
    return [];
  }

  @Post('bulk')
  saveBulk(@Body() body: { schoolId: string, period: string, entries: any[] }) {
    return this.timetableService.saveBulk(body.schoolId, body.period || 'Standard', body.entries);
  }

  @Get('class/:classId')
  getByClass(@Param('classId') classId: string, @Query('period') period: string = 'Standard') {
    return this.timetableService.getByClass(classId, period);
  }

  @Get('teacher/:userId')
  getByTeacher(@Param('userId') userId: string, @Query('period') period: string = 'Standard') {
    return this.timetableService.getByTeacher(userId, period);
  }

  @Post()
  create(@Body() data: any) {
    return this.timetableService.createSlot(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timetableService.deleteSlot(id);
  }
}
