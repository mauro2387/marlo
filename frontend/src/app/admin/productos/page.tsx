'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productsDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  stock: number;
  es_limitado: boolean;
  activo: boolean;
  created_at: string;
}

// Función para verificar si es una URL válida
function isValidImageUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

function ProductosContent() {
  const searchParams = useSearchParams();
  const lowStockFilter = searchParams.get('lowStock') === 'true';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    fetchProducts();
  }, [filter, lowStockFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await productsDB.getAll(false); // false = include inactive
      if (error) throw error;
      
      let filtered = data || [];
      
      if (lowStockFilter) {
        filtered = filtered.filter((p: Product) => p.stock < 10);
      } else if (filter !== 'all') {
        filtered = filtered.filter((p: Product) => p.categoria === filter);
      }
      
      setProducts(filtered);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await productsDB.update(id, { activo: !currentActive });
      setProducts(products.map(p => 
        p.id === id ? { ...p, activo: !currentActive } : p
      ));
    } catch (err) {
      console.error('Error actualizando producto:', err);
      alert('Error al actualizar el producto');
    }
  };

  const updateStock = async (id: string) => {
    try {
      await productsDB.update(id, { stock: newStock });
      setProducts(products.map(p => 
        p.id === id ? { ...p, stock: newStock } : p
      ));
      setEditingStock(null);
    } catch (err) {
      console.error('Error actualizando stock:', err);
      alert('Error al actualizar el stock');
    }
  };

  const deleteProduct = async (id: string, nombre: string) => {
    // Prevenir múltiples clicks
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const confirmDelete = confirm(
      `⚠️ ¿Estás seguro de eliminar "${nombre}"?\n\n` +
      `Esto lo borrará permanentemente de la base de datos.\n` +
      `Si alguien lo tiene en el carrito, verá que no está disponible.`
    );
    
    if (!confirmDelete) return;
    
    // Marcar temporalmente como procesando
    setProducts(products.map(p => 
      p.id === id ? { ...p, nombre: `${p.nombre} (procesando...)` } : p
    ));
    
    const { data, error } = await productsDB.delete(id);
    
    if (error) {
      console.error('Error eliminando producto:', error);
      
      // Detectar error de foreign key (productos con pedidos ya realizados)
      const errorCode = error?.code || '';
      const errorDetails = error?.details || '';
      const errorMessage = error?.message || '';
      const hasOrderItems = 
        errorCode === '23503' || 
        errorDetails.includes('order_items') || 
        errorMessage.includes('order_items');
      
      if (hasOrderItems) {
        const action = confirm(
          `❌ No se puede eliminar "${nombre}" porque tiene pedidos realizados asociados.\n\n` +
          `¿Deseas DESACTIVARLO en su lugar?\n\n` +
          `• ACEPTAR: Desactivar el producto (no se mostrará en la tienda)\n` +
          `• CANCELAR: No hacer nada`
        );
        
        if (action) {
          const { error: updateError } = await productsDB.update(id, { activo: false });
          if (updateError) {
            console.error('Error desactivando producto:', updateError);
            alert('❌ Error al desactivar el producto');
            // Restaurar nombre original
            setProducts(products.map(p => 
              p.id === id ? { ...p, nombre: nombre } : p
            ));
          } else {
            setProducts(products.map(p => 
              p.id === id ? { ...p, activo: false, nombre: nombre } : p
            ));
            alert('✅ Producto desactivado correctamente');
          }
        } else {
          // Restaurar nombre original si cancela
          setProducts(products.map(p => 
            p.id === id ? { ...p, nombre: nombre } : p
          ));
        }
      } else {
        alert('❌ Error al eliminar el producto. Verifica los permisos en Supabase.');
        // Restaurar nombre original
        setProducts(products.map(p => 
          p.id === id ? { ...p, nombre: nombre } : p
        ));
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
      alert('✅ Producto eliminado correctamente');
    }
  };

  const categories = ['cookies', 'boxes', 'bebidas', 'otros'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown-800">Gestión de Productos</h2>
        <Link
          href="/admin/productos/nuevo"
          className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600"
        >
          ➕ Nuevo Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' && !lowStockFilter ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === cat && !lowStockFilter ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => window.location.href = '/admin/productos?lowStock=true'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              lowStockFilter ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            ⚠️ Bajo Stock
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <span className="text-5xl block mb-4">🍪</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-4">
            {lowStockFilter 
              ? 'No hay productos con bajo stock'
              : 'Comienza agregando tu primer producto'
            }
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600"
          >
            Crear Producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Precio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {isValidImageUrl(product.imagen) ? (
                          <img
                            src={product.imagen!}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{product.imagen || '🍪'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-brown-800">{product.nombre}</p>
                        {product.es_limitado && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            ⭐ Limitado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-sm bg-gray-100 px-2 py-1 rounded">
                      {product.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">${product.precio.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {editingStock === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded"
                          min={0}
                        />
                        <button
                          onClick={() => updateStock(product.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingStock(product.id);
                          setNewStock(product.stock);
                        }}
                        className={`font-medium ${
                          product.stock < 10 ? 'text-red-600' : 'text-gray-700'
                        } hover:underline`}
                      >
                        {product.stock}
                        {product.stock < 10 && ' ⚠️'}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(product.id, product.activo)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {product.activo ? '✓ Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id, product.nombre)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}>
      <ProductosContent />
    </Suspense>
  );
}
