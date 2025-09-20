import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './create-post.dto';
import { CreateCommentDto } from './create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getPosts(1);
  }

  @Post()
  createPost(@Body() dto: CreatePostDto) {
    // hardcoded user לדוגמה
    return this.postsService.createPost(
      'Adir',
      'https://i.pravatar.cc/150',
      dto,
    );
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.postsService.addComment(
      id,
      'Adir',
      'https://i.pravatar.cc/150',
      dto,
    );
  }

  @Post(':id/like')
  likePost(@Param('id') id: string) {
    return this.postsService.toggleLike(id);
  }
}
