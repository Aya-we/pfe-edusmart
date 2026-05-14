import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ⚠️ Routes statiques EN PREMIER avant les routes dynamiques

  // POST /messages/send
  @Post('send')
  send(@Body() body: { senderId: string; receiverId: string; content: string }) {
    return this.messagesService.send(body.senderId, body.receiverId, body.content);
  }

  // GET /messages/conversations/:userId
  @Get('conversations/:userId')
  getConversations(@Param('userId') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  // GET /messages/:userId/:otherId  ← doit être après "conversations"
  @Get(':userId/:otherId')
  getMessages(
    @Param('userId')  userId:  string,
    @Param('otherId') otherId: string,
  ) {
    return this.messagesService.getMessages(userId, otherId);
  }
}
