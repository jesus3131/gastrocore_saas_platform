# GastroCore

**Plataforma SaaS todo-en-uno para gestión integral de restaurantes.**

Multi-tenant · Multi-sucursal · Multi-nicho (alta cocina, fast food, cafeterías, food trucks, bares, franquicias, bakery, ghost kitchen). Incluye POS, KDS, inventario, RRHH, CRM/loyalty, contabilidad de doble entrada, integraciones de pago y delivery, analítica con BCG Matrix, y panel de Super Admin.

---

## Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelo de Datos](#modelo-de-datos)
- [Módulos del Sistema](#módulos-del-sistema)
- [Flujo Multi-Tenant](#flujo-multi-tenant)
- [Flujo POS Completo](#flujo-pos-completo)
- [Sistema de Eventos y WebSockets](#sistema-de-eventos-y-websockets)
- [Feature Flags & Onboarding](#feature-flags--onboarding-automático)
- [Planes de Suscripción](#planes-de-suscripción)
- [Inicio Rápido](#inicio-rápido)
- [Scripts Disponibles](#scripts-disponibles)
- [API Routes](#api-routes-resumen)
- [Frontend](#frontend)
- [Despliegue](#despliegue)
- [Seed Data / Usuarios de Prueba](#seed-data--usuarios-de-prueba)
- [Tests](#tests)
- [Servicio de Analítica Python](#servicio-de-analítica-python)
- [Mejoras Recientes](#mejoras-recientes)
- [Licencia](#licencia)

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Backend** | Node.js 20+, Express, TypeScript, Prisma ORM, Zod, Socket.IO |
| **Frontend** | React 19, Vite 6, TypeScript, Tailwind CSS 3, Zustand, React Query |
| **Base de datos** | PostgreSQL 16 (vía Prisma ORM) |
| **Cache** | Redis 7 (ioredis) + fallback in-memory |
| **DI** | tsyringe (contenedor con 60+ registrations) |
| **Eventos** | Outbox Pattern (DB) + WebSocket broadcasting |
| **Observabilidad** | OpenTelemetry + Pino logger |
| **Pagos** | Stripe SDK + MercadoPago SDK |
| **Delivery** | Rappi API + Uber Eats API (+ Didi) |
| **Analítica** | Python 3.12+ / FastAPI (Pandas, scikit-learn) — BCG Matrix, forecasting |
| **Infra** | Docker + Docker Compose + Kubernetes (Kustomize) |
| **CI/CD** | GitHub Actions |
| **Monorepo** | pnpm workspaces + Turborepo v2 |
| **Autenticación** | JWT + bcrypt + refresh tokens (rotación SHA-256) |

---

## Arquitectura

```
                    ┌──────────────┐
                    │   Frontend   │  React 19 + Vite 6
                    │    :8081     │
                    └──────┬───────┘
                           │ /api/* → :4001
                    ┌──────┴───────┐
                    │    Nginx     │  Proxy inverso
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────┴───┐ ┌─────┴──────┐ ┌───┴────────┐
     │  Backend   │ │   Redis    │ │ PostgreSQL │
     │  Express   │ │   Cache    │ │  Prisma    │
     │  :4000     │ │  :6379     │ │  :5432     │
     └────────────┘ └────────────┘ └────────────┘
              │
     ┌────────┴────────────┐
     │  Python / FastAPI   │
     │  Analytics (BCG)    │
     │  :8000              │
     └─────────────────────┘
```

### Clean Architecture (Backend)

```
src/
├── core/
│   ├── domain/          # Entidades, Value Objects, Eventos de dominio
│   │   ├── entities/    # PosOrder, MenuItem, Payment, etc.
│   │   ├── events/      # OrderCreatedEvent, etc.
│   │   └── value-objects/  # Money, TenantId
│   ├── ports/           # Interfaces de repositorios, event bus, etc.
│   │   └── repositories/   # 17 interfaces de repositorio
│   └── use-cases/       # 13 casos de uso (CreateOrder, RegisterTenant, etc.)
├── infrastructure/
│   ├── di/              # Container tsyringe
│   ├── events/          # OutboxEventBus, OutboxProcessor
│   ├── persistence/     # Prisma repositories, UnitOfWork
│   └── websocket/       # WebSocket gateway, EventBroadcaster
├── modules/             # 13 módulos de aplicación
│   ├── auth/  pos/  waiter/  inventory/  hr/  crm/
│   ├── integrations/  accounting/  analytics/
│   └── subscriptions/  super-admin/  onboarding/  notifications/
└── common/              # Shared middleware, guards, utils
    ├── guards/          # authGuard, permissionGuard
    ├── filters/         # errorHandler, AppError
    └── interceptors/    # correlationId, requestLogger
```

### Principios Arquitectónicos

- **Multi-tenencia lógica**: cada registro lleva `tenantId` como discriminador; no hay bases de datos separadas por cliente.
- **Modular**: cada módulo de negocio (POS, inventario, RRHH, etc.) es independiente, con sus propias rutas, controladores y servicios.
- **Use Cases**: lógica de dominio compleja extraída a casos de uso inyectables vía contenedor DI (tsyringe).
- **Tiempo real**: Socket.IO con autenticación JWT para actualizaciones de órdenes, mesas y KDS en vivo.
- **Caching**: capa de caché in-memory (TTL configurable) para analytics y estados financieros.
- **Outbox transaccional**: los eventos de dominio se persisten en la misma transacción de negocio y se procesan de forma asíncrona, garantizando entrega confiable hacia WebSockets y otros consumidores.

---

## Estructura del Proyecto

```
gastrocore_saas_platform/
│
├── packages/
│   ├── shared/                    # @gastrocore/shared: tipos, constantes, lógica compartida
│   │   └── src/
│   │       ├── types/             # Interfaces del dominio (Order, Customer, etc.)
│   │       ├── constants/         # Planes, permisos, rutas API
│   │       └── index.ts
│   │
│   ├── backend/                   # API REST (Node.js + Express + TypeScript)
│   │   ├── prisma/
│   │   │   └── schema.prisma      # 24+ modelos de datos
│   │   └── src/
│   │       ├── main.ts
│   │       ├── config/            # app, routes, database, redis, env, logger
│   │       ├── common/            # Guards, filters, interceptors, validación, cache
│   │       ├── core/              # domain entities, ports, use-cases
│   │       ├── infrastructure/    # DI container, persistencia, eventos, websocket
│   │       └── modules/           # 13 módulos funcionales (auth, pos, analytics, etc.)
│   │
│   ├── frontend/                  # SPA React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── App.tsx           # Router principal con guards
│   │   │   ├── features/          # 13 features (auth, pos, inventory, hr, crm, accounting, etc.)
│   │   │   ├── layouts/           # DashboardLayout, AuthLayout
│   │   │   ├── app/               # Store (Zustand), hooks (useWebsocket, useRealtime)
│   │   │   ├── shared/            # Componentes UI reutilizables
│   │   │   └── lib/               # API client (Axios)
│   │   ├── prototypes/            # 19 prototipos HTML modulares (vista/css/js)
│   │   └── vite.config.ts
│   │
│   └── analytics/                 # Microservicio Python (FastAPI)
│       ├── main.py                # BCG Matrix, forecasting
│       └── requirements.txt
│
├── infrastructure/
│   ├── docker/                    # Docker Compose + Nginx + Dockerfiles multi-stage
│   └── k8s/                       # Manifiestos Kubernetes (Kustomize)
│
├── .github/workflows/             # Pipeline CI
├── prisma.config.ts               # Config Prisma con dotenv
├── turbo.json                     # Turborepo v2 pipeline
├── pnpm-workspace.yaml
├── eslint.config.js               # ESLint flat config
└── package.json
```

---

## Modelo de Datos

### Enums principales

| Enum | Valores |
|---|---|
| `BusinessType` | fine_dining, fast_food, cafe, food_truck, bar, franchise, bakery, ghost_kitchen |
| `SubscriptionPlan` | basic, pro, enterprise |
| `OrderStatus` | pending, preparing, ready, served, paid, canceled |
| `PaymentMethod` | cash, card, transfer, mercadopago, stripe |
| `EmployeeRole` | admin, manager, chef, waiter, cashier, host, delivery, accountant |
| `AccountType` | asset, liability, equity, income, expense |

### Modelos (25+ tablas)

**Core / Multi-tenencia**
- `Tenant` — Empresa/restaurante. Raíz del multi-tenant: configuración, moneda, zona horaria, plan y estado de suscripción.
- `User` — Usuarios con `tenantRole` (admin, manager, chef, waiter, cashier, accountant, host, delivery) o `globalRole` (super_admin).
- `Branch` — Sucursales del tenant.
- `TenantFeatureFlag` / `SystemFeatureFlag` — Feature flags por tenant y globales.

**POS & Menú**
- `ServiceArea` → `Table` → `Order` → `OrderItem` → `OrderItemModifier`
- `MenuCategory` → `MenuItem`
- `ModifierGroup` → `ModifierOption`
- `Payment` — Pagos con split de cuenta.

**Inventario**
- `Ingredient` → `Recipe` → `RecipeIngredient` (escandallos con costeo)
- `StockMovement` — Trazabilidad de entradas/salidas.

**RRHH**
- `Employee` → `Shift`, `Commission`

**CRM**
- `Customer` → `LoyaltyProgram` → `LoyaltyRedemption`

**Integraciones**
- `Integration` — Credenciales por tenant (Stripe, MercadoPago, Rappi, UberEats, Didi).

**Contabilidad**
- `Account` (jerárquico, `parentId`)
- `JournalEntry` → `JournalLine` (partida doble)
- `AccountingPeriod` — con cierre.

**Eventos**
- `Event` — Event store (domain events).
- `OutboxMessage` — Transactional outbox.

**Auth**
- `RefreshToken` — Rotación de tokens (SHA-256 hashed, familia de tokens).

**Auditoría**
- `AuditLog` — Por tenant.
- `SystemLog` — Super Admin (inmutable).

**Facturación**
- `Subscription` / `SubscriptionInvoice` — Plan actual, ciclos y facturas.
- `Invoice` — Facturas B2B manuales (Super Admin).

---

## Módulos del Sistema

### 1. Auth (Autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login con email + password → JWT (15m) + refresh (7d) |
| POST | `/auth/super-admin/login` | Login para super_admin |
| POST | `/auth/register` | Registro de nuevo tenant + admin |
| POST | `/auth/refresh` | Rotación de refresh token |
| POST | `/auth/logout` | Revoca refresh token |
| GET | `/auth/me` | Perfil del usuario autenticado |
| PATCH | `/auth/profile` | Actualizar perfil |
| PATCH | `/auth/change-password` | Cambiar contraseña |

**Flujo:**
1. Login → JWT payload: `sub`, `tenantId`, `globalRole`, `tenantRole`, `email`.
2. Middleware `authGuard` verifica JWT + header `x-tenant-id`.
3. Refresh token rotado (SHA-256, familia de tokens).
4. Login de mesero vía PIN en el módulo Waiter.

---

### 2. POS (Punto de Venta)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/pos/menu` | Menú completo con categorías y modificadores |
| GET | `/pos/menu/:categoryId` | Items de una categoría |
| GET | `/pos/tables` | Mapa de mesas con órdenes activas embebidas |
| PUT | `/pos/tables/:id/status` | Cambiar estado de mesa |
| GET | `/pos/orders` | Órdenes del día (paginado, filtro por status) |
| POST | `/pos/orders` | Crear orden (items, modificadores) |
| GET | `/pos/orders/:id` | Detalle de orden |
| PUT | `/pos/orders/:id/status` | Cambiar estado de orden |
| POST | `/pos/payments` | Procesar pago (cash/card/transfer/stripe/mercadopago) |
| POST | `/pos/payments/confirm` | Confirmar pago online tras webhook |
| POST | `/pos/payments/split` | Split de cuenta entre comensales |

**Creación de orden:**
```
PosService.createOrder()
  → CreateOrderUseCase.execute() (transaction)
    → OrderRepo.create() → Payment.createMany() → TableRepo.update() (occupied)
  → RecipeIngredient lookup → InventoryRepo.deductStock()
  → EventBus.publish(OrderCreatedEvent)
  → Inventory low-stock warnings
  → WebSocket broadcast al tenant
```

**Procesamiento de pago:**
```
PosService.processPayment()
  ├── cash/card/transfer → Payment.create() (completed)
  └── stripe/mercadopago → Payment.create() (pending)
      → Frontend: POST /integrations/payments/create-intent (Stripe)
      → Frontend: POST /integrations/payments/create-preference (MercadoPago)
      → Usuario completa el pago en el modal Stripe/MP
      → Webhook llama /integrations/payments/confirm
      → PosService.confirmPayment() → Payment.updateByOrder() (completed)
      → Mesa liberada a 'available'
```

---

### 3. Waiter (Mesero Móvil)

App independiente para meseros con tablet.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/waiter/auth/login` | Login con PIN + email |
| GET | `/waiter/menu` | Menú completo |
| GET | `/waiter/tables` | Mesas disponibles |
| POST | `/waiter/create-order` | Crear orden simplificada |
| POST | `/waiter/request-bill` | Solicitar cuenta |
| POST | `/waiter/process-payment` | Procesar pago simplificado |

**Autenticación del mesero:**
1. Ingresa email + PIN.
2. Se busca `Employee` por email y se verifica el PIN.
3. Se crea/actualiza el `User` asociado.
4. Se genera JWT con `tenantRole: 'waiter'` y `branchId`.
5. El frontend cambia a modo mesero (`useAuthStore.waiter`).

---

### 4. Menú

Gestionado vía POS y seed data.

- `MenuCategory` → ordenado por `sortOrder`.
- `MenuItem` → precio, costo, disponibilidad.
- `ModifierGroup` → grupo de opciones (ej. "Tipo de cocción").
- `ModifierOption` → opciones con precio adicional.

---

### 5. Inventario

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/inventory/ingredients` | Listar ingredientes |
| POST | `/inventory/ingredients` | Crear ingrediente |
| PUT | `/inventory/ingredients/:id` | Actualizar ingrediente |
| GET | `/inventory/recipes` | Listar recetas con costeo |
| POST | `/inventory/recipes` | Crear receta (asocia ingredientes a menu item) |
| PUT | `/inventory/recipes/:id` | Actualizar receta |
| GET | `/inventory/recipes/by-item/:menuItemId` | Receta por item |
| GET | `/inventory/stock-alerts` | Alertas de stock bajo (`currentStock < minimumStock`) |
| GET | `/inventory/stock-movements` | Historial de movimientos de stock |

**Deducción automática de stock (dentro de `CreateOrderUseCase`):**
1. Por cada `OrderItem`, busca la `Recipe` asociada al `MenuItem`.
2. Por cada `RecipeIngredient`, deduce cantidad × porción.
3. Crea `StockMovement` (`type: 'out'`).
4. Si `currentStock < minimumStock` → emite alerta de `lowStock`.

---

### 6. HR (Recursos Humanos)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/hr/employees` | Listar empleados |
| POST | `/hr/employees` | Crear empleado (`CreateEmployeeUseCase`) |
| GET | `/hr/employees/:id` | Detalle empleado |
| PUT | `/hr/employees/:id` | Actualizar empleado |
| GET | `/hr/shifts` | Turnos del día |
| POST | `/hr/shifts` | Crear turno |
| PUT | `/hr/shifts/:id` | Actualizar turno |
| GET | `/hr/roles` | Listar roles disponibles |
| GET | `/hr/commissions` | Comisiones por empleado |
| POST | `/hr/verify-pin` | Verificar PIN de empleado |

---

### 7. CRM & Loyalty

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/crm/customers` | Listar clientes (búsqueda, filtros) |
| POST | `/crm/customers` | Crear cliente |
| GET | `/crm/customers/:id` | Detalle + historial de órdenes |
| PUT | `/crm/customers/:id` | Actualizar cliente |
| GET | `/crm/segments` | Segmentación de clientes |
| GET | `/crm/loyalty/program` | Programa de lealtad actual |
| POST | `/crm/loyalty/redeem` | Canjear puntos |
| GET | `/crm/loyalty/rewards` | Historial de recompensas canjeadas |

**Lógica de lealtad:**
- `pointsPerUnit`: puntos por moneda gastada.
- `unitPerPoint`: moneda necesaria por punto.
- `tiers`: JSON con niveles (bronze, silver, gold, platinum).
- Redención vía `RedeemPointsUseCase`: valida saldo suficiente, decrementa puntos, crea registro.

---

### 8. Integraciones (Terceros)

**Pagos**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/integrations/payments` | Listar conexiones de pago |
| POST | `/integrations/payments` | Conectar proveedor de pago |
| POST | `/integrations/payments/create-intent` | Crear PaymentIntent (Stripe) |
| POST | `/integrations/payments/create-preference` | Crear preferencia (MercadoPago) |
| POST | `/integrations/payments/confirm` | Confirmar pago online |

**Delivery**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/integrations/delivery` | Listar conexiones delivery |
| POST | `/integrations/delivery` | Conectar proveedor (Rappi/UberEats/Didi) |
| GET | `/integrations/delivery/:provider/orders` | Órdenes delivery activas |
| PUT | `/integrations/delivery/:provider/orders/:orderId/status` | Actualizar estado |
| POST | `/integrations/delivery/:provider/sync-menu` | Sincronizar menú |
| POST | `/integrations/delivery/:provider/webhook` | Webhook de delivery |

**Webhooks**

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/webhooks/stripe` | Webhook Stripe (verifica firma) |
| POST | `/webhooks/mercadopago` | Webhook MercadoPago (IPN) |
| POST | `/webhooks` | Webhook genérico |

**Gestión**

| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/integrations/:id` | Toggle `enabled`/`isActive` |
| DELETE | `/integrations/:id` | Desconectar integración |

**Providers implementados:**

| Provider | SDK / Método | Funciones |
|---|---|---|
| **Stripe** | SDK `stripe` | createPaymentIntent, createCheckoutSession, handleWebhook, createCustomer, getPaymentIntent, confirmPayment |
| **MercadoPago** | SDK `mercadopago` | createPreference, handleWebhook, getPaymentInfo, confirmPayment |
| **Rappi** | HTTP fetch | handleOrderNotification, updateOrderStatus, syncMenu, getOrders |
| **UberEats** | HTTP fetch | handleOrderNotification, updateOrderStatus, syncMenu, getOrders |

Los providers de delivery usan caché en memoria (Map) para órdenes entrantes vía webhook.

---

### 9. Contabilidad (Doble Entrada)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/accounting/accounts` | Plan de cuentas (árbol) |
| POST | `/accounting/accounts` | Crear cuenta contable |
| PUT | `/accounting/accounts/:id` | Actualizar cuenta |
| POST | `/accounting/accounts/import` | Importar cuentas batch |
| GET | `/accounting/journal-entries` | Asientos contables |
| POST | `/accounting/journal-entries` | Crear asiento manual |
| PATCH | `/accounting/journal-entries/:id` | Actualizar borrador |
| POST | `/accounting/journal-entries/:id/post` | Publicar asiento |
| GET | `/accounting/trial-balance` | Balance de comprobación |
| GET | `/accounting/balance-sheet` | Balance general |
| GET | `/accounting/income-statement` | Estado de resultados |
| GET | `/accounting/general-ledger` | Libro mayor |
| GET | `/accounting/periods` | Períodos contables |
| POST | `/accounting/periods` | Crear período |
| POST | `/accounting/periods/:id/close` | Cerrar período |
| GET | `/accounting/odata/:entity` | Feed OData |

**Validación de doble entrada:**
- Débitos = Créditos (tolerancia 0.001).
- La cuenta debe existir y estar activa.
- El período no debe estar cerrado.
- Los asientos automáticos se crean desde las órdenes de POS.

---

### 10. Analytics & BCG Matrix

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/analytics/sales-summary` | Resumen de ventas (totalRevenue, totalOrders, avgTicket, peakHours, topItems) |
| GET | `/analytics/bcg-matrix` | Matriz BCG (proxy a Python/FastAPI o cálculo local) |
| GET | `/analytics/performance` | Comparativa mes contra mes |
| GET | `/analytics/peak-hours` | Distribución de horas pico |
| GET | `/analytics/multi-branch-report` | Reporte multi-sucursal |

**BCG Matrix:**
- Ejes: Market Share vs Revenue Growth.
- Cuadrantes: Star, Cash Cow, Question Mark, Dog.
- Cache: 5 minutos.
- Opcionalmente hace proxy al microservicio Python para clustering con scikit-learn.

---

### 11. Suscripciones y Planes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/subscriptions/plans` | Planes disponibles (basic/pro/enterprise) |
| GET | `/subscriptions/current` | Suscripción actual del tenant |
| PUT | `/subscriptions/change-plan` | Cambiar de plan |
| GET | `/subscriptions/invoices` | Facturas de suscripción |

**Feature flags por plan:** 15 features controladas (`kds`, `table_management`, `split_bills`, `inventory_auto`, `hr_scheduling`, `bcg_matrix`, `crm_full`, `loyalty_program`, `pos`, `analytics`, `accounting`, etc.).

---

### 12. Super Admin

Panel de administración global (18+ endpoints).

| Endpoint | Descripción |
|---|---|
| `GET /super-admin/companies` | Listar todas las empresas |
| `POST /super-admin/companies` | Crear empresa (`CreateCompanyUseCase`) |
| `GET /super-admin/companies/:id` | Detalle empresa |
| `PUT /super-admin/companies/:id` | Actualizar empresa |
| `PATCH /super-admin/companies/:id/modules` | Activar/desactivar módulos |
| `DELETE /super-admin/companies/:id` | Eliminar empresa |
| `POST /super-admin/companies/:id/resend-credentials` | Reenviar credenciales |
| `POST /super-admin/companies/:id/migrate-plan` | Migrar plan |
| `POST /super-admin/companies/:id/toggle-status` | Suspender/activar |
| `PUT /super-admin/companies/:id/extra-users` | Vender cupos extra de usuarios |
| `GET /super-admin/invoices` | Facturas B2B |
| `POST /super-admin/invoices/mark-paid` | Marcar pagada |
| `POST /super-admin/invoices/manual` | Crear factura manual |
| `GET /super-admin/calendar-events` | Eventos operativos |
| `POST /super-admin/calendar-events` | Crear evento |
| `DELETE /super-admin/calendar-events/:id` | Eliminar evento |
| `GET /super-admin/audit-logs` | Logs de auditoría |
| `GET /super-admin/dashboard` | Métricas globales (MRR, distribución de planes) |
| `GET /super-admin/plans` | Planes del sistema |
| `GET /super-admin/system-health` | Health checks (DB + Redis) |
| `POST /super-admin/announcements` | Anuncios |
| `GET /super-admin/feature-flags` | Feature flags globales |
| `PUT /super-admin/feature-flags` | Actualizar feature flag |
| `POST /super-admin/toggle-all-features` | Toggle masivo |

**Métricas de dashboard:** MRR (Monthly Recurring Revenue) con tendencia, distribución de planes, empresas activas vs. totales, ingresos por período.

---

### 13. Onboarding

Flujo de 3 pasos para nuevos tenants:

| Método | Ruta | Paso |
|---|---|---|
| POST | `/onboarding/profile` | 1. Perfil del restaurante |
| POST | `/onboarding/areas` | 2. Áreas y mesas |
| POST | `/onboarding/modules` | 3. Selección de módulos |
| POST | `/onboarding/launch` | Launch: marca `onboardingCompleted = true` |
| GET | `/onboarding/status` | Estado del onboarding |

El sistema se auto-configura según el tipo de negocio elegido al registrarse:

| Tipo de negocio | Features activadas |
|------|-------------------|
| **Alta Cocina** | POS, mesas, splits, KDS, CRM, loyalty, BCG, inventario, RRHH, analítica, contabilidad |
| **Fast Food** | POS, KDS, online ordering, delivery, inventario, analítica |
| **Cafetería** | POS, KDS, online, loyalty, inventario, analítica |
| **Food Truck** | POS, KDS, online, delivery |
| **Bar** | POS, mesas, splits, KDS, loyalty, RRHH, analítica, contabilidad |
| **Franquicia** | POS, multi-sucursal, todo incluido |

---

## Flujo Multi-Tenant

```
Header: x-tenant-id: <uuid-del-tenant>
```

### Aislamiento a nivel Prisma

El `PrismaClient` usa una extensión `$extends` que:

1. **Auto-filtra** `findMany`, `findFirst`, `findUnique`, `findUniqueOrThrow` → agrega `where.tenantId`.
2. **Auto-asigna** `create` → asigna `data.tenantId`.
3. **Auto-filtra** `update`, `updateMany`, `delete`, `deleteMany`, `upsert` → agrega `where.tenantId`.

Aplica a 21 modelos tenant-scoped. El `tenantId` se obtiene de `TenantContext` (AsyncLocalStorage).

### Flujo de request

```
Request → authGuard (JWT → tenantId) → tenantIsolationMiddleware
  → TenantContext.run(tenantId, callback)
    → handler ejecuta dentro del contexto
      → Prisma extension lee TenantContext → scope automático
```

### Excepciones

- Super Admin (`globalRole: super_admin`) no tiene `tenantId` — acceso global.
- Modelos globales: `SystemFeatureFlag`, `SystemLog`, `Permission`, `RolePermission`.

---

## Flujo POS Completo

```
1. Mesero abre mesa (PUT /pos/tables/:id/status → 'occupied')

2. Toma orden (POST /pos/orders)
   ├── Valida items existen en menú
   ├── Crea Order + OrderItems + OrderItemModifiers
   ├── Transaction:
   │   ├── OrderRepo.create()
   │   ├── TableRepo.update() → status 'occupied'
   │   └── InventoryRepo.deductStock()
   ├── Publica OrderCreatedEvent
   ├── Verifica stock bajo → alerta
   └── WebSocket broadcast a KDS y sala del tenant

3. Cocina ve orden en KDS (GET /pos/kds)

4. Cocina marca "preparando" → "listo" (PUT /pos/orders/:id/status)

5. Mesero sirve → marca "servido"
   WebSocket broadcast cambios de estado en tiempo real

6. Cliente pide cuenta → split opcional (POST /pos/payments/split)

7. Procesa pago (POST /pos/payments)
   ├── Cash: Payment.create(completed) + Table.available
   ├── Card: Payment.create(completed) + Table.available
   ├── Transfer: Payment.create(completed) + Table.available
   ├── Stripe: Payment.create(pending) →
   │   POST /integrations/payments/create-intent → clientSecret
   │   → Frontend Stripe Elements → confirm → POST /pos/payments/confirm
   └── MercadoPago: Payment.create(pending) →
       POST /integrations/payments/create-preference → initPoint
       → Modal MP → POST /pos/payments/confirm
```

---

## Sistema de Eventos y WebSockets

### Transactional Outbox Pattern

```
UseCase.execute()
  → EventBus.publish(event)
    → OutboxEventBus.publish()
      → INSERT INTO outbox_messages (eventName, payload, ...)
      → Ejecuta handlers inline sincrónicamente
      → Retorna

OutboxProcessor (polling cada 5s, batch 50):
  → SELECT * FROM outbox_messages WHERE status='pending'
  → Procesa cada mensaje
  → Si falla → retry con backoff exponencial (1s, 2s, 4s... max 30s)
  → Si maxRetries excedido → status='failed' (dead letter)
```

### WebSocket Broadcasting

```
EventBroadcaster (suscrito a '*' en EventBus):
  → Recibe evento
  → websocketGateway.broadcastToTenant(tenantId, eventName, payload)
  → Socket.IO emite a sala 'tenant:{tenantId}'

WebSocket Gateway:
  → Clientes se autentican con JWT en el handshake
  → Se unen a la sala 'tenant:{tenantId}'
  → Reciben eventos en tiempo real (nuevas órdenes, cambios de estado, etc.)
```

---

## Planes de Suscripción

| Característica | Basic ($499 MXN) | Pro ($999 MXN) | Enterprise ($2,499 MXN) |
|---|:---:|:---:|:---:|
| Usuarios | 3 | 10 | ∞ |
| Sucursales | 1 | 3 | ∞ |
| Transacciones/mes | 500 | 2,000 | 10,000 |
| Almacenamiento | 1 GB | 5 GB | 25 GB |
| **POS / KDS / Mapa de mesas / Split de cuentas** | ✅ | ✅ | ✅ |
| **Inventario / RRHH / CRM / Analítica / Contabilidad** | — | ✅ | ✅ |
| **Facturación electrónica / Integración delivery** | — | ✅ | ✅ |
| **BCG Matrix / Loyalty Program / Multi-sucursal** | — | — | ✅ |

> Los usuarios extra pueden adquirirse en cualquier plan mediante cupos vendidos desde el panel de Super Admin.

---

## Inicio Rápido

### Prerrequisitos

- Node.js >= 20
- pnpm >= 9
- Docker Desktop (para Postgres/Redis local, opcional)
- Python 3.12+ (para el servicio de analytics)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/jesus3131/gastrocore_saas_platform.git
cd gastrocore_saas_platform
pnpm install
```

### 2. Configurar base de datos

```bash
# El proyecto usa Prisma Postgres cloud por defecto (ya configurado en .env)
# Para PostgreSQL local, edita packages/backend/.env:
# DATABASE_URL="postgresql://user:pass@localhost:5432/gastrocore"
```

### 3. Generar Prisma Client y sincronizar schema

```bash
npx prisma generate
npx prisma db push
npx prisma db seed    # Datos de prueba
```

### 4. Iniciar desarrollo

```bash
pnpm dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health Check | http://localhost:4000/health |
| Prisma Studio | `npx prisma studio` |

### Prototipos HTML

Los 19 prototipos se abren directamente en el navegador, por ejemplo:

```
packages/frontend/prototypes/pos/vista/pos-order-taking.html
```

---

## Scripts Disponibles

### Desarrollo

```bash
pnpm dev                  # Frontend + backend concurrente (Turborepo)
pnpm build                # Build producción (shared → backend + frontend)
pnpm lint                 # ESLint en todos los paquetes
pnpm typecheck            # TypeScript type checking (tsc -b)
pnpm test                 # Tests (Vitest)
```

### Base de Datos

```bash
npx prisma generate       # Generar Prisma Client
npx prisma db push        # Push schema a DB
npx prisma db seed        # Sembrar datos de prueba
npx prisma studio         # UI de gestión de datos
```

### Docker

```bash
pnpm docker:dev           # Entorno completo vía Docker Compose
```
o manualmente:
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

---

## API Routes (resumen)

Prefijo base: `/api/v1/`. Todas las rutas (excepto login/registro/webhooks) requieren `Authorization: Bearer <token>` y header `x-tenant-id`.

| Módulo | Base Path | Endpoints |
|---|---|---|
| Auth | `/auth` | 8 |
| POS | `/pos` | 11 |
| Waiter | `/waiter` | 6 |
| Menú | `/pos/menu` | incluido en POS |
| Inventory | `/inventory` | 9 |
| HR | `/hr` | 9 |
| CRM | `/crm` | 8 |
| Integrations | `/integrations` | 14 |
| Accounting | `/accounting` | 15+ |
| Analytics | `/analytics` | 5 |
| Subscriptions | `/subscriptions` | 4 |
| Super Admin | `/super-admin` | 18+ |
| Onboarding | `/onboarding` | 5 |
| Webhooks | `/webhooks` | 3 |
| Health | `/health` | 1 |

**Total: ~115+ endpoints.** El detalle completo de cada endpoint está documentado en la sección [Módulos del Sistema](#módulos-del-sistema).

---

## Frontend

### Rutas

| Ruta | Página | Guards |
|---|---|---|
| `/login` | Login | AuthLayout |
| `/register` | Registro | AuthLayout |
| `/waiter` | Waiter App (mobile) | — |
| `/onboarding` | Onboarding | SessionGuard + ProtectedRoute |
| `/dashboard` | Dashboard principal | SessionGuard + ProtectedRoute + OnboardingGuard |
| `/pos` | POS - Nueva orden | guards |
| `/pos/tables` | Mapa de mesas | guards |
| `/pos/checkout` | Checkout / Pago | guards |
| `/pos/kds` | Kitchen Display System | guards |
| `/pos/service` | POS modo mesero | guards |
| `/inventory` | Inventario | guards |
| `/inventory/recipes` | Recetas | guards |
| `/hr` | RH / Empleados | guards |
| `/analytics` | Analytics | guards |
| `/crm` | Clientes | guards |
| `/crm/loyalty` | Lealtad | guards |
| `/integrations` | Delivery Hub | guards |
| `/integrations/channels` | Config. canales de pago | guards |
| `/accounting` | Contabilidad | guards |
| `/accounting/accounts` | Plan de cuentas | guards |
| `/accounting/journal-entries` | Asientos | guards |
| `/accounting/statements` | Estados financieros | guards |
| `/accounting/settings` | Config. contable | guards |
| `/settings` | Configuración | guards |
| `/settings/profile` | Perfil | guards |
| `/super-admin` | Panel Super Admin | guards |
| `/super-admin/companies/:id` | Detalle empresa | guards |

### Guards (encadenados)

- `SessionGuard`: verifica sesión activa contra el backend.
- `ProtectedRoute`: redirige a `/login` si no autenticado.
- `OnboardingGuard`: redirige a `/onboarding` si el onboarding está pendiente.
- `SuperAdminBlock`: redirige a `/super-admin` si es super_admin.
- `WaiterBlock`: redirige a `/pos/service` si es mesero.

### Estado global (Zustand + persist)

- `auth.store`: usuario, tokens, autenticación, modo waiter.
- `theme.store`: tema claro/oscuro.

---

## Despliegue

### Desarrollo local

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### Docker Compose v3

```bash
docker compose -f infrastructure/docker/docker-compose.v3.yml up -d
```

**Contenedores:**

| Servicio | Puerto | Imagen |
|---|---|---|
| PostgreSQL | 5433 (v3) / 5432 | postgres:16-alpine |
| Redis | 6380 (v3) / 6379 | redis:7-alpine |
| Backend | 4001 (v3) / 4000 | gastrocore-v3-backend |
| Frontend | 8081 (v3) / 80 | gastrocore-v3-frontend |
| Analytics | 8001 | gastrocore-v3-analytics |

### Variables de entorno principales (52 vars en `.env.example`)

| Categoría | Variables clave |
|---|---|
| DB | `DATABASE_URL` |
| Redis | `REDIS_URL` |
| JWT | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION` |
| Storage | `STORAGE_*`, `UPLOAD_DIR` |
| Email | `SMTP_*` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| MercadoPago | `MERCADOPAGO_ACCESS_TOKEN` |
| Delivery | `RAPPI_API_URL`, `UBER_EATS_API_URL` |
| Analytics | `ANALYTICS_API_URL` |
| Entorno | `NODE_ENV` (`development` / `production` / `test`) |

### Kubernetes

```bash
kubectl apply -k infrastructure/k8s/
```

- Namespace: `gastro-core`.
- Backend: 2 réplicas, rolling update, liveness/readiness probes.
- Frontend: 2 réplicas, rolling update.
- Ingress con TLS vía cert-manager.

### CI/CD (GitHub Actions)

4 jobs:
1. `lint-typecheck` — ESLint + TypeScript.
2. `test` — Vitest con contenedores de servicio PostgreSQL + Redis.
3. `build` — Compilación.
4. `docker` — Build y push de imágenes (solo rama `main`).

Pipeline resumido: `lint → typecheck → test → build → docker build → push`.

---

## Seed Data / Usuarios de Prueba

Se ejecuta automáticamente en el entrypoint de Docker:

```bash
cd packages/backend && npx prisma db seed
```

### Datos sembrados

- **Tenant:** "La Cocina de Juan" (plan: pro).
- **Super Admin:** "RestoPro Platform".
- **32 cuentas contables** (activo, pasivo, capital, ingresos, gastos).
- **16 items de menú** en 4 categorías (Entradas, Platos Fuertes, Postres, Bebidas).
- **8 empleados** (admin, manager, chef, waiter, cashier, host, 2 delivery).
- **8 clientes** con datos de lealtad.
- **Integraciones:** Rappi, UberEats, MercadoPago.
- **Feature flags:** habilitados todos los del plan pro.

### Cuentas de acceso

**Admin**

| Email | Contraseña | Rol |
|-------|-----------|:---:|
| `superadmin@restopro.com` | `RestoPro2024!` | super_admin |
| `admin@lacocina.com` | `admin123` | admin |

**Empleados (acceso PIN en POS)**

| Nombre | Email | PIN | Rol |
|--------|-------|:---:|:---:|
| Carlos Hernández | `carlos@lacocina.com` | `1234` | chef |
| María García | `maria@lacocina.com` | `2345` | waiter |
| José López | `jose@lacocina.com` | `3456` | waiter |
| Ana Martínez | `ana@lacocina.com` | `4567` | cashier |
| Sofía Torres | `sofia@lacocina.com` | — | manager |
| Luis Mendoza | `luis@lacocina.com` | — | waiter |
| Diego Ramírez | `diego@lacocina.com` | — | host |
| Valentina Ruiz | `valentina@lacocina.com` | — | delivery |

**Mesero (app móvil):** `mesero@lacocina.com` / `mesero123` (PIN: `1234`)

**Clientes CRM**

| Nombre | Email | Segmento | Puntos |
|--------|-------|:--------:|:------:|
| Roberto Sánchez | `roberto@email.com` | VIP | 2500 |
| Laura Fernández | `laura@email.com` | VIP | 1680 |
| Pedro Ramírez | `pedro@email.com` | regular | 420 |
| Carmen Díaz | `carmen@email.com` | VIP | 4400 |
| Miguel Ángel Torres | `miguel@email.com` | nuevo | 109 |
| Gabriela Ortiz | `gabriela@email.com` | regular | 760 |
| Jorge Hernández | `jorge@email.com` | nuevo | 0 |
| Patricia Vega | `patricia@email.com` | regular | 320 |

---

## Tests

```
97 tests — 10 archivos de test — Todos pasando
```

| Archivo | Tests |
|---|---|
| `auth/auth.service.test.ts` | 23 |
| `waiter/waiter.service.test.ts` | 16 |
| `guards/permission.guard.test.ts` | 17 |
| `inventory/inventory.service.test.ts` | 13 |
| `events/outbox-processor.test.ts` | 8 |
| `events/outbox-event-bus.test.ts` | 5 |
| `guards/auth.guard.test.ts` | 5 |
| `interceptors/correlation-id.test.ts` | 4 |
| `use-cases/pos/create-order.use-case.test.ts` | 4 |
| `use-cases/hr/create-employee.use-case.test.ts` | 2 |

```bash
# Ejecutar tests
cd packages/backend && pnpm test

# Lint + TypeCheck
pnpm lint && pnpm typecheck
```

---

## Servicio de Analítica (Python)

Microservicio independiente para análisis avanzados:

```bash
cd packages/analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Endpoints

| Ruta | Descripción |
|------|-------------|
| `GET /api/v2/analytics/bcg-matrix` | Clasifica platos en Estrella / Vaca / Interrogante / Perro |
| `GET /api/v2/analytics/sales-forecast` | Predicción de ventas (media móvil) |

---

## Mejoras Recientes

### Rendimiento y Optimización

- **Eliminación de N+1 queries**: `getTables` batch de órdenes activas con `DISTINCT ON`; `deductInventory` batch de recipes + stock movements.
- **Agregaciones en SQL**: sales summary, BCG matrix, performance, peak hours, trial balance, balance sheet e income statement usan `GROUP BY` en PostgreSQL en lugar de cargar todas las filas en memoria.
- **Capa de caché**: caché in-memory con TTL configurable para analytics y estados financieros.
- **bcrypt optimizado**: salt rounds reducido de 12 a 10 (~4x más rápido en login).
- **Importación batch**: `importAccounts` usa `createMany` en vez de N inserts individuales.
- **Paginación en POS**: `getOrders` soporta `limit`, `offset` y filtro por `status`.
- **Frontend**: `React.lazy` + `Suspense` en todas las rutas, reduce el bundle inicial ~70%.
- **Vite**: sourcemaps deshabilitados en producción, minify con `esbuild`, chunks separados para `socket.io-client` y `lucide-react`.
- **WebSocket**: suscripciones singleton evitan duplicados de handlers.

### Funcionalidades

- **Fix feature flags en navegación**: corrección de nombres de flags en `dashboard.layout.tsx` para que los módulos se muestren correctamente.
- **Super Admin Module**: panel completo para gestión de empresas, planes, módulos y cupos extra.
- **Cross-tenant validation**: guard `authGuard` valida `x-tenant-id` contra el JWT (excepto super_admin).
- **Rol contador (`accountant`)**: nuevo rol con permisos contables, filtro en el frontend de HR.
- **User limit enforcement**: validación del límite de usuarios contra el plan + cupos extra.
- **Plan comparison table**: tabla interactiva en Settings.
- **OData feeds**: endpoints OData para exportación contable.

### Correcciones Técnicas

- **Fix seed `createAccountTree`**: propagación recursiva de cuentas hijas corregida.
- **Fix TypeScript `tsc -b`**: configuración `tsconfig.node.json` corregida para TS 5.x.
- **Fix `baseUrl` en tsconfig**: eliminado por ser deprecated con `moduleResolution: bundler`.
- **Dockerfiles**: copias selectivas por directorio + entrypoint con auto-migración.
- **Prisma Postgres**: 24+ modelos desplegados en Prisma Postgres cloud.
- **Zod validation**: schemas en 7 módulos + middleware `validate()` en todas las rutas.
- **ESLint flat config**: configuración moderna con `typescript-eslint` y `eslint-plugin-react-hooks`.
- **Tests config**: Vitest configurado para backend (node) y frontend (jsdom + React).

---

## Licencia

Proyecto privado — GastroCore SaaS Platform.