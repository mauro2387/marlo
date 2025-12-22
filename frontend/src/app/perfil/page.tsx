'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usersDB } from '@/lib/supabase-fetch';
import { supabase } from '@/lib/supabase/client';
import { ordersDB } from '@/lib/supabase-fetch';
import { notificationService } from '@/lib/notifications';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function PerfilPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [editando, setEditando] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ pedidos: 0, puntos: 0, totalGastado: 0 });
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    comuna: '',
    region: '',
    codigoPostal: '',
  });

  // Esperar a que se monte el componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos del usuario desde authStore
  useEffect(() => {
    // No hacer nada hasta que esté montado y no esté cargando
    if (!mounted || isLoading) return;
    
    if (user) {
      console.log('✅ Perfil: Usuario cargado:', user.email);
      setUserData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        comuna: (user as any).comuna || '',
        region: (user as any).region || '',
        codigoPostal: '',
      });
      
      // Cargar estadísticas
      loadUserStats(user.id);
    } else if (!isAuthenticated) {
      console.log('❌ Perfil: No autenticado, redirigiendo...');
      router.replace('/login?redirect=/perfil');
    }
  }, [user, isAuthenticated, isLoading, mounted, router]);

  const loadUserStats = async (userId: string) => {
    try {
      // Obtener pedidos del usuario
      const { data: orders } = await ordersDB.getUserOrders(userId);
      const pedidosEntregados = orders?.filter((o: any) => o.estado === 'entregado') || [];
      const totalGastado = pedidosEntregados.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      
      setStats({
        pedidos: orders?.length || 0,
        puntos: user?.puntos || 0,
        totalGastado: totalGastado
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      // Detectar qué campos cambiaron
      const cambios: string[] = [];
      if (userData.nombre !== user.nombre) cambios.push('Nombre');
      if (userData.apellido !== user.apellido) cambios.push('Apellido');
      if (userData.telefono !== user.telefono) cambios.push('Teléfono');
      if (userData.direccion !== user.direccion) cambios.push('Dirección');
      if (userData.comuna !== (user as any).comuna) cambios.push('Zona / Barrio');
      if (userData.region !== (user as any).region) cambios.push('Departamento');
      
      const { error } = await usersDB.update(user.id, {
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        direccion: userData.direccion,
        comuna: userData.comuna,
        region: userData.region,
      });
      
      if (error) throw error;
      
      // Enviar email de confirmación si hubo cambios
      if (cambios.length > 0 && userData.email) {
        await notificationService.notifyProfileUpdate({
          userId: user.id,
          email: userData.email,
          nombre: userData.nombre,
          cambios,
        });
      }
      
      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
      setEditando(false);
      
      // Actualizar el store local
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      }));
    } catch (err: any) {
      console.error('Error guardando perfil:', err);
      setMessage({ type: 'error', text: err.message || 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
    
    setTimeout(() => setMessage(null), 5000);
  };

  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.nueva !== passwordData.confirmar) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    
    if (passwordData.nueva.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    
    setChangingPassword(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.nueva
      });
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' });
      setPasswordData({ actual: '', nueva: '', confirmar: '' });
    } catch (err: any) {
      console.error('Error cambiando contraseña:', err);
      setMessage({ type: 'error', text: err.message || 'Error al cambiar la contraseña' });
    } finally {
      setChangingPassword(false);
    }
    
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  // Mostrar loading mientras se carga
  if (!mounted || isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-[120px] min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </main>
      </>
    );
  }

  // Si no hay usuario después de cargar, mostrar loading mientras redirige
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-[120px] min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-up">
              <h1 className="text-4xl font-bold text-primary mb-8">Mi Cuenta</h1>
            </ScrollAnimation>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <ScrollAnimation animation="slide-right">
                  <div className="card p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-primary">{user?.nombre} {user?.apellido}</h3>
                    <p className="text-sm text-gray-500">Cliente desde 2024</p>
                  </div>

                  <nav className="space-y-2">
                    <Link 
                      href="/perfil" 
                      className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium"
                    >
                      <span className="material-icons text-xl">person</span>
                      <span>Mi Perfil</span>
                    </Link>
                    <Link 
                      href="/pedidos" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors"
                    >
                      <span className="material-icons text-xl">inventory_2</span>
                      <span>Mis Pedidos</span>
                    </Link>
                    <Link 
                      href="/puntos" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors"
                    >
                      <span className="material-icons text-xl">stars</span>
                      <span>Mis Puntos</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg font-medium text-red-600 transition-colors"
                    >
                      <span className="material-icons text-xl">logout</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </nav>
                  </div>
                </ScrollAnimation>
              </aside>

              {/* Contenido Principal */}
              <div className="lg:col-span-3 space-y-8">
                {/* Mensaje de feedback */}
                {message && (
                  <ScrollAnimation animation="fade-in">
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <span className="material-icons text-lg">
                      {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {message.text}
                    </div>
                  </ScrollAnimation>
                )}

                <ScrollAnimation animation="slide-left">
                  {/* Información Personal */}
                  <div className="card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-primary">Información Personal</h2>
                    <button
                      onClick={() => editando ? handleSave() : setEditando(true)}
                      disabled={saving}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                        editando 
                          ? 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {saving ? (
                        <>
                          <span className="material-icons text-lg animate-spin">refresh</span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-lg">{editando ? 'save' : 'edit'}</span>
                          {editando ? 'Guardar' : 'Editar'}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={userData.nombre}
                        onChange={(e) => setUserData({...userData, nombre: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={userData.apellido}
                        onChange={(e) => setUserData({...userData, apellido: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={userData.telefono}
                        onChange={(e) => setUserData({...userData, telefono: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={100}>
                  {/* Dirección de Envío */}
                  <div className="card p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6">Dirección de Envío</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección Completa
                      </label>
                      <input
                        type="text"
                        value={userData.direccion}
                        onChange={(e) => setUserData({...userData, direccion: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zona / Barrio
                      </label>
                      <input
                        type="text"
                        value={userData.comuna}
                        onChange={(e) => setUserData({...userData, comuna: e.target.value})}
                        disabled={!editando}
                        placeholder="Ej: Punta del Este, Centro, La Barra..."
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Departamento
                      </label>
                      <input
                        type="text"
                        value={userData.region}
                        onChange={(e) => setUserData({...userData, region: e.target.value})}
                        disabled={!editando}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                          editando 
                            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-in" delay={200}>
                  {/* Seguridad */}
                  <div className="card p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6">Seguridad</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        value={passwordData.actual}
                        onChange={(e) => setPasswordData({...passwordData, actual: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={passwordData.nueva}
                          onChange={(e) => setPasswordData({...passwordData, nueva: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmar}
                          onChange={(e) => setPasswordData({...passwordData, confirmar: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="btn-primary flex items-center gap-2 justify-center disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <>
                          <span className="material-icons text-lg animate-spin">refresh</span>
                          Cambiando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-lg">lock</span>
                          Cambiar Contraseña
                        </>
                      )}
                    </button>
                  </form>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="scale-up" delay={300}>
                  {/* Estadísticas Rápidas */}
                  <div className="grid md:grid-cols-3 gap-6">
                  <div className="card p-6 text-center">
                    <div className="text-4xl mb-2">
                      <span className="material-icons" style={{fontSize: '48px', color: '#8B4513'}}>inventory_2</span>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-1">{stats.pedidos}</div>
                    <p className="text-gray-600">Pedidos Realizados</p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-4xl mb-2">
                      <span className="material-icons" style={{fontSize: '48px', color: '#FF8F6B'}}>stars</span>
                    </div>
                    <div className="text-3xl font-bold text-secondary-salmon mb-1">{stats.puntos.toLocaleString()}</div>
                    <p className="text-gray-600">Puntos Acumulados</p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-4xl mb-2">
                      <span className="material-icons" style={{fontSize: '48px', color: '#8B4513'}}>payments</span>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-1">${stats.totalGastado.toLocaleString()}</div>
                    <p className="text-gray-600">Total Gastado</p>
                  </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
