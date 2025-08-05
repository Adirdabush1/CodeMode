import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalyzeService } from './ai-analyze.service';

describe('AiAnalyzeService', () => {
  let service: AiAnalyzeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAnalyzeService],
    }).compile();

    service = module.get<AiAnalyzeService>(AiAnalyzeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
