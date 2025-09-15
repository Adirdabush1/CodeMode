import { Controller, Get, Query, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QueryQuestionsDto } from './query-questions.dto';

interface QuestionFilter {
  language?: string | { $regex: string; $options?: string };
  difficulty?: string;
  tags?: string;
  $text?: { $search: string };
  [key: string]: unknown; // <-- כאן
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly svc: QuestionsService) {}

  // src/questions/questions.controller.ts (חלק מתוך הקובץ)
  @Get()
  async list(@Query() query: QueryQuestionsDto & { debug?: string }) {
    const languageRaw =
      typeof query.language === 'string' ? query.language : undefined;
    const language = languageRaw ? languageRaw.toLowerCase() : undefined;
    const difficulty =
      typeof query.difficulty === 'string' ? query.difficulty : undefined;
    const tag = typeof query.tag === 'string' ? query.tag : undefined;
    const q = typeof query.q === 'string' ? query.q : undefined;

    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Number(query.pageSize) || 30);

    const filter: QuestionFilter = {};
    if (language) {
      // שימוש ב־regex לא חצאי (case-insensitive) כדי להתאים ערכים כמו "JavaScript" ו-"javascript"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (filter as any).language = { $regex: `^${language}$`, $options: 'i' };
    }
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    console.log(
      'QuestionsController.list - built filter:',
      JSON.stringify(filter),
      'raw query:',
      query,
    );

    // debug=true => return all docs (bypass filter) for troubleshooting
    if (query.debug === 'true') {
      return this.svc.find({}, 1, 1000);
    }

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
