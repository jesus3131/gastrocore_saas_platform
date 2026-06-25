# GastroCore 🍽️

**Plataforma SaaS todo-en-uno para gestión integral de restaurantes.**

Multi-tenencia · Multi-sucursal · Multi-nicho (alta cocina, fast food, cafeterías, food trucks, bares, franquicias).

---

## 📋 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS 3 |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache** | Redis |
| **Analítica** | Python + FastAPI (Pandas, scikit-learn) |
| **Infra** | Docker · Docker Compose · GitHub Actions |
| **Monorepo** | pnpm workspaces + Turborepo |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Clientes                          │
│   (Web App, POS Tablet, KDS Cocina, Delivery Apps) │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              API Gateway (Nginx/Express)            │
│         Rate Limiting · Auth · Tenant Routing       │
└────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┘
     │      │      │      │      │      │      │
┌────▼──┐ ┌▼─────┐ ┌▼────┐ ┌▼───┐ ┌▼────┐ ┌▼───┐ ┌▼──────┐
│ Auth  │ │ POS  │ │Inv. │ │ HR │ │CRM  │ │Ana.│ │Integ. │
│Service│ │Svc.  │ │Svc. │ │Svc.│ │Svc. │ │Svc.│ │Svc.   │
└───┬───┘ └──┬───┘ └──┬──┘ └──┬─┘ └──┬──┘ └──┬─┘ └───┬───┘
    │        │        │       │      │       │       │
┌───▼────────▼────────▼───────▼──────▼───────▼───────▼────┐
│                    PostgreSQL + Redis                    │
│            (Multi-tenant via tenantId column)            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura del Proyecto

```
gastrocore_saas_platform/
│
├── packages/
│   ├── shared/                # Tipos, constantes, y lógica compartida
│   │   └── src/
│   │       ├── types/         # Interfaces del dominio (Order, Customer, etc.)
│   │       └── constants/     # Planes, permisos, rutas API
│   │
│   ├── backend/               # API REST (Node.js + Express + Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # 30 modelos de datos
│   │   │   └── seed.ts        # Datos de prueba
│   │   └── src/
│   │       ├── config/        # App, DB, Redis, Env, Logger
│   │       ├── common/        # Guards, filtros, interceptors
│   │       └── modules/       # 10 módulos funcionales
│   │           ├── auth/          # JWT, registro, login
│   │           ├── tenants/       # Config multi-tenant, feature flags
│   │           ├── pos/           # Órdenes, menú, mesas, pagos
│   │           ├── inventory/     # Ingredientes, recetas, stock
│   │           ├── hr/            # Empleados, turnos, comisiones
│   │           ├── analytics/     # Ventas, BCG Matrix, rendimiento
│   │           ├── crm/           # Clientes, segmentos, lealtad
│   │           ├── onboarding/    # Wizard 4 pasos
│   │           └── subscriptions/ # Planes, facturas
│   │
│   ├── frontend/              # SPA (React + Vite + Tailwind)
│   │   └── src/
│   │       ├── app/           # Store (Zustand), hooks, routing
│   │       ├── lib/           # API client (Axios + interceptors)
│   │       ├── layouts/       # Dashboard, Auth layouts
│   │       ├── shared/        # Componentes UI reutilizables
│   │       └── features/      # 8 features con páginas
│   │           ├── auth/      # Login, Register
│   │           ├── dashboard/ # Stats, gráficas
│   │           ├── pos/       # Órdenes, mapa de mesas
│   │           ├── inventory/ # Stock, escandallos
│   │           ├── hr/        # Personal, turnos
│   │           ├── analytics/ # BCG Matrix, horas pico
│   │           ├── crm/       # Clientes, loyalty
│   │           ├── onboarding/# Wizard 4 pasos
│   │           └── settings/  # Config del tenant
│   │
│   └── analytics/             # Microservicio Python (FastAPI)
│       ├── main.py            # BCG Matrix, forecasting
│       └── requirements.txt
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   ├── Dockerfile.backend (multi-stage)
│   │   ├── Dockerfile.frontend (dev + nginx)
│   │   ├── Dockerfile.analytics
│   │   └── nginx.conf
│   └── k8s/                   # (preparado para Kubernetes)
│
├── .github/workflows/ci.yml   # CI/CD: lint → typecheck → test → build → docker
├── turbo.json                  # Turborepo pipeline
├── pnpm-workspace.yaml
└── package.json                # Scripts del monorepo
```

