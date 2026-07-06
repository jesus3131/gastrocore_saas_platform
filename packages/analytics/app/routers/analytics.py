from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import get_connection

router = APIRouter()


async def get_tenant_id(x_tenant_id: str = Header(...)):
    return x_tenant_id


@router.get('/sales')
async def get_sales_summary(tenant_id: str = Depends(get_tenant_id)):
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

        cur.execute("""
            SELECT
                oi."menuItemId" as item_id,
                oi.name,
                SUM(oi.quantity) as quantity,
                SUM(CAST(oi."totalPrice" AS numeric)) as revenue
            FROM "order_items" oi
            JOIN "orders" o ON oi."orderId" = o.id
            WHERE o."tenantId" = %s AND o.status = 'paid'
              AND o."createdAt" >= NOW() - INTERVAL '30 days'
            GROUP BY oi."menuItemId", oi.name
            ORDER BY revenue DESC
            LIMIT 10
        """, (tenant_id,))
        top_items = [dict(r) for r in cur.fetchall()]

        cur.execute("""
            SELECT
                EXTRACT(HOUR FROM "createdAt") as hour,
                COUNT(*) as orders
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND "createdAt" >= NOW() - INTERVAL '30 days'
            GROUP BY hour
            ORDER BY hour
        """, (tenant_id,))
        peak_hours = [dict(r) for r in cur.fetchall()]

        cur.close()
        conn.close()

        return {
            'success': True,
            'data': {
                'totalRevenue': float(row['total_revenue']),
                'totalOrders': row['total_orders'],
                'averageTicket': float(row['average_ticket']),
                'topItems': [
                    {
                        'itemId': r['item_id'],
                        'name': r['name'],
                        'quantity': r['quantity'],
                        'revenue': float(r['revenue']),
                    }
                    for r in top_items
                ],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/performance')
async def get_performance(tenant_id: str = Depends(get_tenant_id)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                COALESCE(SUM(CAST(total AS numeric)), 0) as revenue,
                COUNT(*) as orders
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW())
        """, (tenant_id,))
        current = dict(cur.fetchone())

        cur.execute("""
            SELECT
                COALESCE(SUM(CAST(total AS numeric)), 0) as revenue,
                COUNT(*) as orders
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
        """, (tenant_id,))
        previous = dict(cur.fetchone())

        cur.close()
        conn.close()

        curr_rev = float(current['revenue'])
        prev_rev = float(previous['revenue'])
        curr_ord = current['orders']
        prev_ord = previous['orders']

        rev_growth = ((curr_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
        ord_growth = ((curr_ord - prev_ord) / prev_ord * 100) if prev_ord > 0 else 0

        return {
            'success': True,
            'data': {
                'currentMonth': {'revenue': curr_rev, 'orders': curr_ord},
                'previousMonth': {'revenue': prev_rev},
                'growth': {'revenue': round(rev_growth, 1), 'orders': round(ord_growth, 1)},
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/bcg-matrix')
async def get_bcg_matrix(tenant_id: str = Depends(get_tenant_id)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            WITH item_stats AS (
                SELECT
                    oi."menuItemId" as item_id,
                    oi.name,
                    SUM(CAST(oi."totalPrice" AS numeric)) as revenue,
                    SUM(oi.quantity) as total_quantity,
                    AVG(CAST(oi."unitPrice" AS numeric)) as avg_price,
                    COUNT(DISTINCT o.id) as order_count
                FROM "order_items" oi
                JOIN "orders" o ON oi."orderId" = o.id
                WHERE o."tenantId" = %s AND o.status = 'paid'
                  AND o."createdAt" >= NOW() - INTERVAL '90 days'
                GROUP BY oi."menuItemId", oi.name
            ),
            totals AS (
                SELECT SUM(revenue) as total_rev FROM item_stats
            )
            SELECT
                s.item_id,
                s.name,
                s.revenue,
                s.total_quantity,
                CASE WHEN t.total_rev > 0 THEN (s.revenue / t.total_rev * 100) ELSE 0 END as revenue_share,
                CASE WHEN s.revenue > 0 THEN ((s.revenue - s.total_quantity * s.avg_price * 0.3) / s.revenue * 100) ELSE 0 END as profit_margin
            FROM item_stats s, totals t
            ORDER BY s.revenue DESC
        """, (tenant_id,))
        rows = [dict(r) for r in cur.fetchall()]

        cur.close()
        conn.close()

        if not rows:
            return {'success': True, 'data': []}

        avg_share = sum(r['revenue_share'] for r in rows) / len(rows)
        margins = [r['profit_margin'] for r in rows]
        avg_margin = sum(margins) / len(margins) if margins else 0

        result = []
        for r in rows:
            if r['revenue_share'] >= avg_share and r['profit_margin'] >= avg_margin:
                quadrant = 'star'
            elif r['revenue_share'] >= avg_share and r['profit_margin'] < avg_margin:
                quadrant = 'cash_cow'
            elif r['revenue_share'] < avg_share and r['profit_margin'] < avg_margin:
                quadrant = 'dog'
            else:
                quadrant = 'question_mark'

            result.append({
                'itemId': r['item_id'],
                'name': r['name'],
                'quadrant': quadrant,
                'revenueShare': round(float(r['revenue_share']), 1),
                'profitMargin': round(float(r['profit_margin']), 1),
                'growthRate': 0,
                'category': 'General',
                'revenue': float(r['revenue']),
            })

        return {'success': True, 'data': result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/peak-hours')
async def get_peak_hours(tenant_id: str = Depends(get_tenant_id)):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                EXTRACT(HOUR FROM "createdAt") as hour,
                COUNT(*) as orders
            FROM "orders"
            WHERE "tenantId" = %s AND status = 'paid'
              AND "createdAt" >= NOW() - INTERVAL '30 days'
            GROUP BY hour
            ORDER BY hour
        """, (tenant_id,))
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {
            'success': True,
            'data': [{'hour': int(r['hour']), 'orders': r['orders']} for r in rows],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/multi-branch')
async def get_multi_branch(tenant_id: str = Depends(get_tenant_id)):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                b.name as branch_name,
                COALESCE(SUM(CAST(o.total AS numeric)), 0) as revenue,
                COUNT(o.id) as orders_count
            FROM "branches" b
            LEFT JOIN "orders" o ON o."branchId" = b.id AND o.status = 'paid'
                AND o."createdAt" >= NOW() - INTERVAL '30 days'
            WHERE b."tenantId" = %s
            GROUP BY b.id, b.name
            ORDER BY revenue DESC
        """, (tenant_id,))
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {
            'success': True,
            'data': [
                {
                    'branchName': r['branch_name'],
                    'revenue': float(r['revenue']),
                    'ordersCount': r['orders_count'],
                }
                for r in rows
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
