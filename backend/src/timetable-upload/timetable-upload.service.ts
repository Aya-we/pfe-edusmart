import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'timetables');

@Injectable()
export class TimetableUploadService {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  // Récupère le dernier PDF pour un type : 'students' ou 'teachers'
  getLatest(type: 'students' | 'teachers'): { filename: string; filePath: string } | null {
    if (!fs.existsSync(UPLOAD_DIR)) return null;
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter(f => f.startsWith(`${type}_`) && f.endsWith('.pdf'));
    if (files.length === 0) return null;
    files.sort((a, b) => {
      const sa = fs.statSync(path.join(UPLOAD_DIR, a));
      const sb = fs.statSync(path.join(UPLOAD_DIR, b));
      return sb.mtimeMs - sa.mtimeMs;
    });
    return { filename: files[0], filePath: path.join(UPLOAD_DIR, files[0]) };
  }

  getUploadDir(): string { return UPLOAD_DIR; }
}
