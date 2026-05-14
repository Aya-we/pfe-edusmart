import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
  
  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.classesService.findByTeacher(teacherId);
  }

  @Post()
  create(@Body() data: any) {
    return this.classesService.createClass(data);
  }

  @Get(':id/students')
  findStudents(@Param('id') id: string) {
    return this.classesService.findStudentsByClass(id);
  }
}
