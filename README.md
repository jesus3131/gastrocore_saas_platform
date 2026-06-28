# GastroCore 🍽️

**Plataforma SaaS todo-en-uno para gestión integral de restaurantes.**

Multi-tenencia · Multi-sucursal · Multi-nicho (alta cocina, fast food, cafeterías, food trucks, bares, franquicias).

---

## 📋 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS 3 |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL (Prisma Postgres cloud) + Prisma ORM |
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
│   │   │   └── schema.prisma  # 24 modelos de datos
│   │   └── src/
│   │       ├── config/        # App, DB, Redis, Env, Logger
│   │       ├── common/        # Guards, filtros, interceptors, validate middleware
│   │       └── modules/       # 10 módulos funcionales con Zod validation
│   │
│   ├── frontend/
│   │   ├── src/               # SPA React + Vite + Tailwind
│   │   │   ├── features/      # 8 features (auth, pos, inventory, hr, crm, etc.)
│   │   │   ├── layouts/       # Dashboard, Auth layouts
│   │   │   ├── app/           # Store (Zustand), hooks
│   │   │   └── lib/           # API client (Axios)
│   │   │
│   │   └── prototypes/        # Prototipos HTML modulares por módulo
│   │       ├── shared/
│   │       │   └── design-tokens.js   # Config Tailwind central
│   │       ├── pos/
│   │       │   ├── vista/     # 4 HTML (solo estructura + clases)
│   │       │   ├── css/       # 4 CSS específicos por prototipo
│   │       │   ├── js/        # 4 JS (data arrays + renderizado DOM)
│   │       │   └── *.png      # Screenshots de referencia
│   │       ├── onboarding/    # 4 prototipos (misma estructura)
│   │       ├── analytics/     # 3 prototipos
│   │       ├── crm/           # 3 prototipos
│   │       ├── hr/            # 2 prototipos
│   │       ├── integrations/  # 2 prototipos
│   │       └── inventory/     # 1 prototipo
│   │
│   └── analytics/             # Microservicio Python (FastAPI)
│       ├── main.py            # BCG Matrix, forecasting
│       └── requirements.txt
│
├── prisma.config.ts           # Config Prisma con dotenv
├── infrastructure/
│   └── docker/                # Docker Compose + Nginx + Dockerfiles multi-stage
│
├── eslint.config.js           # ESLint flat config (root)
├── turbo.json                 # Turborepo v2 pipeline
├── pnpm-workspace.yaml
└── package.json
```

---

## 🗄️ Modelo de Datos (24 modelos)

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
- Docker Desktop (para Redis local)
- Python 3.12+ (para analytics)

### 1. Clonar e instalar
```bash
git clone https://github.com/jesus3131/gastrocore_saas_platform.git
cd gastrocore_saas_platform
pnpm install
```

### 2. Configurar base de datos (Prisma Postgres cloud)
```bash
# El archivo .env ya contiene DATABASE_URL de Prisma Postgres
# Si usas PostgreSQL local, edita .env:
# DATABASE_URL="postgresql://user:pass@localhost:5432/gastrocore?schema=public"
```

### 3. Generar Prisma Client y sincronizar schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Iniciar desarrollo
```bash
pnpm dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/health

### Prototipos HTML (vista previa directa)
Los prototipos se abren directamente en el navegador (sin build):
```
packages/frontend/prototypes/pos/vista/pos-order-taking.html
```

---

## 👥 Usuarios de Prueba (Seed Data)

### Admin
| Email | Contraseña | Rol |
|-------|-----------|:---:|
| `admin@lacocina.com` | `admin123` | admin |

### Empleados PIN (Waiter Service)
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

### Clientes (CRM)
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

## 🧪 Scripts Disponibles

```bash
pnpm dev          # Frontend + backend en modo desarrollo
pnpm build        # Build de producción
pnpm lint         # ESLint en todos los paquetes
pnpm typecheck    # TypeScript type checking
pnpm test         # Tests (Vitest)

# Base de datos
npx prisma generate   # Generar Prisma Client
npx prisma db push    # Push schema a DB
npx prisma db seed    # Sembrar datos de prueba
npx prisma studio     # Abrir Prisma Studio UI

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

Ver todos en `packages/backend/src/config/routes.ts`

---

## 🐳 Despliegue

### Desarrollo Local
```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### Producción
El CI/CD (GitHub Actions) ejecuta: `lint → typecheck → test → build → docker build`

---

## 🧠 Servicio de Analítica (Python)

```bash
cd packages/analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- **BCG Matrix** — clasifica platos en Estrella/Vaca/Interrogante/Perro
- **Sales Forecasting** — predicción de ventas (media móvil)

---

## 🛠️ Mejoras Recientes

- **Fix seed `createAccountTree`**: La función recursiva no propagaba los resultados de cuentas hijas al arreglo principal, causando error `"Cannot read properties of undefined (reading 'id')"` al referenciar cuentas leaf por código contable (ej. `accMap['1101']`). Solución: propagar `results.push(...await createAccountTree(...))` para incluir todas las cuentas (padres + hijos).
- **Fix TypeScript `tsc -b`**: `tsconfig.node.json` tenía `noEmit: false` con `allowImportingTsExtensions`, incompatible en TS 5.x. Cambiado a `emitDeclarationOnly: true`.
- **Fix `baseUrl` en tsconfig**: Eliminado `baseUrl: "."` de `tsconfig.json` por ser deprecated con `moduleResolution: "bundler"`.
- **Dockerfiles corregidos**: Reemplazado `COPY . .` por copias selectivas por directorio para evitar sobrescribir symlinks de pnpm. Agregado `entrypoint.sh` con auto-migración y seed condicionales.
- **Prototipos HTML refactorizados**: 19 prototipos migrados a estructura modular (`vista/`, `css/`, `js/` por módulo). Sin datos estáticos ni CSS/JS inline. Config Tailwind compartida via `design-tokens.js`.
- **Prisma Postgres**: Base de datos cloud linkeda via `prisma bootstrap`. Schema con 24 modelos pushado y generado.
- **Zod validation**: Schemas de validación en 7 módulos + middleware `validate()` en todas las rutas.
- **ESLint flat config**: Configuración moderna con `typescript-eslint` y `eslint-plugin-react-hooks`.
- **Tests config**: Vitest configurado para backend (node) y frontend (jsdom + React).

---

## 📄 Licencia

Proyecto privado — GastroCore SaaS Platform.
