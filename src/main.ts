import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // validation pipe for DTO validation

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // telling the main app to use validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();

  await app.listen(process.env.PORT ?? 5000);
  console.log('http://localhost:5000')
}
bootstrap();
