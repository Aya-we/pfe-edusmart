import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'EduSmart API is Running';
  }

  @Get('migrate')
  async migrateDb(): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('npx -y prisma db push --accept-data-loss');
      return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    } catch (err: any) {
      return `ERROR:\n${err.message}\n\nSTDOUT:\n${err.stdout}\n\nSTDERR:\n${err.stderr}`;
    }
  }
}
