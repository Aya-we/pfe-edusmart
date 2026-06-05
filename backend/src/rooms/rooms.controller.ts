import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: { name: string, capacity?: number, schoolId: string }) {
    return this.roomsService.create(createRoomDto, createRoomDto.schoolId);
  }

  @Get()
  findAll(@Query('schoolId') schoolId: string) {
    return this.roomsService.findAll(schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string, capacity?: number }) {
    return this.roomsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
