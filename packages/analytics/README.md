# Analytics

Este paquete aloja el microservicio de analítica basado en Python y FastAPI.

## Responsabilidades

- Generar métricas, forecasting y análisis de negocio.
- Exponer endpoints para integrarse con el backend y la UI.
- Procesar datos relevantes para dashboards y toma de decisiones.

## Estructura principal

- main.py: entrada del servicio.
- app/main.py: definición de la aplicación FastAPI.
- app/routers: endpoints del servicio.
- app/database.py: conexión y acceso a datos.

## Comandos útiles

- python -m venv .venv
- pip install -r requirements.txt
- uvicorn main:app --reload
