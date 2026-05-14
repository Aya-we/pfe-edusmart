import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GradesModule } from './grades/grades.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ClassesModule } from './classes/classes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TimetableModule } from './timetable/timetable.module';
import { AiModule } from './ai/ai.module';
import { ResourcesModule } from './resources/resources.module';
import { SchoolsModule } from './schools/schools.module';
import { UsersModule } from './users/users.module';
import { TimetableUploadModule } from './timetable-upload/timetable-upload.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GradesModule,
    SubjectsModule,
    ClassesModule,
    AttendanceModule,
    NotificationsModule,
    TimetableModule,
    AiModule,
    ResourcesModule,
    SchoolsModule,
    UsersModule,
    TimetableUploadModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
