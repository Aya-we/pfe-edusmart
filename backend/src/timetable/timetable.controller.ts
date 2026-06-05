import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('timetable')
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('all')
  getAllForSchool(@Request() req) {
    return this.timetableService.getAllForSchool(req.user.schoolId);
  }

  @Get('mine')
  async getMine(@Request() req) {
    const user = req.user;
    if (user.role === 'TEACHER') {
      return this.timetableService.getByTeacher(user.id);
    } else if (user.role === 'STUDENT') {
      // Find student profile to get classId
      const student = await this.timetableService.getStudentByUserId(user.id);
      if (student) {
        return this.timetableService.getByClass(student.classId);
      }
    }
    return [];
  }

  @Post('bulk')
  saveBulk(@Request() req, @Body() entries: any[]) {
    return this.timetableService.saveBulk(req.user.schoolId, entries);
  }

  @Get('class/:classId')
  getByClass(@Param('classId') classId: string) {
    return this.timetableService.getByClass(classId);
  }

  @Get('teacher/:userId')
  getByTeacher(@Param('userId') userId: string) {
    return this.timetableService.getByTeacher(userId);
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
