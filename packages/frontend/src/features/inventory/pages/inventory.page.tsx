import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Package } from 'lucide-react'
import { api } from '../../../lib/api'

export function InventoryPage() {
  const { data: ingredients } = useQuery({
    queryKey: ['inventory', 'ingredients'],
    queryFn: () => api.get('/inventory/ingredients').then((r) => r.data.data),
  })

  const { data: alerts } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => api.get('/inventory/stock/alerts').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Inventario</h1>
      </div>

      {/* Stock alerts */}
      {alerts?.length > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error">Alertas de Stock Bajo</p>
            <p className="text-xs text-on-surface-muted mt-1">
              {alerts.length} ingrediente{alerts.length > 1 ? 's' : ''} por debajo del mínimo
            </p>
          </div>
        </div>
      )}

      {/* Ingredients table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ingredientes</h3>
          <Package className="w-4 h-4 text-on-surface-muted" />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Costo Uni.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ingredients?.map((ing: any) => {
                const isLow = Number(ing.currentStock) <= Number(ing.minimumStock)
                return (
                  <tr key={ing.id}>
                    <td className="font-medium">{ing.name}</td>
                    <td className="text-xs font-mono">{ing.sku}</td>
                    <td>{ing.category}</td>
                    <td className={isLow ? 'text-error font-semibold' : ''}>
                      {Number(ing.currentStock).toFixed(2)} {ing.unit}
                    </td>
                    <td className="text-on-surface-muted">{Number(ing.minimumStock).toFixed(2)} {ing.unit}</td>
                    <td>${Number(ing.unitCost).toFixed(2)}</td>
                    <td>
                      {isLow
                        ? <span className="badge-error">Stock Bajo</span>
                        : <span className="badge-success">OK</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
