import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // מפעיל CORS - אפשר גם להגדיר הגבלות
  app.enableCors({
    origin: 'https://codemode.onrender.com', // הכתובת של הפרונטאנד שלך
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap app:', err);
  process.exit(1);
});
