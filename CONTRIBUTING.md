# Contribuir a MarLo Cookies

¡Gracias por tu interés en contribuir al proyecto! 🍪

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Estilo de Código](#estilo-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reporte de Bugs](#reporte-de-bugs)

## Código de Conducta

Este proyecto se rige por un código de conducta. Al participar, se espera que mantengas este código.

### Nuestro Compromiso

- Ser respetuoso con todos los colaboradores
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

## ¿Cómo Puedo Contribuir?

### Reportar Bugs

Si encuentras un bug:

1. Verifica que no esté ya reportado en [Issues](https://github.com/tu-usuario/marlocookies/issues)
2. Si no existe, crea un nuevo issue
3. Usa el template de bug report
4. Incluye:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Entorno (OS, browser, versión)

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. Crea un issue con el tag `enhancement`
2. Describe la funcionalidad en detalle
3. Explica por qué sería útil
4. Si es posible, sugiere una implementación

### Pull Requests

1. Fork el repositorio
2. Crea una rama desde `develop`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. Haz tus cambios
4. Commit con mensajes descriptivos (ver [Conventional Commits](#conventional-commits))
5. Push a tu fork
6. Abre un Pull Request

## Guía de Desarrollo

### Setup Inicial

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/marlocookies.git
cd marlocookies

# Backend
cd backend
npm install
cp .env.example .env
# Configurar .env
npm run start:dev

# Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env.local
# Configurar .env.local
npm run dev
```

### Estructura de Branches

- `main`: Producción (solo via PR)
- `develop`: Desarrollo principal
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs
- `hotfix/*`: Correcciones urgentes de producción

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción corta

Descripción larga opcional

Footer opcional
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `style`: Formato (no afecta código)
- `refactor`: Refactorización
- `test`: Agregar tests
- `chore`: Mantenimiento

**Ejemplos**:
```
feat(orders): agregar filtro por fecha en listado
fix(auth): corregir validación de email
docs(readme): actualizar instrucciones de instalación
```

## Estilo de Código

### Backend (TypeScript/NestJS)

```typescript
// ✅ Correcto
export class UserService {
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}

// ❌ Incorrecto
export class UserService {
  async findById(id: string) {
    let user = await this.userRepository.findOne({ where: { id } })
    if(!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }
}
```

**Reglas**:
- Usar TypeScript strict mode
- Interfaces para tipos
- DTOs para validación
- Nombres descriptivos
- Comentarios para lógica compleja
- Async/await sobre Promises

### Frontend (TypeScript/React)

```typescript
// ✅ Correcto
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <div className="card-product">
      <img src={product.imagen_url} alt={product.nombre} />
      <h3>{product.nombre}</h3>
      <p>${product.precio}</p>
      <button onClick={() => onAddToCart(product)}>
        Agregar al carrito
      </button>
    </div>
  );
};

// ❌ Incorrecto
export default function ProductCard(props) {
  return (
    <div className="card-product">
      <img src={props.product.imagen_url} />
      <h3>{props.product.nombre}</h3>
      <p>${props.product.precio}</p>
      <button onClick={() => props.onAddToCart(props.product)}>Agregar</button>
    </div>
  )
}
```

**Reglas**:
- Componentes funcionales con TypeScript
- Props tipadas con interfaces
- Hooks en orden: useState, useEffect, custom hooks
- Nombres descriptivos para hooks personalizados
- TailwindCSS para estilos
- Extraer lógica compleja a custom hooks

### CSS/Tailwind

```tsx
// ✅ Correcto
<button className="btn btn-primary hover:bg-primary-dark transition-colors">
  Confirmar
</button>

// ❌ Incorrecto
<button className="px-6 py-3 bg-blue-500 rounded hover:bg-blue-600">
  Confirmar
</button>
```

**Reglas**:
- Usar clases de utilidad de TailwindCSS
- Componentes reutilizables para patrones comunes
- Responsive por defecto (mobile-first)
- Seguir paleta de colores del branding

## Proceso de Pull Request

### Antes de Enviar

- [ ] Código sigue las guías de estilo
- [ ] Tests pasan localmente
- [ ] Commit messages siguen Conventional Commits
- [ ] Documentación actualizada si es necesario
- [ ] No hay console.logs ni debuggers
- [ ] Branch actualizado con develop

### Template de PR

```markdown
## Descripción
<!-- Describe brevemente los cambios -->

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
<!-- Describe las pruebas realizadas -->

## Checklist
- [ ] Tests pasan
- [ ] Código sigue el estilo del proyecto
- [ ] Documentación actualizada
- [ ] No hay warnings en la consola
```

### Proceso de Review

1. Un reviewer será asignado automáticamente
2. Responde a comentarios y sugerencias
3. Haz los cambios solicitados
4. Push actualizaciones a tu branch
5. Reviewer aprueba
6. Merge a develop

## Reporte de Bugs

### Template

```markdown
**Descripción del Bug**
<!-- Descripción clara y concisa del bug -->

**Pasos para Reproducir**
1. Ve a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
<!-- Qué esperabas que sucediera -->

**Screenshots**
<!-- Si aplica, agrega screenshots -->

**Entorno**
- OS: [ej. Windows 11]
- Browser: [ej. Chrome 120]
- Versión: [ej. 1.0.0]

**Información Adicional**
<!-- Cualquier otro contexto sobre el problema -->
```

## Testing

### Backend

```typescript
// Ejemplo de test unitario
describe('UserService', () => {
  it('should find user by id', async () => {
    const userId = 'uuid';
    const user = await userService.findById(userId);
    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
  });
});
```

```bash
# Ejecutar tests
npm test

# Con coverage
npm run test:cov
```

### Frontend

```typescript
// Ejemplo de test de componente
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { nombre: 'Cookie Chocochip', precio: 199 };
    render(<ProductCard product={product} onAddToCart={jest.fn()} />);
    expect(screen.getByText('Cookie Chocochip')).toBeInTheDocument();
  });
});
```

## Documentación

Al agregar nuevas funcionalidades, actualiza:

- README.md si afecta el setup
- MANUAL_TECNICO.md para detalles técnicos
- MANUAL_USO.md si afecta al usuario final
- Comentarios en el código
- Swagger/OpenAPI docs para endpoints

## Preguntas

Si tienes dudas sobre cómo contribuir:

- Abre un issue con el tag `question`
- Contacta al equipo: dev@marlocookies.com
- Revisa la [documentación](./docs)

---

¡Gracias por contribuir a MarLo Cookies! 🍪❤️
