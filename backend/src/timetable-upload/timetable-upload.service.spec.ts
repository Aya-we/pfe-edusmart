import { Test, TestingModule } from '@nestjs/testing';
import { TimetableUploadService } from './timetable-upload.service';

describe('TimetableUploadService', () => {
  let service: TimetableUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimetableUploadService],
    }).compile();

    service = module.get<TimetableUploadService>(TimetableUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
