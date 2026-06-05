import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
  
  @Get()
  findAll(@Query('schoolId') schoolId?: string) {
    return this.classesService.findAll(schoolId);
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.classesService.findByTeacher(teacherId);
  }

  @Post()
  create(@Body() createClassDto: { name: string, studentCount?: number, schoolId: string }) {
    return this.classesService.createClass(createClassDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string, studentCount?: number }) {
    return this.classesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Get(':id/students')
  findStudents(@Param('id') id: string) {
    return this.classesService.findStudentsByClass(id);
  }
}
