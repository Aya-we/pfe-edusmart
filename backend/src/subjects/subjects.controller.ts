import { Controller, Get, Post, Body, Put, Patch, Delete, Param, Query } from '@nestjs/common';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.subjectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
