//auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
interface UserType {
  email: string;
  password: string;
  _id: Types.ObjectId | string;
  // שדות נוספים אם יש
}
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = (await this.userService.findByEmail(email)) as UserType | null;
    if (user && (await bcrypt.compare(pass, user.password))) {
      return {
        email: user.email,
        id:
          typeof user._id === 'string'
            ? user._id
            : user._id instanceof Types.ObjectId
              ? user._id.toHexString()
              : '',
      };
    }
    return null;
  }

  async loginUser(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.login(user);
  }

  async signup(email: string, password: string, name?: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword, name);
    if (!user || !user._id) {
      throw new UnauthorizedException('User creation failed');
    }
    return this.login({
      email: user.email,
      id:
        typeof user._id === 'string'
          ? user._id
          : user._id instanceof Types.ObjectId &&
              typeof user._id.toHexString === 'function'
            ? user._id.toHexString()
            : '',
    });
  }

  login(user: { email: string; id: string }) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
