import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name?: string;
  @Prop()
  avatarUrl?: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: '1' })
  level: string;

  @Prop({ default: 0 })
  exercisesSolved: number;

  @Prop({ default: 0 })
  successRate: number;

  @Prop()
  avgSolveTime?: string;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop()
  githubUrl?: string;

  @Prop({ default: 'Active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true }); // Ensure email is unique
