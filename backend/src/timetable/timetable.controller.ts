import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

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
