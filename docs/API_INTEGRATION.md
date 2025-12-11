# Guía de Integración con Backend API

Este documento describe cómo integrar el frontend de MarLo Cookies con el backend NestJS.

## 📁 Arquitectura de Servicios

```
frontend/src/
├── services/
│   └── api.ts           # Cliente API centralizado
├── types/
│   └── index.ts         # Tipos TypeScript globales
├── utils/
│   ├── validators.ts    # Validadores de formularios
│   └── helpers.ts       # Funciones auxiliares
└── config/
    └── constants.ts     # Configuraciones y constantes
```

## 🔌 Configuración

### 1. Variables de Entorno

Copiar `.env.local.example` a `.env.local` y configurar:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3005
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/marlocookies
```

### 2. Cliente API

El servicio API está centralizado en `src/services/api.ts` con los siguientes módulos:

- **authApi**: Login, registro, verificación de sesión
- **productsApi**: Listado, búsqueda, filtros de productos
- **ordersApi**: Creación, historial, cancelación de pedidos
- **loyaltyApi**: Puntos, historial, canjes
- **usersApi**: Perfil, actualización de datos
- **contactApi**: Envío de mensajes
- **newsletterApi**: Suscripción a newsletter

## 🔐 Autenticación

### Flujo de Login

```typescript
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

