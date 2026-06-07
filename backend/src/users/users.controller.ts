import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: string, @Query('schoolId') schoolId?: string) {
    try {
      return await this.usersService.findAll(role, schoolId);
    } catch (e: any) {
      return { error: String(e), stack: e.stack };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/teacher-dashboard')
  async getTeacherDashboard(@Param('id') id: string) {
    try {
      return await this.usersService.getTeacherDashboardData(id);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.usersService.update(id, data);
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
