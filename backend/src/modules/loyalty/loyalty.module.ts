import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyHistory } from '../../entities/loyalty-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyHistory])],
  controllers: [],
  providers: [],
  exports: [],
})
export class LoyaltyModule {}
