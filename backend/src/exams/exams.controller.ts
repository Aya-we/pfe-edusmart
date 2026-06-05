import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() data: { title: string, date: string, classId: string, subjectId: string, schoolId: string }) {
    return this.examsService.create(data);
  }

  @Get()
  findAll(@Query('schoolId') schoolId: string) {
    return this.examsService.findAll(schoolId);
  }
  
  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.examsService.findByClass(classId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
