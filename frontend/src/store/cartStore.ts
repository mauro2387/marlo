import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // UUID de Supabase
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  categoria?: string;
  stock?: number; // Stock disponible del producto
  // Para box: lista de cookies incluidas
  cookiesIncluidas?: { id: string; nombre: string; cantidad: number }[];
  // Para canjes de puntos
  esCanjeoPuntos?: boolean;
  puntosRequeridos?: number;
  rewardId?: string;
}

// Tipo para resultado de validación
export interface StockValidationResult {
  success: boolean;
  message?: string;
  availableStock?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => StockValidationResult;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => StockValidationResult;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  // Calcular cantidad total de un producto (incluyendo boxes)
  getTotalQuantityForProduct: (productId: string) => number;
  // Validar stock antes de agregar
  validateStock: (productId: string, requestedQty: number, availableStock: number) => StockValidationResult;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Obtener cantidad total de un producto en el carrito (incluyendo dentro de boxes)
      getTotalQuantityForProduct: (productId: string) => {
        const items = get().items;
        let total = 0;
        
        items.forEach(item => {
          // Si es el producto directamente
          if (item.id === productId) {
            total += item.cantidad;
          }
          // Si está dentro de una box
          if (item.cookiesIncluidas) {
            const cookieInBox = item.cookiesIncluidas.find(c => c.id === productId);
            if (cookieInBox) {
              total += cookieInBox.cantidad * item.cantidad; // Multiplicar por cantidad de box
            }
          }
        });
        
        return total;
      },

      // Validar si hay stock suficiente
      validateStock: (productId: string, requestedQty: number, availableStock: number): StockValidationResult => {
        const currentInCart = get().getTotalQuantityForProduct(productId);
        const totalNeeded = currentInCart + requestedQty;
        
        if (totalNeeded > availableStock) {
          const canAdd = availableStock - currentInCart;
          return {
            success: false,
            message: canAdd <= 0 
              ? `Ya tienes el máximo disponible en tu carrito (${availableStock} unidades)`
              : `Solo puedes agregar ${canAdd} más. Stock disponible: ${availableStock}`,
            availableStock: canAdd > 0 ? canAdd : 0
          };
        }
        
        return { success: true };
      },

      addItem: (item, cantidad = 1): StockValidationResult => {
        // Validar stock si está disponible
        if (item.stock !== undefined && item.stock > 0) {
          const validation = get().validateStock(item.id, cantidad, item.stock);
          if (!validation.success) {
            return validation;
          }
        }

        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, cantidad: i.cantidad + cantidad, stock: item.stock }
                  : i
              ),
            };
          }
          
          return {
            items: [...state.items, { ...item, cantidad }],
          };
        });

        return { success: true };
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, cantidad: number): StockValidationResult => {
        if (cantidad <= 0) {
          get().removeItem(id);
          return { success: true };
        }
        
        const item = get().items.find(i => i.id === id);
        if (!item) return { success: false, message: 'Producto no encontrado' };

        // Validar stock si está definido
        if (item.stock !== undefined && item.stock > 0) {
          // Calcular cuánto más estamos pidiendo
          const currentQty = item.cantidad;
          const additionalQty = cantidad - currentQty;
          
          if (additionalQty > 0) {
            // Estamos aumentando, validar stock
            const currentInCart = get().getTotalQuantityForProduct(id);
            const totalAfterUpdate = currentInCart + additionalQty;
            
            if (totalAfterUpdate > item.stock) {
              return {
                success: false,
                message: `Stock máximo disponible: ${item.stock} unidades`,
                availableStock: item.stock
              };
            }
          }
        }
        
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, cantidad } : i
          ),
        }));

        return { success: true };
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.precio * item.cantidad,
          0
        );
      },

      getTotal: () => {
        // Solo devuelve el subtotal - el envío se calcula en checkout
        return get().getSubtotal();
      },
    }),
    {
      name: 'marlocookies-cart',
    }
  )
);
