import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

export enum LoyaltyType {
  SUMA = 'suma',
  CANJE = 'canje',
  AJUSTE = 'ajuste',
}

@Entity('loyalty_history')
export class LoyaltyHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({
    type: 'enum',
    enum: LoyaltyType,
  })
  tipo: LoyaltyType;

  @Column({ type: 'int' })
  puntos: number;

  @Column({ type: 'int' })
  saldo_anterior: number;

  @Column({ type: 'int' })
  saldo_nuevo: number;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.loyalty_history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order, (order) => order.loyalty_transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
