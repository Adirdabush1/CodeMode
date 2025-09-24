//user.controller
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    const { email } = req.user as { email: string };
    const user = await this.userService.findByEmail(email);

    if (!user) return { message: 'User not found' };

    return {
      id: user._id,
      email: user.email,
      name: user.name || '',
      avatarUrl: user.avatarUrl || '',
      title: user.title || '',
      description: user.description || '',
      points: user.points || 0,
      level: user.level || '1',
      exercisesSolved: user.exercisesSolved || 0,
      successRate: user.successRate || 0,
      avgSolveTime: user.avgSolveTime || 'N/A',
      githubUrl: user.githubUrl || '',
      status: user.status || 'Active',
      badges: user.badges || [],
      solvedExercises: user.solvedExercises || [], // נוסיף החזרה של תרגילים שנפתרו
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-solved')
  async addSolved(
    @Req() req: Request,
    @Body() body: { exerciseId: string; code: string },
  ) {
    const { email } = req.user as { email: string };
    if (!body.exerciseId || !body.code) {
      return { message: 'Missing exerciseId or code' };
    }

    const updatedUser = await this.userService.addSolvedExercise(
      email,
      body.exerciseId,
      body.code,
    );

    return {
      message: 'Exercise saved successfully',
      solvedExercises: updatedUser.solvedExercises,
    };
  }
}
