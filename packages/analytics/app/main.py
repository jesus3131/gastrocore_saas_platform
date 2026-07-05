import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analytics

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

API_PREFIX = os.getenv('ANALYTICS_API_PREFIX', '/api/v1/analytics')

app = FastAPI(
    title='RestoPro Analytics Engine',
    version='1.0.0',
    docs_url=f'{API_PREFIX}/docs',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('FRONTEND_URL', '*'),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(analytics.router, prefix=API_PREFIX)


@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'analytics-engine'}
