import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // מאפשר אמון בפרוקסי (חשוב לרנדר/הרוקו)
  app.set('trust proxy', 1);

  app.use(cookieParser());

  const allowedOrigins = [
    'https://www.codemoode.com',
    'https://codemode.onrender.com',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true); // למשל curl/postman
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 5000);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap app:', err);
  process.exit(1);
});
