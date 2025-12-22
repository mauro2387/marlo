// Tipos generados automáticamente por Supabase
// Para regenerar: npx supabase gen types typescript --project-id "your-project-id" --schema public > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nombre: string
          apellido: string
          telefono: string | null
          puntos: number
          avatar: string | null
          direccion: string | null
          comuna: string | null
          region: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          apellido: string
          telefono?: string | null
          puntos?: number
          avatar?: string | null
          direccion?: string | null
          comuna?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          apellido?: string
          telefono?: string | null
          puntos?: number
          avatar?: string | null
          direccion?: string | null
          comuna?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          precio: number
          categoria: string
          imagen: string | null
          stock: number
          es_limitado: boolean
          activo: boolean
          ingredientes: string[] | null
          alergenos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          precio: number
          categoria: string
          imagen?: string | null
          stock?: number
          es_limitado?: boolean
          activo?: boolean
          ingredientes?: string[] | null
          alergenos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          precio?: number
          categoria?: string
          imagen?: string | null
          stock?: number
          es_limitado?: boolean
          activo?: boolean
          ingredientes?: string[] | null
          alergenos?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          subtotal: number
          envio: number
          descuento: number
          total: number
          estado: 'preparando' | 'en_camino' | 'entregado' | 'cancelado'
          metodo_pago: 'efectivo' | 'transferencia' | 'mercadopago'
          direccion: string
          comuna: string
          region: string
          notas: string | null
          puntos_ganados: number
          puntos_usados: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subtotal: number
          envio: number
          descuento: number
          total: number
          estado?: 'preparando' | 'en_camino' | 'entregado' | 'cancelado'
          metodo_pago: 'efectivo' | 'transferencia' | 'mercadopago'
          direccion: string
          comuna: string
          region: string
          notas?: string | null
          puntos_ganados?: number
          puntos_usados?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subtotal?: number
          envio?: number
          descuento?: number
          total?: number
          estado?: 'preparando' | 'en_camino' | 'entregado' | 'cancelado'
          metodo_pago?: 'efectivo' | 'transferencia' | 'mercadopago'
          direccion?: string
          comuna?: string
          region?: string
          notas?: string | null
          puntos_ganados?: number
          puntos_usados?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          nombre: string
          precio: number
          cantidad: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          nombre: string
          precio: number
          cantidad: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          nombre?: string
          precio?: number
          cantidad?: number
          subtotal?: number
          created_at?: string
        }
      }
      loyalty_history: {
        Row: {
          id: string
          user_id: string
          tipo: 'ganado' | 'canjeado'
          puntos: number
          concepto: string
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tipo: 'ganado' | 'canjeado'
          puntos: number
          concepto: string
          order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tipo?: 'ganado' | 'canjeado'
          puntos?: number
          concepto?: string
          order_id?: string | null
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          nombre: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          nombre: string
          email: string
          telefono: string | null
          asunto: string
          mensaje: string
          leido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          telefono?: string | null
          asunto: string
          mensaje: string
          leido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          telefono?: string | null
          asunto?: string
          mensaje?: string
          leido?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'preparando' | 'en_camino' | 'entregado' | 'cancelado'
      payment_method: 'efectivo' | 'transferencia' | 'mercadopago'
      loyalty_type: 'ganado' | 'canjeado'
    }
  }
}
