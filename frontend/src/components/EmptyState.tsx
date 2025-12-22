interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

import Link from 'next/link';

export default function EmptyState({
  icon = '📦',
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <span className="text-8xl mb-6 block animate-bounce">{icon}</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon="🛒"
      title="Tu carrito está vacío"
      description="Agrega algunos productos deliciosos a tu carrito"
      actionLabel="Ver Productos"
      actionHref="/productos"
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon="📦"
      title="No tienes pedidos"
      description="Realiza tu primer pedido y comienza a ganar puntos"
      actionLabel="Ir a Comprar"
      actionHref="/productos"
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon="🔍"
      title="No encontramos resultados"
      description="Intenta con otros términos de búsqueda o explora nuestro catálogo"
      actionLabel="Ver Todo"
      actionHref="/productos"
    />
  );
}
