import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRecoveryService } from './cart-recovery.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CartController],
  providers: [CartService, CartRecoveryService],
  exports: [CartService, CartRecoveryService],
})
export class CartModule {}
