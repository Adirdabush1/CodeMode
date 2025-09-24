// auth.controller.ts - הגרסה המתוקנת
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const COOKIE_NAME = 'jwt';
const COOKIE_OPTIONS = (production = false) => ({
  httpOnly: true,
  secure: production, // רק בפרודקשן
  sameSite: 'none' as const, // חשוב ל־cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים
  path: '/',
  // domain: '.codemoode.com' // אפשר להפעיל אם צריכים שיתוף בין סאב־דומיינים
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.signup(
      body.email,
      body.password,
      body.name,
    );

    res.cookie(
      COOKIE_NAME,
      access_token,
      COOKIE_OPTIONS(process.env.NODE_ENV === 'production'),
    );

    return { message: 'Signed up successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.loginUser(
      body.email,
      body.password,
    );

    res.cookie(
      COOKIE_NAME,
      access_token,
      COOKIE_OPTIONS(process.env.NODE_ENV === 'production'),
    );

    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    // חשוב לנקות עם אותם פרמטרים (path, domain אם הוגדר)
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      // domain: '.codemoode.com'
    });
    return { message: 'Logged out successfully' };
  }

  // אופציונלי: מחזיר את ה־payload/פרטי משתמש מתוך ה־jwt
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
