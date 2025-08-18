import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { access_token } = await this.authService.loginUser(
      body.email,
      body.password,
    );

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: true, // חובה אם sameSite: 'none'
      sameSite: 'none', // מאפשר שליחת קוקי בין דומיינים
      maxAge: 1000 * 60 * 60 * 24 * 7, // שבוע
    });

    return res.send({ message: 'Logged in successfully' });
  }

  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name?: string },
    @Res() res: Response,
  ) {
    const { access_token } = await this.authService.signup(
      body.email,
      body.password,
      body.name,
    );

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.send({ message: 'Signed up successfully' });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.send({ message: 'Logged out successfully' });
  }
}
