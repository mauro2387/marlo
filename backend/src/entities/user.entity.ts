import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from './order.entity';
import { LoyaltyHistory } from './loyalty-history.entity';
import { Role } from './role.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ length: 255 })
  @Exclude()
  contrasena: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'int', default: 0 })
  puntos_totales: number;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 100, nullable: true })
  ciudad: string;

  @Column({ length: 10, nullable: true })
  codigo_postal: string;

  @Column({ type: 'text', nullable: true })
  notas_internas: string;

  @Column({ type: 'boolean', default: false })
  blacklist: boolean;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => LoyaltyHistory, (loyalty) => loyalty.user)
  loyalty_history: LoyaltyHistory[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Virtual properties
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some((role) => role.nombre === roleName) || false;
  }
}
