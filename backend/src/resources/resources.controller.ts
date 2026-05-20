import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ResourcesService } from './resources.service';
import * as path from 'node:path';
import * as fs from 'node:fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resources');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }

  // ─── Upload fichier (PDF, vidéo, etc.) ──────────────────
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (req, file, cb) => {
        const ext  = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replaceAll(/\s+/g, '_');
        cb(null, `${name}_${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) throw new HttpException('Aucun fichier.', HttpStatus.BAD_REQUEST);

    const ext  = path.extname(file.originalname).toLowerCase();
    const type = ext === '.pdf' ? 'pdf'
               : ['.mp4', '.webm', '.mov'].includes(ext) ? 'video'
               : 'document';

    return this.resourcesService.create({
      title:     body.title || file.originalname,
      type,
      fileUrl:   `http://localhost:4000/uploads/resources/${file.filename}`,
      size:      `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      subjectId: body.subjectId || undefined,
      classId:   body.classId   || undefined,
      teacherId: body.teacherId || undefined,
    });
  }

  // ─── Créer ressource avec URL externe (legacy) ──────────
  @Post()
  create(@Body() data: any) {
    return this.resourcesService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcesService.delete(id);
  }
}