---

## 🗄️ Modelo de Datos (30 modelos)

### Multi-tenencia
- **Tenant** — núcleo del negocio con configuración por tenant
- **User** — usuarios con roles (`admin`, `manager`, `chef`, `waiter`, etc.)
- **TenantFeatureFlag** — feature flags por tenant

### POS & Menú
- **MenuCategory**, **MenuItem** — catálogo de productos
- **ModifierGroup**, **ModifierOption** — modificadores (ej. términos de cocción)
- **Order**, **OrderItem**, **OrderItemModifier** — órdenes y items
- **Payment** — pagos y splits

### Operaciones
- **Branch**, **ServiceArea**, **Table** — multi-sucursal con mapa de mesas
- **Ingredient**, **Recipe**, **RecipeIngredient** — inventario y escandallos
- **StockMovement** — trazabilidad de movimientos de stock

### RRHH
- **Employee**, **Shift**, **Commission** — gestión de personal

### CRM
- **Customer** — historial, segmentación, puntos de lealtad
- **LoyaltyProgram**, **LoyaltyRedemption** — programa de fidelización

### Subscripciones
- **Subscription**, **SubscriptionInvoice** — planes y facturación

### Integraciones
- **Integration** — credenciales para delivery (Rappi, Uber Eats, Didi)

### Auditoría
- **AuditLog** — registro de acciones sensibles

---

## 🔐 Feature Flags & Onboarding Automático

El sistema se auto-configura según el tipo de negocio:

| Tipo | Features Activadas |
|------|-------------------|
| **Alta Cocina** | Mesas, splits, KDS, CRM, loyalty, BCG, inventario, RRHH |
| **Fast Food** | KDS, online ordering, delivery, inventario |
| **Cafetería** | KDS, online, loyalty, inventario |
| **Food Truck** | KDS, online, delivery |
| **Bar** | Mesas, splits, KDS, loyalty, RRHH |
| **Franquicia** | Multi-sucursal, todo incluido |

Flujo de onboarding:
1. Registro → selección de tipo de negocio
2. Configuración de áreas y mesas
3. Activación de módulos deseados
4. Lanzamiento → sistema listo para operar

---

## 💰 Planes de Suscripción

| Característica | Básico ($49/mes) | Pro ($129/mes) | Enterprise ($349/mes) |
|---------------|:----------------:|:--------------:|:--------------------:|
| Usuarios | 3 | 15 | ∞ |
| Sucursales | 1 | 3 | ∞ |
| Transacciones/mes | 1,000 | 10,000 | ∞ |
| Almacenamiento | 5 GB | 50 GB | 500 GB |
| **POS + Mesas** | ✅ | ✅ | ✅ |
| **KDS (Cocina)** | ✅ | ✅ | ✅ |
| **Split de cuentas** | ✅ | ✅ | ✅ |
| **Inventario** | — | ✅ | ✅ |
| **RRHH** | — | ✅ | ✅ |
| **CRM** | — | ✅ | ✅ |
| **Facturación electrónica** | — | ✅ | ✅ |
| **Integración delivery** | — | ✅ | ✅ |
| **BCG Matrix** | — | — | ✅ |
| **Loyalty Program** | — | — | ✅ |
| **Multi-sucursal** | — | — | ✅ |

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 20
- pnpm >= 9
- Docker Desktop (para PostgreSQL y Redis)
- Python 3.12+ (para analytics)

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Iniciar infraestructura
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up postgres redis -d
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env si es necesario
```

### 4. Generar Prisma Client y sembrar DB
```bash
pnpm db:generate
pnpm db:seed
```
> Credenciales seed: `admin@lacocina.com` / `admin123`

### 5. Iniciar desarrollo
```bash
pnpm dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/health
- DB Admin: http://localhost:8080

