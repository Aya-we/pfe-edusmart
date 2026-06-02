import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(@Query('schoolId') schoolId?: string) {
    return this.subjectsService.findAll(schoolId);
  }

  @Post()
  create(@Body() data: any) {
    return this.subjectsService.create(data);
  }
}
