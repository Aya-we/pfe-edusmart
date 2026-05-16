import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // RAW EXPRESS CORS MIDDLEWARE (Bulletproof)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://pfe-edusmart-vcyv.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
    next();
  });

  app.enableCors({
    origin: 'https://pfe-edusmart-vcyv.vercel.app',
    credentials: true,
  });  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