---

## 🧪 Scripts Disponibles

```bash
pnpm dev          # Inicia frontend + backend en modo desarrollo
pnpm build        # Build de producción
pnpm lint         # ESLint en todos los paquetes
pnpm typecheck    # TypeScript type checking
pnpm test         # Tests (Vitest)
pnpm format       # Prettier

# Base de datos
pnpm db:generate  # Generar Prisma Client
pnpm db:migrate   # Ejecutar migraciones
pnpm db:push      # Push schema a DB
pnpm db:seed      # Sembrar datos de prueba
pnpm db:studio    # Abrir Prisma Studio

# Docker
pnpm docker:dev   # Entorno completo via Docker Compose
```

---

## 🔄 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/register` | Registrar nuevo tenant |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| GET | `/api/v1/auth/me` | Perfil del usuario |

### POS
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/pos/menu` | Menú completo |
| GET | `/api/v1/pos/tables` | Mapa de mesas |
| POST | `/api/v1/pos/orders` | Crear orden |
| PUT | `/api/v1/pos/orders/:id/status` | Actualizar estado |
| POST | `/api/v1/pos/payments` | Procesar pago |
| POST | `/api/v1/pos/payments/split` | Dividir cuenta |

### Inventario
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/inventory/ingredients` | Listar ingredientes |
| POST | `/api/v1/inventory/ingredients` | Crear ingrediente |
| GET | `/api/v1/inventory/recipes` | Listar recetas |
| POST | `/api/v1/inventory/recipes` | Crear receta con costeo |
| GET | `/api/v1/inventory/stock/alerts` | Alertas de stock bajo |

### Analítica
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/analytics/sales` | Resumen de ventas |
| GET | `/api/v1/analytics/bcg-matrix` | Matriz BCG del menú |
| GET | `/api/v1/analytics/performance` | Comparativa mensual |
| GET | `/api/v1/analytics/peak-hours` | Horas pico |

Y muchos más — ver `packages/backend/src/config/routes.ts`

---

## 🐳 Despliegue

### Desarrollo Local
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### Producción
El CI/CD (GitHub Actions) ejecuta: `lint → typecheck → test → build → docker build`

Para despliegue cloud:
```bash
# Construir imágenes
docker compose -f infrastructure/docker/docker-compose.prod.yml build

# Push a registry
docker tag gastrocore-api:latest registry.example.com/gastrocore-api:latest
docker push registry.example.com/gastrocore-api:latest
```

---

## 🧠 Servicio de Analítica (Python)

El microservicio Python (`packages/analytics/`) maneja procesamiento pesado:

- **BCG Matrix** — clasifica platos en Estrella/Vaca/Interrogante/Perro
- **Sales Forecasting** — predicción de ventas (media móvil, preparado para Prophet/LSTM)
- Escalable horizontalmente, independiente del API principal

```bash
cd packages/analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📈 Roadmap

### MVP (3-5 meses)
- [x] Autenticación y multi-tenencia
- [x] POS básico (tomar órdenes, pagos)
- [x] Mapa de mesas interactivo
- [x] Menú y categorías
- [x] Feature flags y onboarding
- [ ] Dashboard básico con ventas

### Fase 2 (6-8 meses)
- [ ] Inventario y escandallos completo
- [ ] KDS (Kitchen Display System)
- [ ] Integración con pasarelas de pago
- [ ] Reportes básicos

### Fase 3 (9-12 meses)
- [ ] RRHH: turnos, comisiones, roles
- [ ] CRM: segmentación, loyalty program
- [ ] Integración delivery (Rappi, Uber Eats)
- [ ] BCG Matrix y analítica avanzada
- [ ] Multi-sucursal

---

## 📄 Licencia

Proyecto privado — GastroCore SaaS Platform.

---

> **Nota:** Los HTML originales del prototipo UI se mantienen en sus directorios como referencia de diseño visual para el desarrollo frontend.
