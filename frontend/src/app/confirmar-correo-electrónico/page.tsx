'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmarCorreoElectronicoRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir con todos los query params
    const url = new URL(window.location.href);
    const params = url.searchParams.toString();
    router.replace(`/confirmar-email${params ? '?' + params : ''}`);
  }, [router]);

  return null;
}
