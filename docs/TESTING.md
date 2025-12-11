# Guía de Testing - MarLo Cookies

Estrategia de testing para el sistema de e-commerce MarLo Cookies.

## 📋 Stack de Testing

- **Framework Frontend**: Jest + React Testing Library
- **E2E Testing**: Playwright o Cypress
- **API Testing**: Supertest (NestJS)
- **Code Coverage**: Jest Coverage

## 🧪 Niveles de Testing

### 1. Unit Tests (Pruebas Unitarias)

Probar funciones individuales y lógica de negocio aislada.

#### Helpers (`src/utils/helpers.ts`)

```typescript
// helpers.test.ts
import { 
  formatPrice, 
  formatDate, 
  isValidEmail,
  calculateDiscount,
  pointsToMoney 
} from '@/utils/helpers';

describe('formatPrice', () => {
  it('formatea precio correctamente con separadores de miles', () => {
    expect(formatPrice(5990)).toBe('$5.990');
    expect(formatPrice(15000)).toBe('$15.000');
    expect(formatPrice(1000000)).toBe('$1.000.000');
  });

  it('maneja decimales correctamente', () => {
    expect(formatPrice(5990.50)).toBe('$5.991'); // Redondeo
  });

  it('maneja valores negativos', () => {
    expect(formatPrice(-100)).toBe('-$100');
  });

  it('maneja cero', () => {
    expect(formatPrice(0)).toBe('$0');
  });
});

describe('isValidEmail', () => {
  it('valida emails correctos', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
  });

  it('rechaza emails inválidos', () => {
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('calculateDiscount', () => {
  it('calcula porcentaje de descuento correctamente', () => {
    expect(calculateDiscount(10000, 8000)).toBe(20);
    expect(calculateDiscount(5000, 2500)).toBe(50);
  });

  it('maneja casos sin descuento', () => {
    expect(calculateDiscount(1000, 1000)).toBe(0);
  });
});

describe('pointsToMoney', () => {
  it('convierte puntos a dinero correctamente', () => {
    expect(pointsToMoney(1000, 1)).toBe(1000);
    expect(pointsToMoney(500, 2)).toBe(1000);
  });
});
```

#### Validators (`src/utils/validators.ts`)

```typescript
// validators.test.ts
import { 
  validateEmail,
  validatePhone,
  validatePassword,
  validateLoginForm,
  validateRegisterForm 
} from '@/utils/validators';

describe('validateEmail', () => {
  it('acepta emails válidos', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('rechaza emails inválidos', () => {
    expect(validateEmail('invalid')).toBeTruthy();
    expect(validateEmail('')).toBeTruthy();
    expect(validateEmail('test@')).toBeTruthy();
  });
});

describe('validatePhone', () => {
  it('acepta teléfonos chilenos válidos', () => {
    expect(validatePhone('912345678')).toBeNull();
    expect(validatePhone('+56912345678')).toBeNull();
  });

  it('rechaza teléfonos inválidos', () => {
    expect(validatePhone('12345678')).toBeTruthy(); // No empieza con 9
    expect(validatePhone('9123')).toBeTruthy(); // Muy corto
    expect(validatePhone('')).toBeTruthy();
  });
});

describe('validatePassword', () => {
  it('acepta contraseñas válidas', () => {
    expect(validatePassword('Password123')).toBeNull();
    expect(validatePassword('Abc12345')).toBeNull();
  });

  it('rechaza contraseñas débiles', () => {
    expect(validatePassword('pass')).toBeTruthy(); // Muy corta
    expect(validatePassword('password')).toBeTruthy(); // Sin mayúsculas ni números
    expect(validatePassword('PASSWORD123')).toBeTruthy(); // Sin minúsculas
  });
});

describe('validateLoginForm', () => {
  it('valida formulario de login correcto', () => {
    const formData = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const result = validateLoginForm(formData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('detecta múltiples errores', () => {
    const formData = {
      email: 'invalid-email',
      password: '',
    };

    const result = validateLoginForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.password).toBeTruthy();
  });
});
```

### 2. Component Tests (Pruebas de Componentes)

Probar componentes React de forma aislada.

#### Badge Component

