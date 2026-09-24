import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Initialize Supabase client
  const supabaseUrl = configService.get<string>('SUPABASE_URL') || '';
  const supabaseKey = configService.get<string>('SUPABASE_SECRET_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Make Supabase client available throughout the app
  app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).supabase = supabase;
    next();
  });

  await app.listen(configService.get<number>('PORT', 3000));
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
