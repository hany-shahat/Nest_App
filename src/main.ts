import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefualtLanguage } from './common';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.use(setDefualtLanguage);
  app.useGlobalInterceptors(new LoggingInterceptor())
  await app.listen(port, () => {
    console.log(`Server running is port ${port}`);
    
  });
}
bootstrap();
