import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API documentation for Ecommerce')
    .setVersion('1.0.1')
    .addBearerAuth( { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', ) 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 

  await app.listen(process.env.PORT ?? 5000);
  console.log('http://localhost:5000')
}
bootstrap();