```typescript
// Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge, ProductBadge, StatusBadge } from '@/components/Badge';

describe('Badge', () => {
  it('renderiza texto correctamente', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('aplica variante correctamente', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-100');
  });

  it('aplica tamaño correctamente', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    expect(container.firstChild).toHaveClass('px-3', 'py-1', 'text-sm');
  });
});

describe('ProductBadge', () => {
  it('renderiza badge de nuevo producto', () => {
    render(<ProductBadge type="nuevo" />);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('renderiza badge con ícono', () => {
    const { container } = render(<ProductBadge type="limitado" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renderiza estado de pedido correctamente', () => {
    render(<StatusBadge status="entregado" />);
    expect(screen.getByText('Entregado')).toBeInTheDocument();
  });

  it('aplica color según estado', () => {
    const { container } = render(<StatusBadge status="preparando" />);
    expect(container.firstChild).toHaveClass('bg-yellow-100');
  });
});
```

#### LoadingSpinner Component

```typescript
// LoadingSpinner.test.tsx
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingPage } from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renderiza spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('aplica tamaño correctamente', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });
});

describe('LoadingPage', () => {
  it('renderiza página de carga con mensaje', () => {
    render(<LoadingPage message="Cargando productos..." />);
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });
});
```

#### EmptyState Component

```typescript
// EmptyState.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, EmptyCart } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renderiza título y descripción', () => {
    render(
      <EmptyState 
        title="Sin resultados" 
        description="No se encontraron elementos"
      />
    );
    
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron elementos')).toBeInTheDocument();
  });

  it('renderiza botón de acción', () => {
    const handleAction = jest.fn();
    
    render(
      <EmptyState 
        title="Sin items"
        action={{
          label: 'Agregar item',
          onClick: handleAction,
        }}
      />
    );

    const button = screen.getByText('Agregar item');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyCart', () => {
  it('renderiza estado de carrito vacío', () => {
    render(<EmptyCart />);
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });
});
```

### 3. Store Tests (Pruebas de Zustand)

Probar stores de estado global.

#### Cart Store

```typescript
// cartStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/store/cartStore';

describe('CartStore', () => {
  beforeEach(() => {
    // Reset store antes de cada test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  it('agrega item al carrito', () => {
    const { result } = renderHook(() => useCartStore());

    const item = {
      id: 1,
      nombre: 'Cookie Chocolate',
      precio: 3990,
      cantidad: 2,
      imagen: 'cookie.jpg',
    };

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(item);
  });

  it('incrementa cantidad si item ya existe', () => {
    const { result } = renderHook(() => useCartStore());

    const item = {
      id: 1,
      nombre: 'Cookie',
      precio: 3990,
      cantidad: 1,
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cantidad).toBe(2);
  });

  it('remueve item del carrito', () => {
    const { result } = renderHook(() => useCartStore());

    const item = { id: 1, nombre: 'Cookie', precio: 3990, cantidad: 1 };

    act(() => {
      result.current.addItem(item);
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('calcula subtotal correctamente', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ id: 1, nombre: 'Cookie 1', precio: 3990, cantidad: 2 });
      result.current.addItem({ id: 2, nombre: 'Cookie 2', precio: 2990, cantidad: 1 });
    });

    expect(result.current.getSubtotal()).toBe(10970); // (3990*2) + (2990*1)
  });

  it('calcula cantidad total de items', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ id: 1, nombre: 'Cookie 1', precio: 3990, cantidad: 3 });
      result.current.addItem({ id: 2, nombre: 'Cookie 2', precio: 2990, cantidad: 2 });
    });

    expect(result.current.getTotalItems()).toBe(5);
  });
});
```

#### Auth Store

```typescript
// authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';

describe('AuthStore', () => {
  it('inicia con usuario null', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
  });

  it('loguea usuario correctamente', () => {
    const { result } = renderHook(() => useAuthStore());

    const userData = {
      id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      puntos: 0,
    };

    act(() => {
      result.current.login(userData);
    });

    expect(result.current.user).toEqual(userData);
  });

  it('hace logout correctamente', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({ 
        id: '1', 
        nombre: 'Juan', 
        apellido: 'Pérez',
        email: 'juan@example.com', 
        puntos: 0 
      });
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it('actualiza puntos del usuario', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({ 
        id: '1', 
        nombre: 'Juan',
        apellido: 'Pérez', 
        email: 'juan@example.com', 
        puntos: 1000 
      });
      result.current.updatePuntos(1500);
    });

    expect(result.current.user?.puntos).toBe(1500);
  });
});
```

### 4. Integration Tests (Pruebas de Integración)

Probar flujos completos de usuario.

#### Login Flow

