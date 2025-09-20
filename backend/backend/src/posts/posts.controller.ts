import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, Comment } from './posts.schema';
import { CreatePostDto } from './create-post.dto';
import { CreateCommentDto } from './create-comment.dto';
import { Controller } from '@nestjs/common';
@Controller('posts')
export class PostsController {
  // כאן השיטות שלך
}
@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(
    authorName: string,
    authorAvatar: string | undefined,
    dto: CreatePostDto,
  ) {
    const post = new this.postModel({
      authorName,
      authorAvatar,
      ...dto,
      likes: 0,
      comments: [],
    });
    return post.save();
  }

  async getPosts(page = 1, limit = 10) {
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async toggleLike(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    post.likes = post.likes + 1;
    await post.save();
    return post;
  }

  async addComment(
    postId: string,
    authorName: string,
    authorAvatar: string | undefined,
    dto: CreateCommentDto,
  ) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    post.comments.push({
      authorName,
      authorAvatar,
      content: dto.content,
      createdAt: new Date(),
    } as Comment);
    await post.save();
    return post;
  }
}
