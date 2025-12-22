'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authDB, usersDB } from '@/lib/supabase-fetch';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { clearAuth, login, user, isAuthenticated, setLoading } = useAuthStore();
  const hasInitialized = useRef(false);

  const loadUserProfile = useCallback(async (userId: string, accessToken: string) => {
    try {
      const { data: userData } = await usersDB.getById(userId);
      if (userData) {
        login(
          {
            id: userData.id,
            nombre: userData.nombre || 'Usuario',
            apellido: userData.apellido || '',
            email: userData.email,
            puntos: userData.puntos || 0,
            rol: userData.rol || 'cliente',
            avatar: userData.avatar,
            telefono: userData.telefono,
            direccion: userData.direccion,
            zona: userData.zona,
            departamento: userData.departamento,
          },
          accessToken
        );
        console.log('✅ AuthProvider: Usuario cargado:', userData.email, 'rol:', userData.rol);
      } else {
        console.log('⚠️ AuthProvider: No se encontró userData para userId:', userId);
        // Limpiar si no hay datos de usuario
        clearAuth();
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error cargando perfil:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [login, clearAuth, setLoading]);

  // Inicialización única al montar
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    console.log('🔄 AuthProvider: Inicializando...');
    
    // Verificar si hay sesión guardada en localStorage
    const { data } = authDB.getSession();
    
    if (data?.session?.user?.id && data?.session?.access_token) {
      console.log('📦 AuthProvider: Sesión encontrada en localStorage, cargando perfil...');
      setLoading(true);
      loadUserProfile(data.session.user.id, data.session.access_token);
    } else {
      console.log('❌ AuthProvider: No hay sesión en localStorage');
      // Asegurar que el estado esté limpio si no hay sesión
      if (isAuthenticated) {
        clearAuth();
      }
      setLoading(false);
    }
  }, []);

  // Refresh de token periódico
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (authDB.isAuthenticated()) {
        await authDB.refreshSession();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Escuchar cambios en localStorage (para sincronizar tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('auth-token')) {
        if (!e.newValue) {
          // Token eliminado, limpiar auth
          clearAuth();
        } else {
          // Token cambiado, recargar
          const { data } = authDB.getSession();
          if (data?.session?.user?.id && data?.session?.access_token) {
            loadUserProfile(data.session.user.id, data.session.access_token);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuth, loadUserProfile]);

  return <>{children}</>;
}
