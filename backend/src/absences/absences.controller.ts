import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { AbsencesService } from './absences.service';

@Controller('absences')
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Post()
  create(@Body() data: { teacherId: string, date: string, reason?: string, schoolId: string }) {
    return this.absencesService.create(data);
  }

  @Get()
  findAll(@Query('schoolId') schoolId: string) {
    return this.absencesService.findAll(schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.absencesService.remove(id);
  }
}
