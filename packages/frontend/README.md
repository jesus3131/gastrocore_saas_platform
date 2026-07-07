# Frontend

Este paquete contiene la interfaz web de GastroCore.

## Responsabilidades

- Presentar la experiencia de usuario para administración, POS y reportes.
- Conectar la UI con los servicios del backend.
- Gestionar estados locales, rutas, formularios y experiencias en tiempo real.

## Estructura principal

- src/App.tsx: router principal y composición general.
- src/features: módulos de negocio por funcionalidad.
- src/layouts: layouts reutilizables de la app.
- src/app: store global, hooks y utilidades transversales.
- src/shared: componentes UI compartidos.
- src/lib: clientes de API y helpers.
- prototypes: prototipos HTML/CSS/JS para diseño y exploración.

## Comandos útiles

- pnpm --filter @gastrocore/frontend dev
- pnpm --filter @gastrocore/frontend build
- pnpm --filter @gastrocore/frontend test
