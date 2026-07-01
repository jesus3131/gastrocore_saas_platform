# GastroCore

**Plataforma SaaS todo-en-uno para gestión integral de restaurantes.**

Multi-tenencia · Multi-sucursal · Multi-nicho (alta cocina, fast food, cafeterías, food trucks, bares, franquicias).

---

## Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelo de Datos](#modelo-de-datos)
- [Feature Flags & Onboarding](#feature-flags--onboarding-automático)
- [Planes de Suscripción](#planes-de-suscripción)
- [Inicio Rápido](#inicio-rápido)
- [Scripts Disponibles](#scripts-disponibles)
- [Usuarios de Prueba](#usuarios-de-prueba-seed-data)
- [API Endpoints](#api-endpoints)
- [Despliegue](#despliegue)
- [Servicio de Analítica Python](#servicio-de-analítica-python)
- [Mejoras Recientes](#mejoras-recientes)
- [Licencia](#licencia)

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS 3 + Zustand + React Query |
| **Backend** | Node.js + Express + TypeScript + Prisma ORM + Zod |
| **Database** | PostgreSQL + Redis (caching) |
| **Monorepo** | pnpm workspaces + Turborepo v2 |
| **Analítica** | Python + FastAPI (Pandas, scikit-learn) |
| **Infra** | Docker · Docker Compose · GitHub Actions CI/CD |
| **Tiempo Real** | Socket.IO (WebSocket + polling) |
| **Autenticación** | JWT + bcrypt + refresh tokens |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                        Clientes                              │
│   (Web App · POS Tablet · KDS Cocina · Delivery Apps)       │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                    API Gateway (Express)                      │
│         Rate Limiting · JWT Auth · Tenant Routing            │
└────┬────────┬────────┬────────┬────────┬────────┬────────┬───┘
     │        │        │        │        │        │        │
┌────▼──┐ ┌──▼─────┐ ┌▼──────┐ ┌▼─────┐ ┌▼─────┐ ┌▼──────┐ ┌▼──────┐
│ Auth  │ │  POS   │ │ Inv.  │ │ HR   │ │ CRM  │ │  An.  │ │ Integ.│
│       │ │        │ │       │ │      │ │      │ │       │ │       │
└───┬───┘ └───┬────┘ └───┬───┘ └──┬───┘ └──┬───┘ └───┬───┘ └───┬───┘
    │         │          │        │        │         │         │
┌───▼─────────▼──────────▼────────▼────────▼─────────▼─────────▼────┐
│                     PostgreSQL + Redis                            │
│              Multi-tenencia via tenantId column                   │
└──────────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

- **Multi-tenencia lógica**: Cada registro tiene `tenantId` como discriminador; sin bases de datos separadas.
- **Modular**: Cada módulo de negocio (POS, inventario, RRHH, etc.) es independiente con sus propias rutas, controladores y servicios.
- **Use Cases**: Lógica de dominio compleja extraída a casos de uso inyectables vía contenedor DI.
- **Tiempo real**: Socket.IO con autenticación JWT para actualizaciones de órdenes y mesas en vivo.
- **Caching**: Capa de caché en memoria (con TTL configurable) en analytics y estados financieros.

---

## Estructura del Proyecto

```
gastrocore_saas_platform/
│
├── packages/
│   ├── shared/                    # Tipos, constantes, lógica compartida
│   │   └── src/
│   │       ├── types/             # Interfaces del dominio (Order, Customer, etc.)
│   │       ├── constants/         # Planes, permisos, rutas API
│   │       └── index.ts
│   │
│   ├── backend/                   # API REST (Node.js + Express + TypeScript)
│   │   ├── prisma/
│   │   │   └── schema.prisma      # 24 modelos de datos
│   │   └── src/
│   │       ├── config/            # App, database, env, logger, routes
│   │       ├── common/            # Guards, filters, interceptors, validation, cache
│   │       ├── modules/           # 13 módulos funcionales (auth, pos, analytics, etc.)
│   │       ├── core/              # Use cases y puertos de repositorio
│   │       └── infrastructure/    # DI container, servicios externos
│   │
│   ├── frontend/                  # SPA React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── features/          # 10 features (auth, pos, inventory, hr, crm, accounting, etc.)
│   │   │   ├── layouts/           # DashboardLayout, AuthLayout
│   │   │   ├── app/              # Store (Zustand), hooks (useWebsocket, useRealtime)
│   │   │   ├── shared/           # Componentes UI reutilizables
│   │   │   └── lib/              # API client (Axios)
│   │   ├── prototypes/           # 19 prototipos HTML modulares (vista/css/js)
│   │   └── vite.config.ts
│   │
│   └── analytics/                 # Microservicio Python (FastAPI)
│       ├── main.py                # BCG Matrix, forecasting
│       └── requirements.txt
│
├── infrastructure/
│   └── docker/                    # Docker Compose + Nginx + Dockerfiles multi-stage
│
├── prisma.config.ts               # Config Prisma con dotenv
├── turbo.json                     # Turborepo v2 pipeline
├── pnpm-workspace.yaml
├── eslint.config.js               # ESLint flat config
└── package.json
```

---

## Modelo de Datos

El schema de Prisma define **24 modelos** organizados por dominio:

### Multi-tenencia
| Modelo | Descripción |
|--------|-------------|
| **Tenant** | Núcleo del negocio con configuración, plan y estado de suscripción |
| **User** | Usuarios con roles (`admin`, `manager`, `chef`, `waiter`, `cashier`, `accountant`, `host`, `delivery`) |
| **TenantFeatureFlag** | Feature flags por tenant para activación modular |

### POS & Menú
| Modelo | Descripción |
|--------|-------------|
| **MenuCategory** | Categorías de menú con ordenamiento |
| **MenuItem** | Productos con precio, costo, disponibilidad |
| **ModifierGroup / ModifierOption** | Modificadores (términos de cocción, ingredientes extra) |
| **Order / OrderItem / OrderItemModifier** | Órdenes, items y modificadores |
| **Payment** | Pagos con split de cuenta |

### Operaciones
| Modelo | Descripción |
|--------|-------------|
| **Branch / ServiceArea / Table** | Multi-sucursal con mapa de mesas y áreas |
| **Ingredient / Recipe / RecipeIngredient** | Inventario y escandallos con costeo |
| **StockMovement** | Trazabilidad de entradas/salidas de stock |

### RRHH
| Modelo | Descripción |
|--------|-------------|
| **Employee / Shift / Commission** | Gestión de personal, turnos y comisiones |

### CRM
| Modelo | Descripción |
|--------|-------------|
| **Customer** | Historial de compras, segmentación, puntos de lealtad |
| **LoyaltyProgram / LoyaltyRedemption** | Programa de fidelización multi-nivel |

### Contabilidad
| Modelo | Descripción |
|--------|-------------|
| **Account** | Catálogo de cuentas (jerárquico) |
| **JournalEntry / JournalLine** | Asientos contables (partida doble) |
| **AccountingPeriod** | Periodos contables con cierre |

### Subscripciones
| Modelo | Descripción |
|--------|-------------|
| **Subscription / SubscriptionInvoice** | Planes, facturación y ciclos |

### Integraciones
| Modelo | Descripción |
|--------|-------------|
| **Integration** | Credenciales para delivery (Rappi, Uber Eats, Didi) |

### Auditoría
| Modelo | Descripción |
|--------|-------------|
| **AuditLog** | Registro de acciones sensibles |

---

## Feature Flags & Onboarding Automático

El sistema se auto-configura según el tipo de negocio al registrarse:

| Tipo | Features Activadas |
|------|-------------------|
| **Alta Cocina** | POS, Mesas, splits, KDS, CRM, loyalty, BCG, inventario, RRHH, analítica, contabilidad |
| **Fast Food** | POS, KDS, online ordering, delivery, inventario, analítica |
| **Cafetería** | POS, KDS, online, loyalty, inventario, analítica |
| **Food Truck** | POS, KDS, online, delivery |
| **Bar** | POS, Mesas, splits, KDS, loyalty, RRHH, analítica, contabilidad |
| **Franquicia** | POS, Multi-sucursal, todo incluido |

### Flujo de Onboarding
1. **Registro** → selección de tipo de negocio y plan
2. **Configuración** → áreas, mesas, moneda
3. **Activación** → módulos deseados (según plan)
4. **Lanzamiento** → sistema listo para operar

---

## Planes de Suscripción

| Característica | Básico ($49/mes) | Pro ($129/mes) | Enterprise ($349/mes) |
|---------------|:----------------:|:--------------:|:--------------------:|
| Usuarios | 3 | 15 | ∞ |
| Sucursales | 1 | 3 | ∞ |
| Transacciones/mes | 1,000 | 10,000 | ∞ |
| Almacenamiento | 5 GB | 50 GB | 500 GB |
| **POS (Punto de Venta)** | ✅ | ✅ | ✅ |
| **KDS (Cocina)** | ✅ | ✅ | ✅ |
| **Mapa de Mesas** | ✅ | ✅ | ✅ |
| **Split de cuentas** | ✅ | ✅ | ✅ |
| **Inventario** | — | ✅ | ✅ |
| **RRHH** | — | ✅ | ✅ |
| **CRM** | — | ✅ | ✅ |
| **Analítica** | — | ✅ | ✅ |
| **Contabilidad** | — | ✅ | ✅ |
| **Facturación electrónica** | — | ✅ | ✅ |
| **Integración delivery** | — | ✅ | ✅ |
| **BCG Matrix** | — | — | ✅ |
| **Loyalty Program** | — | — | ✅ |
| **Multi-sucursal** | — | — | ✅ |

> Los usuarios extra pueden adquirirse en cualquier plan a $5/user/mes.

---

## Inicio Rápido

### Prerrequisitos
- Node.js >= 20
- pnpm >= 9
- Docker Desktop (para Redis local, opcional)
- Python 3.12+ (para analytics)

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
Los 19 prototipos se abren directamente en el navegador:
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
pnpm docker:dev           # Entorno completo via Docker Compose
```
o manualmente:
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

---

## Usuarios de Prueba (Seed Data)

### Admin
| Email | Contraseña | Rol |
|-------|-----------|:---:|
| `superadmin@restopro.com` | `RestoPro2024!` | super_admin |
| `admin@lacocina.com` | `admin123` | admin |

### Empleados (acceso PIN en POS)
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

### Clientes CRM
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

## API Endpoints

Todas las rutas están bajo el prefijo `/api/v1/` y requieren autenticación JWT vía header `Authorization: Bearer <token>`.

### Autenticación
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|:----:|
| POST | `/api/v1/auth/login` | Iniciar sesión | — |
| POST | `/api/v1/auth/register` | Registrar nuevo tenant | — |
| POST | `/api/v1/auth/refresh` | Refrescar token | — |
| POST | `/api/v1/auth/logout` | Cerrar sesión | ✅ |
| GET | `/api/v1/auth/me` | Perfil del usuario | ✅ |
| PUT | `/api/v1/auth/profile` | Actualizar perfil | ✅ |
| PUT | `/api/v1/auth/password` | Cambiar contraseña | ✅ |

### POS
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/pos/menu` | Menú completo con categorías y modificadores |
| GET | `/api/v1/pos/menu/:categoryId/items` | Items por categoría |
| GET | `/api/v1/pos/tables` | Mapa de mesas con órdenes activas |
| PUT | `/api/v1/pos/tables/:id/status` | Actualizar estado de mesa |
| GET | `/api/v1/pos/orders` | Listar órdenes (paginado, filtro por status) |
| POST | `/api/v1/pos/orders` | Crear orden |
| GET | `/api/v1/pos/orders/:id` | Detalle de orden |
| PUT | `/api/v1/pos/orders/:id/status` | Actualizar estado |
| POST | `/api/v1/pos/payments` | Procesar pago |
| POST | `/api/v1/pos/payments/split` | Dividir cuenta |

### Inventario
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/inventory/ingredients` | Listar ingredientes |
| POST | `/api/v1/inventory/ingredients` | Crear ingrediente |
| PUT | `/api/v1/inventory/ingredients/:id` | Actualizar ingrediente |
| GET | `/api/v1/inventory/recipes` | Listar recetas con costeo |
| POST | `/api/v1/inventory/recipes` | Crear receta |
| PUT | `/api/v1/inventory/recipes/:id` | Actualizar receta |
| GET | `/api/v1/inventory/recipes/by-item/:menuItemId` | Receta por item |
| GET | `/api/v1/inventory/stock/alerts` | Alertas de stock bajo |
| GET | `/api/v1/inventory/stock/movements` | Movimientos de stock |

### Analítica
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/analytics/sales` | Resumen de ventas (30 días) |
| GET | `/api/v1/analytics/bcg-matrix` | Matriz BCG del menú |
| GET | `/api/v1/analytics/performance` | Comparativa mensual |
| GET | `/api/v1/analytics/peak-hours` | Horas pico |
| GET | `/api/v1/analytics/multi-branch` | Reporte multi-sucursal |

### CRM
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/crm/customers` | Listar clientes |
| GET | `/api/v1/crm/customers/:id` | Detalle + historial órdenes |
| POST | `/api/v1/crm/customers` | Crear cliente |
| PUT | `/api/v1/crm/customers/:id` | Actualizar cliente |
| GET | `/api/v1/crm/segments` | Segmentación de clientes |
| GET | `/api/v1/crm/loyalty` | Programa de lealtad |
| POST | `/api/v1/crm/loyalty/redeem` | Canjear puntos |
| GET | `/api/v1/crm/rewards` | Historial de canjes |

### RRHH
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/hr/employees` | Listar empleados |
| POST | `/api/v1/hr/employees` | Crear empleado |
| GET | `/api/v1/hr/employees/:id` | Detalle empleado |
| GET | `/api/v1/hr/shifts` | Turnos |
| POST | `/api/v1/hr/shifts` | Asignar turno |

### Contabilidad
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/accounting/accounts` | Catálogo de cuentas |
| POST | `/api/v1/accounting/accounts` | Crear cuenta |
| POST | `/api/v1/accounting/accounts/import` | Importar cuentas batch |
| GET | `/api/v1/accounting/journal-entries` | Asientos contables |
| POST | `/api/v1/accounting/journal-entries` | Crear asiento |
| POST | `/api/v1/accounting/journal-entries/:id/post` | Publicar asiento |
| GET | `/api/v1/accounting/trial-balance` | Balance de comprobación |
| GET | `/api/v1/accounting/balance-sheet` | Balance general |
| GET | `/api/v1/accounting/income-statement` | Estado de resultados |
| GET | `/api/v1/accounting/general-ledger` | Libro mayor |
| GET | `/api/v1/accounting/periods` | Periodos contables |
| POST | `/api/v1/accounting/periods` | Crear periodo |
| POST | `/api/v1/accounting/periods/:id/close` | Cerrar periodo |
| GET | `/api/v1/accounting/odata/:entity` | Feed OData |

### Suscripciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/subscriptions/plans` | Listar planes disponibles |
| GET | `/api/v1/subscriptions/current` | Plan actual del tenant |
| PUT | `/api/v1/subscriptions/change-plan` | Cambiar de plan |
| GET | `/api/v1/subscriptions/invoices` | Historial de facturas |

### Super Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/super/companies` | Listar todas las empresas |
| GET | `/api/v1/super/companies/:id` | Detalle empresa |
| PUT | `/api/v1/super/companies/:id` | Editar empresa |
| PUT | `/api/v1/super/companies/:id/modules` | Gestionar módulos |
| PUT | `/api/v1/super/companies/:id/extra-users` | Vender cupos extra |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check del servidor |

---

## Despliegue

### Desarrollo Local
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### Producción
El pipeline CI/CD (GitHub Actions) ejecuta automáticamente:
```
lint → typecheck → test → build → docker build → push
```

### Variables de Entorno Requeridas
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Clave secreta para JWT |
| `JWT_EXPIRATION` | Tiempo expiración access token (ej. `15m`) |
| `JWT_REFRESH_EXPIRATION` | Tiempo expiración refresh token (ej. `7d`) |
| `REDIS_URL` | URL de Redis (opcional, caché in-memory fallback) |
| `NODE_ENV` | `development` / `production` / `test` |

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
| `GET /api/v2/analytics/bcg-matrix` | Clasifica platos en Estrella/Vaca/Interrogante/Perro |
| `GET /api/v2/analytics/sales-forecast` | Predicción de ventas (media móvil) |

---

## Mejoras Recientes

### Rendimiento y Optimización
- **Eliminación de N+1 queries**: `getTables` batch de órdenes activas con `DISTINCT ON`, `deductInventory` batch de recipes + stock movements
- **Agregaciones en SQL**: Sales summary, BCG matrix, performance, peak hours, trial balance, balance sheet e income statement ahora usan `GROUP BY` en PostgreSQL en vez de cargar todas las filas en memoria
- **Capa de caché**: Caché in-memory con TTL configurable para analytics y estados financieros
- **bcrypt optimizado**: Salt rounds reducido de 12 a 10 (~4x más rápido en login)
- **Importación batch**: `importAccounts` usa `createMany` en vez de N inserts individuales
- **Paginación en POS**: `getOrders` soporta `limit`, `offset` y filtro por `status`
- **Frontend**: React.lazy + Suspense en todas las rutas, reduzco bundle inicial ~70%
- **Vite**: Sourcemaps deshabilitados en producción, `esbuild` minify, chunks separados para socket.io-client y lucide-react
- **WebSocket**: Suscripciones singleton evitan duplicados de handlers

### Funcionalidades
- **Fix feature flags en navegación**: Corrección de nombres de flags en `dashboard.layout.tsx` para que los módulos se muestren correctamente
- **Super Admin Module**: Panel completo para gestión de empresas, planes, módulos y cupos extra
- **Cross-tenant validation**: Guard `authGuard` valida `x-tenant-id` contra JWT (excepto super_admin)
- **Rol contador (`accountant`)**: Nuevo rol con permisos contables, filtro en frontend HR
- **User limit enforcement**: Validación de límite de usuarios contra plan + cupos extra
- **Plan comparison table**: Tabla interactiva en Settings
- **OData feeds**: Endpoints OData para exportación contable

### Correcciones Técnicas
- **Fix seed `createAccountTree`**: Propagación recursiva de cuentas hijas corregida
- **Fix TypeScript `tsc -b`**: Configuración `tsconfig.node.json` corregida para TS 5.x
- **Fix `baseUrl` en tsconfig**: Eliminado por ser deprecated con `moduleResolution: bundler`
- **Dockerfiles**: Copias selectivas por directorio + entrypoint con auto-migración
- **Prisma Postgres**: 24 modelos desplegados en Prisma Postgres cloud
- **Zod validation**: Schemas en 7 módulos + middleware `validate()` en todas las rutas
- **ESLint flat config**: Configuración moderna con `typescript-eslint` y `eslint-plugin-react-hooks`
- **Tests config**: Vitest configurado para backend (node) y frontend (jsdom + React)

---

## Licencia

Proyecto privado — GastroCore SaaS Platform.
