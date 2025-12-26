import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { inspect } from 'util';
import { QuestionDocument } from './question.schema';

export interface QuestionItem {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  tags?: string[];
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  tests?: Array<{ input: string; output: string; hidden?: boolean }>;
  createdBy?: string | null;
  [key: string]: any;
}

/** טיפוס לגבי מה .lean() יכול להחזיר */
interface LeanQuestion {
  _id: Types.ObjectId | string | null;
  name?: string;
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  tags?: string[];
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  tests?: Array<{ input: string; output: string; hidden?: boolean }>;
  createdBy?: Types.ObjectId | string | null;
  [key: string]: any;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('Question') private questionModel: Model<QuestionDocument>,
  ) {}

  private idToString(id: unknown): string {
    // אם אין id פשוט נחזיר מחרוזת ריקה (מונע 'no-base-to-string' warnings)
    if (id == null) return '';
    // אם זה ObjectId של mongoose
    if (id instanceof Types.ObjectId) return id.toHexString();
    // אם זה כבר string
    if (typeof id === 'string') return id;
    // אחרת — לא מאחזר/מחרוזת באופן גס, נחזיר ריק
    return '';
  }

  async find(
    filter: Record<string, unknown> = {},
    page = 1,
    pageSize = 30,
  ): Promise<{
    items: QuestionItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    try {
      // קודם await, אחר כך 'cast' דרך unknown => LeanQuestion[] (TS המליץ על זה)
      const itemsRawAny = await this.questionModel
        .find(filter)
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec();
      const total = await this.questionModel.countDocuments(filter);

      const itemsRaw = itemsRawAny as unknown as LeanQuestion[];

      const items: QuestionItem[] = (itemsRaw ?? []).map((doc) => {
        const _id = this.idToString(doc._id);
        const createdBy = doc.createdBy
          ? this.idToString(doc.createdBy)
          : undefined;

        const languageNormalized =
          typeof doc.language === 'string'
            ? doc.language.toLowerCase()
            : doc.language;
        const title = doc.title ?? doc.name ?? 'Untitled';

        return {
          _id,
          name: doc.name,
          title,
          description: doc.description,
          difficulty: doc.difficulty,
          language: languageNormalized,
          tags: doc.tags,
          examples: doc.examples,
          tests: doc.tests,
          createdBy,
        };
      });

      return { items, total, page, pageSize };
    } catch (err: unknown) {
      // שימוש ב-inspect כדי למנוע 'no-base-to-string' על err ולראות מבנה תקין
      const msg =
        err instanceof Error
          ? `${err.message}\n${err.stack ?? ''}`
          : inspect(err, { depth: null });
      console.error('QuestionsService.find error:', msg);
      return { items: [], total: 0, page, pageSize };
    }
  }

  async findById(id: string): Promise<QuestionItem | null> {
    try {
      const docAny = await this.questionModel.findById(id).lean().exec();
      const doc = docAny as unknown as LeanQuestion | null;
      if (!doc) return null;

      const _id = this.idToString(doc._id);
      const createdBy = doc.createdBy
        ? this.idToString(doc.createdBy)
        : undefined;
      const title = doc.title ?? doc.name ?? 'Untitled';
      const languageNormalized =
        typeof doc.language === 'string'
          ? doc.language.toLowerCase()
          : doc.language;

      return {
        _id,
        name: doc.name,
        title,
        description: doc.description,
        difficulty: doc.difficulty,
        language: languageNormalized,
        tags: doc.tags,
        examples: doc.examples,
        tests: doc.tests,
        createdBy,
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? `${err.message}\n${err.stack ?? ''}`
          : inspect(err, { depth: null });
      console.error('QuestionsService.findById error:', msg);
      return null;
    }
  }

  async distinctTags() {
    return this.questionModel.distinct('tags').exec();
  }

  async distinctLanguages() {
    return this.questionModel.distinct('language').exec();
  }
}
