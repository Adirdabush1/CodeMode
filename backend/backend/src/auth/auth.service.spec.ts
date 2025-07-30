import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

// הגדרת טיפוס User שכולל _id כ-string
interface User {
  _id: string;
  email: string;
  password: string;
  name?: string;
  // ... שדות נוספים אם יש
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = (await this.userService.findByEmail(email)) as User | null;

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Exclude password from the returned user object
      const { password: _password, ...result } = user;
      void _password; // כדי למנוע אזהרת unused variable
      return result;
    }

    return null;
  }

  login(user: { email: string; _id: string }): { access_token: string } {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(email: string, password: string, name?: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // מניח שה-create מחזיר User עם שדה _id
    const user = (await this.userService.create(
      email,
      hashedPassword,
      name,
    )) as User;

    return this.login({ email: user.email, _id: user._id.toString() });
  }
}
