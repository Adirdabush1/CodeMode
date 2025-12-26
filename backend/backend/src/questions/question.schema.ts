import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  name: string;

  @Prop()
  slug?: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['easy', 'medium', 'hard'], default: 'easy' })
  difficulty: 'easy' | 'medium' | 'hard';

  @Prop({ index: true })
  language: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: [{ input: String, output: String, explanation: String }],
    default: [],
  })
  examples?: Array<{ input: string; output: string; explanation?: string }>;

  @Prop({
    type: [{ input: String, output: String, hidden: Boolean }],
    default: [],
  })
  tests?: Array<{ input: string; output: string; hidden?: boolean }>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({ name: 'text', description: 'text', tags: 1 });
