import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/envs';
import { Logger } from '@nestjs/common/services/logger.service';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { RpcCustomExceptionFilter } from './common';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new RpcCustomExceptionFilter());
  await app.listen(env.port);

  logger.log(`Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
