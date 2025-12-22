'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const PIXEL_ID = '1539492077082620';

export default function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper para TypeScript
declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

// Funciones de tracking para usar en toda la app
export const MetaPixelEvents = {
  // Ver contenido de producto
  viewContent: (productId: string, productName: string, value: number) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value: value,
        currency: 'CLP',
      });
    }
  },

  // Agregar al carrito
  addToCart: (productId: string, productName: string, value: number, quantity: number) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value: value,
        currency: 'CLP',
        quantity: quantity,
      });
    }
  },

  // Iniciar checkout
  initiateCheckout: (value: number, numItems: number, contentIds: string[]) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        num_items: numItems,
        value: value,
        currency: 'CLP',
      });
    }
  },

  // Compra completada
  purchase: (orderId: string, value: number, numItems: number, contentIds: string[]) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: numItems,
        value: value,
        currency: 'CLP',
        order_id: orderId,
      });
    }
  },

  // Buscar producto
  search: (searchQuery: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: searchQuery,
      });
    }
  },

  // Lead (newsletter, contacto)
  lead: (leadType: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        content_category: leadType,
      });
    }
  },
};
