'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('Error creating Supabase client:', e);
}

// Helper con timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout después de ${ms}ms`)), ms)
    )
  ]);
};

export default function DebugPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics: Record<string, any> = {};

    // Test 0: Environment
    diagnostics['0. Environment'] = {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NO CONFIGURADA',
      supabaseKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ NO CONFIGURADA',
      clientCreated: supabase ? '✅ Sí' : '❌ No',
    };

    if (!supabase) {
      diagnostics['ERROR'] = 'No se pudo crear el cliente de Supabase. Verifica las variables de entorno.';
      setResults(diagnostics);
      setLoading(false);
      return;
    }

    // Test 1: Auth status
    try {
      const result = await withTimeout(supabase.auth.getUser(), 3000) as { data: any; error: any };
      diagnostics['1. Auth User'] = { 
        user: result.data?.user?.email || 'No logueado', 
        id: result.data?.user?.id || null,
        error: result.error?.message 
      };
    } catch (e: any) {
      diagnostics['1. Auth User'] = { error: e.message };
    }

    // Test 2: Products table
    try {
      const result = await withTimeout(
        supabase.from('products').select('id, nombre, activo', { count: 'exact' }).limit(3),
        3000
      ) as { data: any; error: any; count: number };
      diagnostics['2. Products'] = { 
        count: result.count, 
        sample: result.data?.map((p: any) => ({ id: p.id?.substring(0,8), nombre: p.nombre })),
        error: result.error?.message,
        code: result.error?.code,
        hint: result.error?.hint
      };
    } catch (e: any) {
      diagnostics['2. Products'] = { error: e.message };
    }

    // Test 3: Users table
    try {
      const result = await withTimeout(
        supabase.from('users').select('id, email, rol', { count: 'exact' }).limit(3),
        3000
      ) as { data: any; error: any; count: number };
      diagnostics['3. Users'] = { 
        count: result.count, 
        sample: result.data?.map((u: any) => ({ email: u.email, rol: u.rol })),
        error: result.error?.message,
        code: result.error?.code
      };
    } catch (e: any) {
      diagnostics['3. Users'] = { error: e.message };
    }

    // Test 4: Orders table
    try {
      const result = await withTimeout(
        supabase.from('orders').select('id, estado, total', { count: 'exact' }).limit(3),
        3000
      ) as { data: any; error: any; count: number };
      diagnostics['4. Orders'] = { 
        count: result.count, 
        sample: result.data?.map((o: any) => ({ id: o.id?.substring(0,8), estado: o.estado })),
        error: result.error?.message,
        code: result.error?.code
      };
    } catch (e: any) {
      diagnostics['4. Orders'] = { error: e.message };
    }

    // Test 5: Delivery zones
    try {
      const result = await withTimeout(
        supabase.from('delivery_zones').select('*'),
        3000
      ) as { data: any; error: any };
      diagnostics['5. Delivery Zones'] = { 
        count: result.data?.length || 0, 
        data: result.data,
        error: result.error?.message,
        code: result.error?.code
      };
    } catch (e: any) {
      diagnostics['5. Delivery Zones'] = { error: e.message };
    }

    // Test 6: Current user profile
    try {
      const authResult = await withTimeout(supabase.auth.getUser(), 3000) as { data: any; error: any };
      if (authResult.data?.user) {
        const result = await withTimeout(
          supabase.from('users').select('*').eq('id', authResult.data.user.id).single(),
          3000
        ) as { data: any; error: any };
        diagnostics['6. Mi Perfil en DB'] = { 
          data: result.data,
          error: result.error?.message,
          code: result.error?.code
        };
      } else {
        diagnostics['6. Mi Perfil en DB'] = { error: 'No hay usuario logueado' };
      }
    } catch (e: any) {
      diagnostics['6. Mi Perfil en DB'] = { error: e.message };
    }

    // Test 7: Simple fetch test
    try {
      const response = await withTimeout(
        fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        }),
        3000
      );
      const data = await response.json();
      diagnostics['7. Fetch Directo'] = { 
        status: response.status,
        ok: response.ok,
        data: data
      };
    } catch (e: any) {
      diagnostics['7. Fetch Directo'] = { error: e.message };
    }

    setResults(diagnostics);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Diagnóstico de Supabase</h1>
      
      <button 
        onClick={() => { setLoading(true); runDiagnostics(); }}
        className="mb-6 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
      >
        🔄 Ejecutar Diagnóstico
      </button>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4">Ejecutando diagnósticos (máx 3s por test)...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg shadow p-4">
              <h3 className={`font-semibold mb-2 ${
                value.error ? 'text-red-600' : 'text-green-600'
              }`}>
                {value.error ? '❌' : '✅'} {key}
              </h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-48">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
