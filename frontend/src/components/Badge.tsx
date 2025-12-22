interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  pulse = false,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    secondary: 'bg-secondary-salmon/20 text-primary',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-lg';
  const pulseClass = pulse ? 'animate-pulse' : '';

  return (
    <span
      className={`
        inline-flex items-center justify-center font-semibold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClass}
        ${pulseClass}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}

export function ProductBadge({ type }: { type: 'new' | 'limited' | 'sale' | 'lowStock' }) {
  const badges = {
    new: { text: '✨ NUEVO', variant: 'info' as const, pulse: true },
    limited: { text: '⭐ EDICIÓN LIMITADA', variant: 'warning' as const, pulse: true },
    sale: { text: '🔥 OFERTA', variant: 'danger' as const, pulse: false },
    lowStock: { text: '🔥 ¡Últimas unidades!', variant: 'warning' as const, pulse: false },
  };

  const badge = badges[type];

  return (
    <Badge variant={badge.variant} pulse={badge.pulse} className="shadow-md">
      {badge.text}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: 'preparando' | 'en_camino' | 'entregado' | 'cancelado' }) {
  const statusConfig = {
    preparando: { text: '👨‍🍳 Preparando', variant: 'info' as const },
    en_camino: { text: '🚚 En Camino', variant: 'warning' as const },
    entregado: { text: '✅ Entregado', variant: 'success' as const },
    cancelado: { text: '❌ Cancelado', variant: 'danger' as const },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.text}</Badge>;
}

export function PointsBadge({ points }: { points: number }) {
  return (
    <Badge variant="secondary" className="gap-1">
      <span>⭐</span>
      <span>{points.toLocaleString('es-CL')} pts</span>
    </Badge>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <Badge variant="danger" size="lg" rounded pulse>
      -{percent}%
    </Badge>
  );
}
