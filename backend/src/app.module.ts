import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ConfigSystemModule } from './modules/config/config.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    LoyaltyModule,
    CouponsModule,
    FinanceModule,
    NotificationsModule,
    WhatsappModule,
    ConfigSystemModule,
  ],
})
export class AppModule {}