// En el componente de login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await api.auth.login(email, password);
    
    if (response.success && response.data) {
      // Actualizar store con usuario y token
      useAuthStore.getState().login(response.data);
      
      // Redirigir al perfil
      router.push('/perfil');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      showNotification('error', error.message);
    }
  }
};
```

### Flujo de Registro

```typescript
const handleRegister = async (formData: RegisterFormData) => {
  // 1. Validar formulario
  const validation = validateRegisterForm(formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  // 2. Llamar API
  try {
    const response = await api.auth.register({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
    });

    if (response.success && response.data) {
      // Loguear automáticamente
      useAuthStore.getState().login(response.data);
      
      showNotification('success', '¡Cuenta creada exitosamente! 🎉');
      router.push('/perfil');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      showNotification('error', error.message);
    }
  }
};
```

### Token JWT

El token se almacena automáticamente en `localStorage` mediante Zustand persist:

```typescript
// En api.ts, el token se obtiene automáticamente
function getAuthToken(): string | null {
  const authStore = localStorage.getItem('marlo-auth-store');
  if (!authStore) return null;
  
  const parsed = JSON.parse(authStore);
  return parsed.state?.user?.token || null;
}

// Y se incluye en todos los headers que requieren autenticación
headers['Authorization'] = `Bearer ${token}`;
```

## 🛍️ Productos

### Obtener Productos

```typescript
import { api } from '@/services/api';
import { useEffect, useState } from 'react';

const ProductosPage = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.products.getAll({
          categoria: 'cookies', // Filtro opcional
          enStock: true,
        });

        if (response.data) {
          setProductos(response.data);
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Renderizar productos...
};
```

### Buscar Productos

```typescript
const handleSearch = async (query: string) => {
  try {
    const response = await api.products.search(query);
    
    if (response.data) {
      setResultados(response.data);
    }
  } catch (error) {
    showNotification('error', 'Error al buscar productos');
  }
};
```

## 🛒 Carrito y Checkout

### Crear Pedido

```typescript
import { useCartStore } from '@/store/cartStore';
import { api } from '@/services/api';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const handleCheckout = async (formData: CheckoutFormData) => {
    // 1. Validar formulario
    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // 2. Preparar datos del pedido
    const orderData = {
      ...formData,
      items: items.map(item => ({
        productoId: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad,
      })),
      subtotal: getSubtotal(),
      envio: calcularEnvio(),
      descuento: calcularDescuentoPuntos(),
      total: getTotal(),
      puntosUsados: usarPuntos ? calcularPuntosUsados() : 0,
    };

    // 3. Crear orden
    try {
      const response = await api.orders.create(orderData);

      if (response.success && response.data) {
        // Limpiar carrito
        clearCart();
        
        // Actualizar puntos del usuario
        if (user) {
          const puntosResponse = await api.loyalty.getPoints(user.id);
          if (puntosResponse.success && puntosResponse.data) {
            useAuthStore.getState().updatePuntos(puntosResponse.data.puntos);
          }
        }

        // Redirigir a confirmación
        router.push(`/pedidos/${response.data.id}`);
        showNotification('success', '¡Pedido creado exitosamente! 🎉');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        showNotification('error', error.message);
      }
    }
  };

  // Renderizar formulario...
};
```

## 📊 Historial de Pedidos

```typescript
const PedidosPage = () => {
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      try {
        const response = await api.orders.getUserOrders(user.id);
        
        if (response.data) {
          setPedidos(response.data);
        }
      } catch (error) {
        showNotification('error', 'Error al cargar pedidos');
      }
    };

    fetchPedidos();
  }, [user]);

  // Renderizar lista de pedidos...
};
```

## ⭐ Sistema de Puntos

### Obtener Puntos

```typescript
const PuntosPage = () => {
  const { user, updatePuntos } = useAuthStore();
  const [historial, setHistorial] = useState<LoyaltyHistory[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchLoyaltyData = async () => {
      try {
        // Obtener puntos actuales
        const puntosResponse = await api.loyalty.getPoints(user.id);
        if (puntosResponse.success && puntosResponse.data) {
          updatePuntos(puntosResponse.data.puntos);
        }

        // Obtener historial
        const historialResponse = await api.loyalty.getHistory(user.id);
        if (historialResponse.data) {
          setHistorial(historialResponse.data);
        }
      } catch (error) {
        console.error('Error cargando datos de puntos:', error);
      }
    };

    fetchLoyaltyData();
  }, [user]);

  // Renderizar página de puntos...
};
```

### Canjear Recompensa

```typescript
const handleCanjear = async (rewardId: number) => {
  if (!user) return;

  try {
    const response = await api.loyalty.redeemReward(user.id, rewardId);

    if (response.success) {
      // Actualizar puntos
      const puntosResponse = await api.loyalty.getPoints(user.id);
      if (puntosResponse.success && puntosResponse.data) {
        updatePuntos(puntosResponse.data.puntos);
      }

      showNotification('success', '¡Recompensa canjeada exitosamente! 🎁');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      showNotification('error', error.message);
    }
  }
};
```

## 👤 Perfil de Usuario

```typescript
const PerfilPage = () => {
  const { user, updateUser } = useAuthStore();

  const handleUpdateProfile = async (formData: ProfileFormData) => {
    if (!user) return;

    // Validar
    const validation = validateProfileForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await api.users.updateProfile(user.id, formData);

      if (response.success && response.data) {
        updateUser(response.data);
        showNotification('success', 'Perfil actualizado correctamente ✅');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        showNotification('error', error.message);
      }
    }
  };

  // Renderizar formulario de perfil...
};
```

## 📧 Contacto y Newsletter

### Enviar Mensaje de Contacto

```typescript
const ContactoPage = () => {
  const handleSubmit = async (formData: ContactFormData) => {
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await api.contact.sendMessage(formData);

      if (response.success) {
        showNotification('success', 'Mensaje enviado correctamente ✅');
        resetForm();
      }
    } catch (error) {
      showNotification('error', 'Error al enviar mensaje');
    }
  };

  // Renderizar formulario...
};
```

### Suscribirse a Newsletter

```typescript
const handleNewsletter = async (email: string) => {
  try {
    const response = await api.newsletter.subscribe(email);

    if (response.success) {
      showNotification('success', '¡Suscrito al newsletter! 📧');
      setEmail('');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      showNotification('error', error.message);
    }
  }
};
```

## 🚨 Manejo de Errores

El cliente API incluye una clase `ApiError` personalizada:

```typescript
import { ApiError } from '@/services/api';

