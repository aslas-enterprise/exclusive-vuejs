/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {  ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { CustomLoggerService } from './app/logger/logger.service';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { HttpLoggerInterceptor } from './app/interceptors/http-logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get logger service
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  
  // Global HTTP logger interceptor
  app.useGlobalInterceptors(new HttpLoggerInterceptor(logger));
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS for frontend connection
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Exclusive API')
    .setDescription('The Exclusive application API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  // Use custom logger for startup messages
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    'Bootstrap'
  );
  logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`,
    'Bootstrap'
  );
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
}

bootstrap();
