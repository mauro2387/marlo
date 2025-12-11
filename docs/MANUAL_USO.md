# 📖 Manual de Uso - Sistema MarLo Cookies

**Guía completa para el equipo de MarLo Cookies**

---

## 🎯 Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Roles y Permisos](#roles-y-permisos)
4. [Panel de Control (CRM)](#panel-de-control-crm)
5. [Gestión de Pedidos](#gestión-de-pedidos)
6. [Gestión de Productos](#gestión-de-productos)
7. [Sistema de Puntos](#sistema-de-puntos)
8. [Caja y Finanzas](#caja-y-finanzas)
9. [Cupones y Promociones](#cupones-y-promociones)
10. [Clientes](#clientes)
11. [Reportes](#reportes)
12. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 1. Introducción

¡Bienvenido al sistema de gestión de MarLo Cookies! 🍪

Este sistema te permite:
- ✅ Gestionar pedidos en tiempo real
- ✅ Controlar inventario y productos
- ✅ Administrar clientes y puntos
- ✅ Manejar la caja diaria
- ✅ Generar reportes de ventas
- ✅ Automatizar comunicaciones con clientes

---

## 2. Acceso al Sistema

### 🌐 URLs del Sistema

**Sitio Web (Clientes)**
```
https://marlocookies.com
```

**Panel CRM (Equipo)**
```
https://marlocookies.com/crm
```

### 🔐 Inicio de Sesión

1. Ingresa a `https://marlocookies.com/crm/login`
2. Usa tu email y contraseña proporcionados
3. Si es tu primer acceso, cambia tu contraseña

**Credenciales Iniciales** (solicitar al administrador)
- Email: tu-email@marlocookies.com
- Contraseña temporal: (proporcionada por admin)

### ¿Olvidaste tu contraseña?

1. Click en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Recibirás un link de recuperación por email
4. Crea una nueva contraseña

---

## 3. Roles y Permisos

El sistema tiene 5 roles para el equipo:

### 👑 Administrador
**Acceso total al sistema**
- Gestión de usuarios y roles
- Configuración del sistema
- Todos los permisos

### 🍪 Producción
**Gestión de pedidos**
- Ver pedidos pendientes y en producción
- Marcar pedidos como "Listo para retirar"
- Ver catálogo de productos

### 💵 Caja
**Pagos y finanzas**
- Gestionar pedidos
- Registrar pagos
- Abrir/cerrar caja
- Ver reportes financieros

### 📢 Marketing
**Campañas y clientes**
- Gestionar clientes
- Crear cupones y promociones
- Ver estadísticas de clientes
- Enviar campañas

### 🎧 Soporte
**Atención al cliente**
- Ver información de clientes
- Ver pedidos
- Gestionar reclamos
- Actualizar información de pedidos

---

## 4. Panel de Control (CRM)

### 📊 Dashboard Principal

Al ingresar verás:

**Métricas del día**
- 💰 Ventas totales de hoy
- 📦 Pedidos pendientes
- 🍪 Pedidos en producción
- ✅ Pedidos completados

**Gráficos**
- Ventas de la semana
- Productos más vendidos
- Métodos de pago

**Accesos rápidos**
- Nuevo pedido
- Ver pedidos del día
- Cerrar caja
- Ver inventario

---

## 5. Gestión de Pedidos

### 📋 Ver Pedidos

**Menú → Pedidos**

Verás una lista con todos los pedidos:
- Número de pedido
- Cliente
- Fecha y hora
- Total
- Estado
- Método de pago

### 🔍 Filtrar Pedidos

Usa los filtros para encontrar pedidos específicos:
- **Por fecha**: Hoy, Esta semana, Este mes, Personalizado
- **Por estado**: Pendiente, En producción, Listo, Entregado, Cancelado
- **Por cliente**: Busca por nombre, teléfono o email

### 📦 Estados de Pedidos

Los pedidos pasan por estos estados:

1. **🟡 Pendiente**
   - Pedido recién creado
   - Esperando confirmación

2. **🔵 En Producción**
   - Pedido confirmado
   - Se está preparando

3. **🟢 Listo para Retirar**
   - Pedido terminado
   - Cliente notificado por WhatsApp

4. **✅ Entregado**
   - Pedido entregado al cliente
   - Se suman puntos automáticamente

5. **🔴 Cancelado**
   - Pedido cancelado
   - Especificar motivo

### ✏️ Cambiar Estado de Pedido

**Paso a paso:**

1. Click en el pedido
2. Click en "Cambiar estado"
3. Selecciona el nuevo estado
4. Si cancelas, escribe el motivo
5. Click en "Confirmar"

**💡 Tip**: El cliente recibirá notificación automática por WhatsApp cuando el pedido esté "Listo para retirar"

### 📄 Ver Detalle de Pedido

Click en cualquier pedido para ver:
- Datos del cliente
- Items del pedido (productos y cantidades)
- Subtotal, descuentos, envío
- Total
- Método de pago
- Dirección de entrega (si aplica)
- Notas del cliente
- Historial de cambios de estado

### 🖨️ Imprimir Ticket

1. Abre el detalle del pedido
2. Click en "Imprimir ticket"
3. Se genera un PDF con:
   - Logo de MarLo
   - Datos del pedido
   - Items y totales
   - Código QR (opcional)

---

## 6. Gestión de Productos

### 🍪 Ver Catálogo

**Menú → Productos**

Verás todos los productos organizados por categorías:
- Cookies
- Cookie Especial
- Boxes
- Rolls
- Toppings
- Postres
- Alfajores
- Bebidas

### ➕ Agregar Producto Nuevo

**Solo Administrador**

1. Click en "Nuevo Producto"
2. Completa los datos:
   - **Nombre**: Ej: Cookie Dulce de Leche
   - **Descripción**: Descripción atractiva
   - **Categoría**: Selecciona del menú
   - **Precio**: En pesos argentinos
   - **Imagen**: Sube una foto (recomendado 800x800px)
   - **Tipo de producto**:
     - ✅ Producto fijo (siempre disponible)
     - 🎁 Producto limitado (ver sección)
3. Click en "Guardar"

### 🎁 Productos Rotativos (Limitados)

**Reglas importantes:**
- ⚠️ Máximo 2 productos limitados activos simultáneamente
- 📅 Duración típica: 15 días
- 📦 Stock limitado
- 🚫 Se ocultan automáticamente cuando:
  - Se acaba el stock
  - Pasa la fecha de fin

**Crear producto limitado:**

1. Marca "Producto limitado"
2. Completa:
   - **Fecha inicio**: Cuándo estará disponible
   - **Fecha fin**: Cuándo dejará de venderse
   - **Stock inicial**: Cantidad disponible
3. Click en "Destacar en home" (opcional)
4. Guardar

**💡 Tip**: Los productos limitados aparecen con una badge "EDICIÓN LIMITADA" en la web

### ✏️ Editar Producto

1. Click en el producto
2. Modifica los datos necesarios
3. Guardar cambios

**Campos que puedes editar:**
- Nombre y descripción
- Precio
- Imagen
- Stock
- Visibilidad (mostrar/ocultar)
- Destacado en home

### 📊 Control de Stock

**Ver stock bajo:**
- El sistema alerta cuando el stock está bajo
- Badge rojo: "Stock bajo"
- Badge gris: "Sin stock"

**Actualizar stock:**
1. Abre el producto
2. Campo "Stock actual"
3. Ingresa la nueva cantidad
4. Guardar

**💡 Tip**: El stock se descuenta automáticamente cuando se completa un pedido

### 🗑️ Eliminar Producto

**No se eliminan productos** para mantener historial de pedidos.

En su lugar:
1. Abre el producto
2. Toggle "Visible"
3. El producto se oculta de la web pero se mantiene en la base de datos

---

## 7. Sistema de Puntos

### 💎 Cómo Funciona

**Regla simple**: **$1 = 1 punto**

Ejemplo:
- Compra de $1.500 = 1.500 puntos
- Compra de $720 = 720 puntos

**Los puntos se suman cuando:**
- El pedido está en estado "Entregado" ✅
- El pago fue confirmado

### 🎁 Canjes Disponibles

| Puntos | Recompensa |
|--------|-----------|
| 2.000 pts | 1 café + 1 cookie |
| 5.000 pts | 1 box x4 gratis |
| 10.000 pts | 1 box x6 gratis |

### 👤 Ver Puntos de un Cliente

1. **Menú → Clientes**
2. Busca al cliente
3. En su perfil verás:
   - Puntos totales
   - Historial de movimientos
   - Canjes realizados

### 🎯 Canjear Puntos

**Cuando un cliente quiere canjear:**

1. Abre su perfil
2. Click en "Canjear puntos"
3. Selecciona la recompensa
4. Confirma el canje
5. Los puntos se descuentan automáticamente
6. Genera el pedido correspondiente

### 📊 Historial de Puntos

En el perfil del cliente verás cada movimiento:
- ➕ Suma: Por compra
- ➖ Canje: Por recompensa
- 🔧 Ajuste: Corrección manual (solo admin)

Cada entrada muestra:
- Fecha
- Puntos (+ o -)
- Saldo anterior
- Saldo nuevo
- Descripción

---

## 8. Caja y Finanzas

### 💰 Caja Diaria

**Menú → Finanzas → Caja**

### 📂 Abrir Caja (Inicio del día)

**Automático**: La caja se abre automáticamente al primer pedido del día

O manualmente:
1. Click en "Abrir caja"
2. Ingresa saldo inicial (efectivo en caja)
3. Confirmar

### 💳 Métodos de Pago

El sistema registra automáticamente:
- 💵 Efectivo
- 🏦 Transferencia
- 💚 Mercado Pago (+5% recargo)
- 💳 Tarjeta débito
- 💳 Tarjeta crédito (+3.5% recargo)

### 📊 Ver Totales del Día

La caja muestra en tiempo real:
- Total por cada método de pago
- Cantidad de pedidos
- Total general
- Gastos del día
- Saldo neto

### 🔒 Cerrar Caja (Fin del día)

**¡Importante!** Debe hacerse todos los días.

**Paso a paso:**

1. **Menú → Finanzas → Cerrar Caja**
2. Verifica los totales
3. **Cuenta física**:
   - Cuenta el efectivo real en caja
   - Ingresa el monto
4. **Diferencia**:
   - Verde: Cuadra perfecto ✅
   - Amarillo: Diferencia menor a $100 ⚠️
   - Rojo: Revisar 🚨
5. **Notas**: Escribe observaciones si es necesario
6. Click en "Cerrar caja"

**💡 Tip**: La caja se cierra automáticamente a las 23:59 si no se cerró manualmente

### 📝 Registrar Gastos

**Durante el día puedes registrar gastos:**

1. **Menú → Finanzas → Gastos**
2. Click en "Nuevo gasto"
3. Completa:
   - Concepto: Ej: "Insumos", "Servicios"
   - Monto
   - Categoría
   - Método de pago
   - Notas (opcional)
4. Guardar

Los gastos se descuentan automáticamente del total del día.

---

## 9. Cupones y Promociones

### 🎟️ Ver Cupones

**Menú → Marketing → Cupones**

Lista de todos los cupones:
- Activos
- Próximos
- Vencidos
- Agotados

### ➕ Crear Cupón Nuevo

**Solo Admin y Marketing**

1. Click en "Nuevo cupón"
2. Completa:
   - **Código**: Ej: VERANO2024 (sin espacios, mayúsculas)
   - **Descripción**: Para uso interno
   - **Tipo de descuento**:
     - 📊 Porcentaje (ej: 10%)
     - 💵 Monto fijo (ej: $200)
   - **Valor**: Cantidad del descuento
   - **Monto mínimo**: Compra mínima requerida
   - **Fechas**: Inicio y fin de vigencia
   - **Usos máximos**: Cuántas veces puede usarse en total
   - **Un uso por cliente**: ✅ o ❌
3. Click en "Crear cupón"

### ✏️ Editar Cupón

Puedes editar:
- Descripción
- Fechas
- Usos máximos
- Activar/desactivar

**No se puede editar:**
- Código (para evitar fraudes)
- Tipo de descuento
- Valor

### 📊 Estadísticas de Cupón

En el detalle del cupón verás:
- Usos actuales / máximos
- Lista de usuarios que lo usaron
- Monto total descontado
- Fecha de última uso

### 🎂 Cupones Automáticos

El sistema envía automáticamente:

**Cupón de Cumpleaños**
- Se envía 7 días antes del cumpleaños
- Código: AUTO-CUMPLE-{ID}
- Descuento: $2.000 (configurable)
- Válido por 15 días

**Primera Compra**
- Se asigna automáticamente al registrarse
- Código: PRIMERACOMPRA
- Descuento: 10% o $200 (según config)

---

## 10. Clientes

### 👥 Ver Clientes

**Menú → Clientes**

Lista completa de clientes registrados:
- Nombre completo
- Email
- Teléfono
- Puntos
- Última compra
- Total gastado

### 🔍 Buscar Cliente

**Buscar por:**
- Nombre
- Apellido
- Email
- Teléfono

**Filtrar por:**
- Clientes activos
- Clientes VIP (más de 10.000 pts)
- Con pedidos recientes
- Sin compras (últimos 30 días)

### 📄 Perfil de Cliente

Click en un cliente para ver:

**Datos Personales**
- Nombre completo
- Email y teléfono
- Fecha de nacimiento
- Dirección
- Notas internas (privadas)

**Historial de Compras**
- Lista de todos sus pedidos
- Totales y fechas
- Estado actual

**Puntos**
- Saldo actual
- Historial completo
- Canjes realizados

**Estadísticas**
- Total gastado
- Ticket promedio
- Producto favorito
- Última compra

### ✏️ Editar Cliente

Puedes actualizar:
- Datos de contacto
- Dirección
- Notas internas

**⚠️ No editar**:
- Email (es el identificador único)
- Puntos (usar sistema de canjes)

### 🚫 Bloquear Cliente

**Solo Admin y Soporte**

Si un cliente tiene problemas:
1. Abre su perfil
2. Click en "Bloquear"
3. Escribe el motivo
4. Confirmar

El cliente no podrá:
- Iniciar sesión
- Hacer pedidos

Para desbloquear:
- Click en "Desbloquear"

### 📧 Contactar Cliente

**Opciones rápidas:**
- 📱 WhatsApp: Click en el teléfono
- 📧 Email: Click en el email
- 💬 Notificación interna: "Enviar mensaje"

---

## 11. Reportes

### 📊 Tipos de Reportes

**Menú → Reportes**

### 💰 Reporte de Ventas

**Información incluida:**
- Total de ventas por período
- Cantidad de pedidos
- Ticket promedio
- Comparación con período anterior
- Gráfico de tendencia

**Filtros:**
- Hoy
- Esta semana
- Este mes
- Personalizado (rango de fechas)

### 💳 Reporte de Métodos de Pago

**Ver distribución:**
- Efectivo
- Transferencia
- Mercado Pago
- Tarjetas

Muestra:
- Porcentaje de cada método
- Total por método
- Cantidad de transacciones

### 🍪 Reporte de Productos

**Top productos vendidos:**
1. Nombre del producto
2. Cantidad vendida
3. Ingresos generados
4. Categoría

**Útil para:**
- Decidir qué productos destacar
- Planificar producción
- Evaluar productos nuevos

### 👥 Reporte de Clientes

**Métricas:**
- Nuevos clientes
- Clientes recurrentes
- Clientes inactivos
- Top clientes (por gasto)

### 📥 Exportar Reportes

Todos los reportes se pueden exportar:

1. Click en "Exportar"
2. Selecciona formato:
   - 📊 Excel (.xlsx)
   - 📄 PDF
   - 📋 CSV
3. Se descarga automáticamente

**💡 Tip**: Los reportes incluyen logo y datos de MarLo

---

## 12. Preguntas Frecuentes

### ❓ ¿Cómo crear un pedido manual?

1. Menú → Pedidos → Nuevo
2. Selecciona o crea cliente
3. Agrega productos
4. Selecciona método de pago
5. Confirmar pedido

### ❓ ¿Qué hago si un cliente no recibió su WhatsApp?

1. Abre el pedido
2. Click en "Reenviar WhatsApp"
3. O copia el link de seguimiento y envíalo manual

### ❓ ¿Cómo cambio el precio de un producto?

Solo Admin:
1. Menú → Productos
2. Abre el producto
3. Edita precio
4. Guardar

⚠️ Los pedidos anteriores mantienen el precio original

### ❓ ¿Puedo cancelar un pedido ya entregado?

No. Una vez marcado como "Entregado":
- Se sumaron los puntos
- Se actualizó el stock
- Se cerró en la caja

Contacta al administrador para ajustes.

### ❓ ¿Cómo agrego un producto limitado?

1. Verifica que no haya ya 2 limitados activos
2. Crea producto nuevo
3. Marca "Producto limitado"
4. Define fechas y stock
5. Guardar

### ❓ ¿Qué hago si olvidé cerrar la caja?

Tranquilo, se cierra automáticamente a las 23:59.

Puedes ver el cierre automático en:
Menú → Finanzas → Historial

### ❓ ¿Cómo dar puntos extra a un cliente?

Solo Admin:
1. Perfil del cliente
2. Click en "Ajustar puntos"
3. Ingresa cantidad (+/-)
4. Escribe motivo
5. Confirmar

### ❓ ¿El sistema hace backups?

Sí, automáticamente:
- Backups diarios (3 AM)
- Se guardan por 30 días
- Redundancia en la nube

### ❓ ¿Puedo usar el sistema en el celular?

¡Sí! El sistema es responsive:
- Funciona en cualquier navegador
- Adaptado para mobile
- Mismo acceso que en PC

---

## 📞 Soporte

### ¿Necesitas ayuda?

**Soporte Técnico**
- 📧 Email: soporte@marlocookies.com
- 📱 WhatsApp: +54 9 11 XXXX-XXXX
- ⏰ Horario: Lun-Vie 9-18hs

**Consultas Operativas**
- Contacta al administrador del sistema
- Email: admin@marlocookies.com

### 💡 Tips Generales

1. **Actualiza regularmente**: Ctrl+F5 para recargar
2. **Usa Chrome o Edge**: Mejor compatibilidad
3. **Mantén tu sesión activa**: El token dura 15 minutos
4. **Reporta bugs**: Ayúdanos a mejorar el sistema

---

## 🎉 ¡Listo!

Ya estás preparado para usar el sistema MarLo Cookies.

**Recuerda:**
- 🍪 Siempre confirma los pedidos
- 💰 Cierra la caja diariamente
- 📊 Revisa reportes semanalmente
- 💎 Promueve el sistema de puntos

---

**Manual actualizado**: Noviembre 2025  
**Versión del sistema**: 1.0.0

¡Que tengas un excelente día! 🍪✨
