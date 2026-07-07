# Backend

Este paquete contiene la API principal del sistema y la lógica de negocio asociada.

## Responsabilidades

- Exponer endpoints REST y WebSocket.
- Gestionar autenticación, multi-tenencia, permisos y módulos de negocio.
- Persistir datos con Prisma y PostgreSQL.
- Coordinar eventos, cache y observabilidad.

## Estructura principal

- src/main.ts: entrada de la aplicación.
- src/config: configuración de app, env, routes, DB y Redis.
- src/common: guards, filtros, interceptores y utilidades compartidas.
- src/core: dominio, puertos y casos de uso.
- src/infrastructure: inyección de dependencias, eventos y persistencia.
- src/modules: módulos funcionales como auth, pos, inventory, hr y crm.
- prisma: esquema de base de datos y migraciones.

## Comandos útiles

- pnpm --filter @gastrocore/backend dev
- pnpm --filter @gastrocore/backend build
- pnpm --filter @gastrocore/backend test
