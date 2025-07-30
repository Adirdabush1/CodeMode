import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.validateUser(body.email, body.password);
  }

  @Post('signup')
  signup(@Body() body: { email: string; password: string; name?: string }) {
    return this.authService.signup(body.email, body.password, body.name);
  }
}
