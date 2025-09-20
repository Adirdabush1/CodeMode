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
import { QuestionsModule } from './questions/questions.module';
import { PostsModule } from './posts/posts.module';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(mongoUri),
    UserModule,
    AuthModule,
    AiAnalyzeModule,
    QuestionsModule,
    PostsModule,
  ],
  controllers: [AppController, JudgeController], // ✅ JudgeController זמין עכשיו
  providers: [AppService],
})
export class AppModule {}
