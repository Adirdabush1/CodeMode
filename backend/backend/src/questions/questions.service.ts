import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionDocument } from './question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('Question') private questionModel: Model<QuestionDocument>,
  ) {}

  async find(filter = {}, page = 1, pageSize = 30) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.questionModel.find(filter).skip(skip).limit(pageSize).lean().exec(),
      this.questionModel.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async findById(id: string) {
    return this.questionModel.findById(id).lean().exec();
  }

  async distinctTags() {
    return this.questionModel.distinct('tags').exec();
  }

  async distinctLanguages() {
    return this.questionModel.distinct('language').exec();
  }
}
