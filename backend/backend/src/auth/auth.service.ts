import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = (await this.userService.findByEmail(email)) as {
      email: string;
      password: string;
      _id: { toString(): string } | undefined;
    };
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Return user with proper type conversion
      return {
        email: user.email,
        id: user._id ? user._id.toString() : undefined, // Convert MongoDB _id to string safely
      };
    }
    return null;
  }

  async signup(email: string, password: string, name?: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = (await this.userService.create(
      email,
      hashedPassword,
      name,
    )) as { email: string; _id?: { toString(): string } };
    // Use consistent property name 'id' instead of '_id'
    if (!user || !user._id) {
      throw new UnauthorizedException('User creation failed');
    }
    return this.login({ email: user.email, id: user._id.toString() });
  }

  login(user: { email: string; id: string }) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
