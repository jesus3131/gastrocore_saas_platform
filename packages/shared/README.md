# Shared

Este paquete contiene tipos, constantes y lógica compartida entre backend, frontend y otros módulos.

## Responsabilidades

- Definir contratos base del dominio.
- Centralizar constantes de permisos, planes, rutas y mensajes comunes.
- Evitar duplicación entre paquetes.

## Estructura principal

- src/index.ts: exportaciones públicas.
- src/types: interfaces y tipos reutilizables.
- src/constants: configuraciones compartidas.
