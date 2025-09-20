import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorAvatar?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorAvatar?: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
