import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  // Toutes les conversations d'un user (liste des interlocuteurs uniques)
  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender:   { select: { id: true, firstName: true, lastName: true, role: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Grouper par interlocuteur
    const contactsMap = new Map<string, any>();
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const other   = msg.senderId === userId ? msg.receiver  : msg.sender;
      if (!contactsMap.has(otherId)) {
        contactsMap.set(otherId, {
          id:          otherId,
          name:        `${other.firstName} ${other.lastName}`,
          role:        other.role,
          lastMessage: msg.content,
          time:        msg.createdAt,
          unread:      0,
        });
      }
    }

    // Compter les non-lus
    const unreadCounts = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: userId, isRead: false },
      _count: { id: true },
    });
    unreadCounts.forEach(u => {
      if (contactsMap.has(u.senderId)) {
        contactsMap.get(u.senderId).unread = u._count.id;
      }
    });

    return Array.from(contactsMap.values());
  }

  // Messages entre deux users
  async getMessages(userId: string, otherId: string) {
    // Marquer comme lus
    await this.prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, isRead: false },
      data:  { isRead: true },
    });

    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId,  receiverId: otherId },
          { senderId: otherId, receiverId: userId  },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // Envoyer un message
  async send(senderId: string, receiverId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender:   { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
