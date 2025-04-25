import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // o el puerto donde corre tu frontend
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Elimina propiedades desconocidas
    forbidNonWhitelisted: true,    // Lanza error si vienen propiedades no permitidas
    transform: true,               // Convierte tipos automáticamente (por ejemplo: string a number)
  }));
  await app.listen(3000);
}
bootstrap();
