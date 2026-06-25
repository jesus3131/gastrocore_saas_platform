"""
GastroCore Analytics Engine
Python/FastAPI microservice for heavy analytics processing.
Handles BCG matrix computation, sales forecasting, and ML models.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import numpy as np
from datetime import datetime

app = FastAPI(title="GastroCore Analytics", version="1.0.0")


class MenuItemAnalysis(BaseModel):
    item_id: str
    name: str
    revenue: float
    quantity: int
    cost: float
    date_range_days: int


class BcgRequest(BaseModel):
    menu_items: list[MenuItemAnalysis]
    total_revenue: float


class BcgResult(BaseModel):
    item_id: str
    name: str
    quadrant: str  # star, cash_cow, question_mark, dog
    revenue_share: float
    profit_margin: float
    growth_rate: float


@app.get("/health")
async def health():
    return {"status": "ok", "service": "analytics", "timestamp": datetime.now().isoformat()}


@app.post("/analytics/bcg-matrix", response_model=list[BcgResult])
async def compute_bcg_matrix(request: BcgRequest):
    """Compute BCG Matrix classification for menu items."""
    results = []

    for item in request.menu_items:
        revenue_share = (item.revenue / request.total_revenue * 100) if request.total_revenue > 0 else 0
        profit_margin = ((item.revenue - item.cost * item.quantity) / item.revenue * 100) if item.revenue > 0 else 0
        growth_rate = item.quantity / max(item.date_range_days, 1)

        # BCG classification
        if revenue_share > 5:
            quadrant = "star" if profit_margin > 50 else "cash_cow"
        else:
            quadrant = "question_mark" if profit_margin > 50 else "dog"

        results.append(BcgResult(
            item_id=item.item_id,
            name=item.name,
            quadrant=quadrant,
            revenue_share=round(revenue_share, 2),
            profit_margin=round(profit_margin, 2),
            growth_rate=round(growth_rate, 4),
        ))

    return results


@app.post("/analytics/forecast")
async def sales_forecast(history: list[float], periods: int = 7):
    """
    Simple moving average forecast.
    In production, replace with Prophet or LSTM model.
    """
    if len(history) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 data points")

    window = min(len(history), 7)
    ma = np.convolve(history, np.ones(window)/window, mode='valid')
    last_avg = ma[-1] if len(ma) > 0 else np.mean(history)

    # Add trend component
    trend = 0
    if len(ma) > 1:
        trend = (ma[-1] - ma[-2]) / ma[-2] if ma[-2] != 0 else 0

    forecast = [last_avg * (1 + trend) ** i for i in range(1, periods + 1)]
    return {
        "forecast": [round(f, 2) for f in forecast],
        "trend": round(trend * 100, 2),
        "confidence": round(0.85 - abs(trend) * 0.1, 2),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