try {
  const response = await api.products.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    // Error de API con código de estado
    console.log(error.status);     // 404, 500, etc.
    console.log(error.statusText); // "Not Found", etc.
    console.log(error.message);    // Mensaje del backend
    
    // Mostrar notificación al usuario
    showNotification('error', error.message);
  } else {
    // Error de red u otro tipo
    showNotification('error', 'Error de conexión');
  }
}
```

## 🔄 Hook de Async Actions

Usa el hook `useAsyncAction` para manejar llamadas API con loading y errores:

```typescript
import { useAsyncAction } from '@/hooks/useCustomHooks';

const MyComponent = () => {
  const fetchData = useAsyncAction(async () => {
    const response = await api.products.getAll();
    return response.data;
  });

  const handleLoad = async () => {
    const data = await fetchData.execute();
    if (data) {
      setProductos(data);
    }
  };

  return (
    <div>
      <button 
        onClick={handleLoad} 
        disabled={fetchData.loading}
      >
        {fetchData.loading ? 'Cargando...' : 'Cargar Productos'}
      </button>
      
      {fetchData.error && (
        <p className="text-red-500">{fetchData.error}</p>
      )}
    </div>
  );
};
```

## 📝 Validación de Formularios

Todos los validadores están en `src/utils/validators.ts`:

```typescript
import { 
  validateLoginForm, 
  validateRegisterForm,
  validateCheckoutForm,
  validateContactForm,
  validateProfileForm
} from '@/utils/validators';

// Ejemplo de uso
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = (formData: LoginFormData) => {
  const validation = validateLoginForm(formData);
  
  if (!validation.isValid) {
    // Mostrar errores
    setErrors(validation.errors);
    return;
  }

  // Continuar con el envío
  // ...
};

// Limpiar error individual al editar campo
const handleFieldChange = (field: string, value: string) => {
  setFormData({ ...formData, [field]: value });
  
  // Limpiar error del campo
  const { [field]: _, ...rest } = errors;
  setErrors(rest);
};
```

## 🔧 Utilidades

### Formatear Datos

```typescript
import { 
  formatPrice, 
  formatDate, 
  formatPhone,
  formatRelativeTime 
} from '@/utils/helpers';

// Precios
formatPrice(5990);        // "$5.990"
formatPrice(15000);       // "$15.000"

// Fechas
formatDate(new Date());   // "12 de enero de 2024"
formatRelativeTime(date); // "Hace 2 horas"

// Teléfono
formatPhone('912345678'); // "+56 9 1234 5678"
```

### Validación Individual

```typescript
import { 
  isValidEmail, 
  isValidPhone, 
  isValidRUT 
} from '@/utils/helpers';

// Validar en tiempo real
const handleEmailChange = (email: string) => {
  setEmail(email);
  
  if (isValidEmail(email)) {
    setEmailError(null);
  } else {
    setEmailError('Email inválido');
  }
};
```

## 🎯 Próximos Pasos

1. ✅ **Backend Running**: Asegurar que el backend esté corriendo en `localhost:3000`
2. ✅ **Variables de Entorno**: Configurar `.env.local`
3. 🔄 **Testing**: Probar cada endpoint con Postman/Thunder Client
4. 🔄 **Integración**: Reemplazar datos mock por llamadas reales API
5. 🔄 **Error Handling**: Implementar manejo de errores en cada página
6. 🔄 **Loading States**: Agregar componentes LoadingSpinner
7. 🔄 **Empty States**: Usar componentes EmptyState cuando no hay datos

## 📚 Recursos

- **API Client**: `src/services/api.ts`
- **Tipos**: `src/types/index.ts`
- **Validadores**: `src/utils/validators.ts`
- **Helpers**: `src/utils/helpers.ts`
- **Hooks**: `src/hooks/useCustomHooks.ts`
- **Constantes**: `src/config/constants.ts`

---

**Nota**: Este documento asume que el backend NestJS está configurado y corriendo en `http://localhost:3000/api/v1`. Ajustar la variable `NEXT_PUBLIC_API_URL` según corresponda.
