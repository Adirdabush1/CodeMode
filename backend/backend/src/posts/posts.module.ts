// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [PostsService],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  controllers: [PostsController],
})
export class PostsModule {}
