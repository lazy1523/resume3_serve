import { NestFactory } from '@nestjs/core';
import {Logger, ValidationPipe, VersioningType} from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export const IS_DEV = process.env.NODE_ENV !== 'production';

async function bootstrap() {
  const logger: Logger = new Logger('main.ts');

  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: IS_DEV ? ['log', 'debug', 'error', 'warn'] : ['error', 'warn'],
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get('app.port');
  const PREFIX = configService.get('app.apiPrefix');

  app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix(PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());

  
  const config = new DocumentBuilder()
    .setTitle('Resumes3 API') 
    .setDescription('web3 resumes api')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(PORT,'0.0.0.0');
  logger.log(`服务已经启动,接口请访问:http://wwww.localhost:${PORT}/${PREFIX}`);
  logger.log(`服务已经启动,文档请访问:http://wwww.localhost:${PORT}/docs`);
}
bootstrap();
