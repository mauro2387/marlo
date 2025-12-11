import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { LoyaltyHistory } from './loyalty-history.entity';

export enum OrderStatus {
  PENDIENTE = 'Pendiente',
  EN_PRODUCCION = 'En producción',
  LISTO = 'Listo para retirar',
  ENTREGADO = 'Entregado',
  CANCELADO = 'Cancelado',
}

export enum PaymentMethod {
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia',
  MERCADOPAGO = 'Mercado Pago',
  TARJETA_DEBITO = 'Tarjeta débito',
  TARJETA_CREDITO = 'Tarjeta crédito',
}

export enum DeliveryMethod {
  RETIRO = 'Retiro en local',
  ENVIO = 'Envío a domicilio',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  @Generated('increment')
  numero_pedido: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  envio: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  metodo_pago: PaymentMethod;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
  })
  metodo_entrega: DeliveryMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDIENTE,
  })
  estado: OrderStatus;

  @Column({ type: 'text', nullable: true })
  direccion_entrega: string;

  @Column({ length: 100, nullable: true })
  ciudad_entrega: string;

  @Column({ length: 10, nullable: true })
  codigo_postal_entrega: string;

  @Column({ length: 20, nullable: true })
  telefono_contacto: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ length: 50, nullable: true })
  cupon_codigo: string;

  @Column({ type: 'int', default: 0 })
  puntos_usados: number;

  @Column({ type: 'int', default: 0 })
  puntos_ganados: number;

  @Column({ type: 'boolean', default: false })
  confirmado_whatsapp: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_confirmacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_produccion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_listo: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_entregado: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_cancelado: Date;

  @Column({ type: 'text', nullable: true })
  razon_cancelacion: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => LoyaltyHistory, (loyalty) => loyalty.order)
  loyalty_transactions: LoyaltyHistory[];
}
