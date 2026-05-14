import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { GradesService } from './grades.service';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() data: any) {
    return this.gradesService.create(data);
  }

  @Get('class/:classId/subject/:subjectId')
  findByClassAndSubject(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.gradesService.findAllByClassAndSubject(classId, subjectId);
  }

  @Get('averages/:userId')
  getAverages(@Param('userId') userId: string) {
    return this.gradesService.getStudentAverages(userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { value: number; comment?: string }) {
    return this.gradesService.update(id, data.value, data.comment);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradesService.delete(id);
  }
}
