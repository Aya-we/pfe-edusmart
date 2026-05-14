import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { prompt: string; context?: any }) {
    const response = await this.aiService.generateResponse(body.prompt, body.context);
    return { response };
  }
}
