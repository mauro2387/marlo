import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MarLo Cookies API')
    .setDescription('Sistema completo de e-commerce y CRM para MarLo Cookies')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('products', 'Catálogo de productos')
    .addTag('orders', 'Gestión de pedidos')
    .addTag('loyalty', 'Sistema de puntos')
    .addTag('coupons', 'Cupones y promociones')
    .addTag('finance', 'Finanzas y caja')
    .addTag('config', 'Configuración del sistema')
    .addTag('notifications', 'Notificaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`
  🍪 MarLo Cookies API
  ═══════════════════════════════════════
  🚀 Server running on: http://localhost:${port}
  📚 API Docs: http://localhost:${port}/api/docs
  🌍 Environment: ${process.env.NODE_ENV}
  ═══════════════════════════════════════
  `);
}

bootstrap();
