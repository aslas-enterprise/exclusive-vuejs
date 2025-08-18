import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { LoggerModule } from './logger/logger.module';
import { EmailModule } from './email/email.module';
import { CategoryModule } from './category/category.module';
import { ItemsModule } from './items/items.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [LoggerModule, PrismaModule, RedisModule, EmailModule, AuthModule, CategoryModule, ItemsModule, FlashSalesModule, FavoritesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
