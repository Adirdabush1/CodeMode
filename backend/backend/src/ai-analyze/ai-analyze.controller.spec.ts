import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalyzeController } from './ai-analyze.controller';

describe('AiAnalyzeController', () => {
  let controller: AiAnalyzeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAnalyzeController],
    }).compile();

    controller = module.get<AiAnalyzeController>(AiAnalyzeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
