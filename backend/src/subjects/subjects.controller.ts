import { Controller, Get, Post, Body } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.subjectsService.create(data);
  }
}
