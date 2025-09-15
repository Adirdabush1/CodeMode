import { Controller, Get, Query, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QueryQuestionsDto } from './query-questions.dto';

interface QuestionFilter {
  language?: string;
  difficulty?: string;
  tags?: string;
  $text?: { $search: string };
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly svc: QuestionsService) {}

  @Get()
  async list(@Query() query: QueryQuestionsDto) {
    const language =
      typeof query.language === 'string' ? query.language : undefined;
    const difficulty =
      typeof query.difficulty === 'string' ? query.difficulty : undefined;
    const tag = typeof query.tag === 'string' ? query.tag : undefined;
    const q = typeof query.q === 'string' ? query.q : undefined;

    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Number(query.pageSize) || 30);

    const filter: QuestionFilter = {};
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    // שליפה מהשירות (כולל items, total, page, pageSize)
    return this.svc.find(filter, page, pageSize);
  }

  @Get('tags')
  async tags() {
    const tags = await this.svc.distinctTags();
    return { tags };
  }

  @Get('languages')
  async languages() {
    const languages = await this.svc.distinctLanguages();
    return { languages };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
