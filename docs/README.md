# Documentación del monorepo

Esta carpeta centraliza la organización del repositorio para que cada parte del sistema sea fácil de localizar y mantener.

## Mapa rápido

- [packages/backend](../packages/backend/README.md): API REST, lógica de negocio, Prisma y módulos del servidor.
- [packages/frontend](../packages/frontend/README.md): aplicación web React + Vite.
- [packages/shared](../packages/shared/README.md): tipos, constantes y utilidades compartidas entre paquetes.
- [packages/analytics](../packages/analytics/README.md): servicio Python para analítica y forecasting.
- [infrastructure](../infrastructure/README.md): Docker, Compose, Kubernetes y recursos operativos.

## Flujo de trabajo recomendado

1. Instala dependencias con pnpm.
2. Levanta el stack de desarrollo con Docker Compose o los servicios locales.
3. Trabaja por paquete: backend, frontend, shared o analytics según el alcance del cambio.
4. Mantén la documentación actualizada cuando agregues módulos, endpoints o flujos nuevos.

## Rutas clave

- Raíz del monorepo: configuración global, workspace y scripts comunes.
- packages/backend/src: módulos funcionales y capa de infraestructura.
- packages/frontend/src: features, layouts, hooks y componentes reutilizables.
- packages/shared/src: contratos y lógica compartida.
- infrastructure: entorno de ejecución y despliegue.
