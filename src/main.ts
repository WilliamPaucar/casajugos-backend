import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path'; // 👈 Import necesario para las rutas
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 Tipo Express

async function bootstrap() {
  // 👇 Indicar que la app es NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Carpeta pública de imágenes
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL pública
  });

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: true, // o el puerto donde corre tu frontend
    credentials: true,
  });

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades desconocidas
      forbidNonWhitelisted: true, // Lanza error si vienen propiedades no permitidas
      transform: true, // Convierte tipos automáticamente (ej: string a number)
    }),
  );

  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();
