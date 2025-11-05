import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefualtLanguage } from './common';
import { LoggingInterceptor } from './common/interceptors';
import * as express from "express"
import path from 'path';
async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  // app.enableCors()
  // app.use("/order/webhook")
  app.use("/uploads",express.static(path.resolve("./uploads")))
  app.use(setDefualtLanguage);
  app.useGlobalInterceptors(new LoggingInterceptor())
  await app.listen(port, () => {
    console.log(`Server running is port ${port}`);
    
  });
}
bootstrap();
