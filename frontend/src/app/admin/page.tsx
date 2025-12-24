'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { statsDB, ordersDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  newCustomersToday: number;
}

interface RecentOrder {
  id: string;
  customer_name?: string;
  nombre_cliente?: string;
  total: number;
  estado: string;
  created_at: string;
  users?: {
    nombre: string;
    apellido: string;
  };
}

const DEFAULT_STATS: Stats = {
  totalOrders: 0,
  pendingOrders: 0,
  todayOrders: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  totalCustomers: 0,
  newCustomersToday: 0,
};

const statusLabels: Record<string, { label: string; color: string }> = {
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  listo: { label: 'Listo', color: 'bg-indigo-100 text-indigo-800' },
  en_camino: { label: 'En Camino', color: 'bg-orange-100 text-orange-800' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, ordersResult] = await Promise.all([
          statsDB.get(),
          ordersDB.getAll(),
        ]);

        if (statsResult.data) {
          setStats(statsResult.data);
        }
        if (ordersResult.data) {
          setRecentOrders(ordersResult.data.slice(0, 5));
        }
        if (statsResult.error || ordersResult.error) {
          setError('Algunos datos no se pudieron cargar');
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brown-800">Dashboard</h2>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <p className="font-medium">⚠️ {error}</p>
          <p className="text-sm mt-1">Los datos mostrados pueden no estar actualizados.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pedidos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pedidos Totales</p>
              <p className="text-3xl font-bold text-brown-800">{stats?.totalOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-yellow-600 font-medium">{stats?.pendingOrders || 0} pendientes</span>
            <span className="text-gray-400">•</span>
            <span className="text-green-600">{stats?.todayOrders || 0} hoy</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-3xl font-bold text-brown-800">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-600 font-medium">
              ${(stats?.todayRevenue || 0).toLocaleString()} hoy
            </span>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Productos</p>
              <p className="text-3xl font-bold text-brown-800">{stats?.totalProducts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
              🍪
            </div>
          </div>
          <div className="mt-4 text-sm">
            {(stats?.lowStockProducts || 0) > 0 ? (
              <span className="text-red-600 font-medium">
                ⚠️ {stats?.lowStockProducts} con bajo stock
              </span>
            ) : (
              <span className="text-green-600">✓ Stock OK</span>
            )}
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-3xl font-bold text-brown-800">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-blue-600 font-medium">
              +{stats?.newCustomersToday || 0} nuevos hoy
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-brown-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <span className="text-xl">➕</span>
              <span>Nuevo Producto</span>
            </Link>
            <Link
              href="/admin/cupones/nuevo"
              className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <span className="text-xl">🎟️</span>
              <span>Crear Cupón</span>
            </Link>
            <Link
              href="/admin/pedidos?status=preparando"
              className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <span className="text-xl">👨‍🍳</span>
              <span>Ver Preparando</span>
            </Link>
            <Link
              href="/admin/zonas"
              className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <span className="text-xl">🗺️</span>
              <span>Zonas (Tabla)</span>
            </Link>
            <Link
              href="/admin/zonas-delivery"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:from-pink-100 hover:to-purple-100 transition-colors border border-pink-200"
            >
              <span className="text-xl">✏️</span>
              <span>Zonas Visual</span>
              <span className="ml-auto text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">Nuevo</span>
            </Link>
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brown-800">Pedidos Recientes</h3>
            <Link href="/admin/pedidos" className="text-pink-500 hover:text-pink-600 text-sm font-medium">
              Ver todos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📭</span>
              <p>No hay pedidos aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">ID</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Cliente</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Estado</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const customerName = order.users 
                      ? `${order.users.nombre} ${order.users.apellido}`
                      : order.nombre_cliente || order.customer_name || 'Cliente';
                    
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <Link href={`/admin/pedidos/${order.id}`} className="text-pink-500 hover:underline">
                            {generateOrderCode(order.id)}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-sm">{customerName}</td>
                        <td className="py-3 px-2 font-medium">${order.total.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusLabels[order.estado]?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {statusLabels[order.estado]?.label || order.estado}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('es-UY')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-brown-800 mb-4">⚠️ Alertas</h3>
        <div className="space-y-3">
          {(stats?.pendingOrders || 0) > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="font-medium text-yellow-800">Pedidos preparando</p>
                <p className="text-sm text-yellow-600">
                  Tienes {stats?.pendingOrders} pedidos en preparación
                </p>
              </div>
              <Link
                href="/admin/pedidos?status=preparando"
                className="ml-auto px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
              >
                Ver
              </Link>
            </div>
          )}
          {(stats?.lowStockProducts || 0) > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-2xl">📉</span>
              <div>
                <p className="font-medium text-red-800">Productos con bajo stock</p>
                <p className="text-sm text-red-600">
                  {stats?.lowStockProducts} productos necesitan reposición
                </p>
              </div>
              <Link
                href="/admin/productos?lowStock=true"
                className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Ver
              </Link>
            </div>
          )}
          {(stats?.pendingOrders || 0) === 0 && (stats?.lowStockProducts || 0) === 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-2xl">✅</span>
              <p className="text-green-800">¡Todo está en orden! No hay alertas pendientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
