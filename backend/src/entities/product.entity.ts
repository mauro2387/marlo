import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum ProductCategory {
  COOKIES = 'Cookies',
  COOKIE_ESPECIAL = 'Cookie especial',
  BOXES = 'Boxes',
  ROLLS = 'Rolls',
  TOPPINGS = 'Toppings',
  POSTRES = 'Postres',
  ALFAJORES = 'Alfajores',
  BEBIDAS = 'Bebidas',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  categoria: ProductCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ length: 500, nullable: true })
  imagen_url: string;

  @Column({ type: 'boolean', default: true })
  es_fijo: boolean;

  @Column({ type: 'boolean', default: false })
  es_limitado: boolean;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  stock_minimo: number;

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'text', array: true, nullable: true })
  ingredientes: string[];

  @Column({ type: 'text', array: true, nullable: true })
  alergenos: string[];

  @Column({ type: 'int', nullable: true })
  calorias: number;

  @Column({ type: 'int', nullable: true })
  peso_gramos: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  order_items: OrderItem[];

  // Virtual properties
  get disponible(): boolean {
    if (!this.visible) return false;
    if (this.es_fijo) return true;
    if (this.es_limitado) {
      const now = new Date();
      const inicioValido = !this.fecha_inicio || new Date(this.fecha_inicio) <= now;
      const finValido = !this.fecha_fin || new Date(this.fecha_fin) >= now;
      return inicioValido && finValido && this.stock > 0;
    }
    return false;
  }

  get sinStock(): boolean {
    return this.stock <= 0;
  }

  get stockBajo(): boolean {
    return this.stock > 0 && this.stock <= this.stock_minimo;
  }
}
