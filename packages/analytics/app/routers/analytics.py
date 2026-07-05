from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str


class SalesSummary(BaseModel):
    total_revenue: float
    total_orders: int
    average_ticket: float
    peak_hours: list[dict]
    top_items: list[dict]


@router.get('/sales/{tenant_id}')
async def get_sales_summary(tenant_id: str):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                COALESCE(SUM(CAST(total AS numeric)), 0) as total_revenue,
                COUNT(*) as total_orders,
                COALESCE(AVG(CAST(total AS numeric)), 0) as average_ticket
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND "createdAt" >= NOW() - INTERVAL '30 days'
        """, (tenant_id,))
        row = dict(cur.fetchone())
        cur.close()
        conn.close()
        return {
            'success': True,
            'data': {
                'totalRevenue': float(row['total_revenue']),
                'totalOrders': row['total_orders'],
                'averageTicket': float(row['average_ticket']),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/trends/{tenant_id}')
async def get_trends(tenant_id: str, months: Optional[int] = 12):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                DATE_TRUNC('month', "createdAt") as month,
                COUNT(*) as orders,
                SUM(CAST(total AS numeric)) as revenue
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND "createdAt" >= NOW() - INTERVAL %s
            GROUP BY month
            ORDER BY month
        """, (tenant_id, f'{months} months'))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {
            'success': True,
            'data': [
                {
                    'month': r['month'].isoformat() if r['month'] else None,
                    'orders': r['orders'],
                    'revenue': float(r['revenue']) if r['revenue'] else 0,
                }
                for r in rows
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
