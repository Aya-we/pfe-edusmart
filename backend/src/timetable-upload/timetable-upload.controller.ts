import {
  Controller, Post, Get, Res, Param,
  UseInterceptors, UploadedFile, HttpException, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { TimetableUploadService } from './timetable-upload.service';
import * as path from 'path';

const makeStorage = (prefix: string) => diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(process.cwd(), 'uploads', 'timetables')),
  filename: (req, file, cb) =>
    cb(null, `${prefix}_${Date.now()}.pdf`),
});

const pdfFilter = (req: any, file: any, cb: any) =>
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new HttpException('PDF uniquement.', HttpStatus.BAD_REQUEST), false);

@Controller('timetable-upload')
export class TimetableUploadController {
  constructor(private readonly service: TimetableUploadService) {}

  // ─── Admin : upload emploi étudiants ─────────────────────────────
  @Post('students')
  @UseInterceptors(FileInterceptor('file', {
    storage: makeStorage('students'),
    fileFilter: pdfFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new HttpException('Aucun fichier.', HttpStatus.BAD_REQUEST);
    return { message: 'Emploi du temps étudiants publié.', filename: file.filename };
  }

  // ─── Admin : upload emploi profs ──────────────────────────────────
  @Post('teachers')
  @UseInterceptors(FileInterceptor('file', {
    storage: makeStorage('teachers'),
    fileFilter: pdfFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadTeachers(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new HttpException('Aucun fichier.', HttpStatus.BAD_REQUEST);
    return { message: 'Emploi du temps profs publié.', filename: file.filename };
  }

  // ─── GET le PDF : students ou teachers ───────────────────────────
  @Get(':type')
  getFile(@Param('type') type: string, @Res() res: Response) {
    if (type !== 'students' && type !== 'teachers')
      throw new HttpException('Type invalide.', HttpStatus.BAD_REQUEST);
    const t = this.service.getLatest(type as 'students' | 'teachers');
    if (!t) throw new HttpException('Aucun emploi du temps disponible.', HttpStatus.NOT_FOUND);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${t.filename}"`);
    res.sendFile(t.filePath);
  }

  // ─── Check si un PDF existe ───────────────────────────────────────
  @Get('check/:type')
  check(@Param('type') type: string) {
    if (type !== 'students' && type !== 'teachers')
      return { available: false };
    const t = this.service.getLatest(type as 'students' | 'teachers');
    return { available: !!t, filename: t?.filename ?? null };
  }
}
