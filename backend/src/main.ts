import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import appConfig from '@app/config/app.config';

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  const app = appConfig(nestApp);

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
