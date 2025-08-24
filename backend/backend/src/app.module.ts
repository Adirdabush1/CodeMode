import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AiAnalyzeModule } from './ai-analyze/ai-analyze.module';
import { JudgeController } from './judge.controller';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    AuthModule,
    AiAnalyzeModule,
  ],
  controllers: [AppController, JudgeController], // ✅ הוספנו את JudgeController
  providers: [AppService],
})
export class AppModule {}
