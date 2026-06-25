# Documento de Arquitectura y Estrategia: RestauranteSaaS Core

## 1. Arquitectura Técnica y de Datos

### Arquitectura Multi-tenant
Implementaremos un modelo de **Base de Datos por Tenant (Isolation)** para el nivel Enterprise y **Esquemas Compartidos con Tenant ID** para los niveles Básico/Pro. Esto garantiza seguridad de datos y escalabilidad.

### Stack Tecnológico
- **Frontend:** React.js con Tailwind CSS y Headless UI.
- **Servicios Core:** Node.js (NestJS) para microservicios de alta concurrencia (Pedidos, POS).
- **Analítica:** Python (FastAPI + Pandas/Scikit-learn) para el motor de inteligencia de negocios y matriz BCG.
- **Persistencia:** PostgreSQL gestionado vía Prisma ORM.
- **Infraestructura:** Docker para contenedorización, orquestado en Kubernetes (K8s) para alta disponibilidad.

### Modelo C4 (Nivel 1 & 2)
1. **Nivel 1 (Contexto):** El sistema interactúa con Usuarios (Dueños, Camareros, Cocina), Clientes Finales (Online Ordering) y Sistemas Externos (Pasarelas de Pago, Apps de Delivery).
2. **Nivel 2 (Contenedores):** 
   - Web App (React)
   - API Gateway (Nginx/Kong)
   - Microservicio de Pedidos (Node.js)
   - Microservicio de Inventario (Node.js)
   - Engine de Analítica (Python)
   - DB (PostgreSQL Cluster)

## 2. Adaptabilidad Multi-Nicho

### Feature Flags y Onboarding
Utilizaremos un sistema de **Configuración Basada en Perfiles**. 
- Al inicio, un wizard de onboarding categoriza el negocio (ej. "Fine Dining").
- Esto activa **Feature Flags** en el backend que condicionan la UI y los endpoints disponibles.
- **Custom Fields:** Implementaremos un campo tipo JSONB en las tablas principales de Prisma para permitir metadatos específicos por tenant sin migraciones de esquema.

## 3. Módulos Principales

| Módulo | Funcionalidad Clave | Lógica Técnica |
| :--- | :--- | :--- |
| **POS & Mesas** | Mapa interactivo, Split bill. | WebSockets para sincronización en tiempo real entre dispositivos. |
| **Inventario** | Escandallos, mermas, stock. | Middleware de Prisma para descontar ingredientes automáticamente al cerrar pedidos. |
| **RRHH** | Turnos, Comisiones. | Sistema de RBAC (Role Based Access Control) granular. |
| **Analítica** | Matriz BCG (Rentabilidad). | Jobs asíncronos en Python que procesan cierres de caja diarios. |
| **Omnicanal** | Integración Delivery. | Webhooks para recibir pedidos de UberEats/Rappi/Glovo. |

## 4. Estrategia de Suscripción (Pricing)

1. **Plan Starter ($49/mes):** 1 sucursal, POS básico, Inventario limitado. Ideal para Food Trucks/Cafeterías.
2. **Plan Pro ($129/mes):** Usuarios ilimitados, Escandallos avanzados, Analítica Python, 3 sucursales.
3. **Plan Enterprise (Cotización):** Multi-sucursal (Franquicias), Base de datos aislada, API abierta, Soporte 24/7.

## 5. Roadmap & MVP (4 Meses)

- **Mes 1-2:** Core API, Gestión de Mesas y POS Básico. Onboarding inicial.
- **Mes 3:** Inventario básico y Facturación electrónica.
- **Mes 4:** Lanzamiento MVP para nichos de Fast Food y Cafeterías.
- **Fase 2 (Mes 5+):** Motor de analítica predictiva, gestión de franquicias y fidelización avanzada.
