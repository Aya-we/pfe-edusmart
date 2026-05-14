import { Test, TestingModule } from '@nestjs/testing';
import { TimetableUploadController } from './timetable-upload.controller';

describe('TimetableUploadController', () => {
  let controller: TimetableUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimetableUploadController],
    }).compile();

    controller = module.get<TimetableUploadController>(TimetableUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