```typescript
// login.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { api } from '@/services/api';

jest.mock('next/navigation');
jest.mock('@/services/api');

describe('Login Integration', () => {
  it('muestra errores de validación', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByText('Iniciar Sesión');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('loguea usuario exitosamente', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (api.auth.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        token: 'fake-token',
        puntos: 0,
      },
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByText('Iniciar Sesión');

    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/perfil');
    });
  });

  it('muestra error en login fallido', async () => {
    (api.auth.login as jest.Mock).mockRejectedValue(
      new ApiError(401, 'Unauthorized', 'Credenciales inválidas')
    );

    render(<LoginPage />);

    // Llenar formulario y enviar...

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
```

#### Checkout Flow

```typescript
// checkout.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from '@/app/checkout/page';
import { useCartStore } from '@/store/cartStore';

describe('Checkout Integration', () => {
  beforeEach(() => {
    // Configurar carrito con items
    useCartStore.setState({
      items: [
        { id: 1, nombre: 'Cookie', precio: 3990, cantidad: 2 },
      ],
    });
  });

  it('valida formulario antes de enviar', async () => {
    render(<CheckoutPage />);

    const submitButton = screen.getByText('Finalizar Compra');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    });
  });

  it('crea pedido exitosamente', async () => {
    (api.orders.create as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: '123', estado: 'preparando' },
    });

    render(<CheckoutPage />);

    // Llenar todos los campos del formulario...
    
    const submitButton = screen.getByText('Finalizar Compra');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.orders.create).toHaveBeenCalled();
      // Verificar redirección o mensaje de éxito
    });
  });
});
```

### 5. E2E Tests (Pruebas End-to-End)

Probar flujos completos en el navegador con Playwright.

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('usuario puede completar una compra', async ({ page }) => {
    // 1. Ir a la página de productos
    await page.goto('http://localhost:3005/productos');

    // 2. Agregar producto al carrito
    await page.click('button:has-text("Agregar al Carrito")');
    
    // 3. Ver notificación de éxito
    await expect(page.locator('text=Producto agregado')).toBeVisible();

    // 4. Ir al carrito
    await page.click('a[href="/carrito"]');
    
    // 5. Verificar que el producto está en el carrito
    await expect(page.locator('text=Cookie Chocolate')).toBeVisible();

    // 6. Proceder al checkout
    await page.click('button:has-text("Proceder al Pago")');

    // 7. Llenar formulario de checkout
    await page.fill('input[name="nombre"]', 'Juan');
    await page.fill('input[name="apellido"]', 'Pérez');
    await page.fill('input[name="email"]', 'juan@example.com');
    await page.fill('input[name="telefono"]', '912345678');
    await page.fill('input[name="direccion"]', 'Av. Principal 123');
    await page.fill('input[name="comuna"]', 'Santiago');
    await page.fill('input[name="region"]', 'Metropolitana');
    
    // 8. Seleccionar método de pago
    await page.click('input[value="efectivo"]');

    // 9. Finalizar compra
    await page.click('button:has-text("Finalizar Compra")');

    // 10. Verificar confirmación
    await expect(page.locator('text=¡Pedido creado exitosamente!')).toBeVisible();
    
    // 11. Verificar redirección a página de pedido
    await expect(page).toHaveURL(/\/pedidos\/\d+/);
  });
});

test.describe('Login Flow', () => {
  test('usuario puede iniciar sesión', async ({ page }) => {
    await page.goto('http://localhost:3005/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button:has-text("Iniciar Sesión")');

    await expect(page).toHaveURL('http://localhost:3005/perfil');
    await expect(page.locator('text=Hola, Test')).toBeVisible();
  });
});
```

## 🚀 Configuración

### 1. Instalar Dependencias

```bash
# Frontend
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test

# Backend
cd backend
npm install --save-dev @nestjs/testing supertest
```

### 2. Configurar Jest

```javascript
// frontend/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 3. Scripts de Testing

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 📊 Coverage Goals

- **Helpers/Utils**: 90%+ coverage
- **Validators**: 90%+ coverage
- **Components**: 80%+ coverage
- **Stores**: 85%+ coverage
- **Integration**: 70%+ critical paths
- **E2E**: 60%+ happy paths

## ✅ Checklist de Testing

- [ ] Unit tests para helpers
- [ ] Unit tests para validators
- [ ] Component tests para todos los componentes reutilizables
- [ ] Store tests para Zustand stores
- [ ] Integration tests para login/registro
- [ ] Integration tests para flujo de compra
- [ ] E2E tests para flujo completo de compra
- [ ] E2E tests para gestión de perfil
- [ ] Coverage > 70% global

---

**Próximo Paso**: Comenzar con tests unitarios de helpers y validators, luego avanzar a component tests.
