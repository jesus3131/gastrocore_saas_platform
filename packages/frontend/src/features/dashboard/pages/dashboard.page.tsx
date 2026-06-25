import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, ShoppingCart, TrendingDown } from 'lucide-react'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'

export function DashboardPage() {
  const { user } = useAuthStore()

  const { data: summary } = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => api.get('/analytics/sales').then((r) => r.data.data),
  })

  const { data: performance } = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: () => api.get('/analytics/performance').then((r) => r.data.data),
  })

  const stats = [
    {
      label: 'Ingresos del Mes',
      value: `$${(summary?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success bg-success/10',
    },
    {
      label: 'Ordenes',
      value: summary?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Ticket Promedio',
      value: `$${(summary?.averageTicket || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-info bg-info/10',
    },
    {
      label: 'Crecimiento',
      value: `${(performance?.growth?.revenue || 0).toFixed(1)}%`,
      icon: performance?.growth?.revenue > 0 ? TrendingUp : TrendingDown,
      color: performance?.growth?.revenue > 0 ? 'text-success bg-success/10' : 'text-error bg-error/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-muted">Bienvenido, {user?.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Peak hours */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Horas Pico</h3>
        </div>
        <div className="flex items-end gap-2 h-32">
          {summary?.peakHours?.map((ph: any) => {
            const maxOrders = Math.max(...(summary?.peakHours?.map((p: any) => p.orders) || [1]))
            const height = (ph.orders / maxOrders) * 100
            return (
              <div key={ph.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-on-surface-muted">{ph.orders}</span>
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
                <span className="text-2xs text-on-surface-muted">{`${ph.hour}:00`}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top items */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platos Más Vendidos</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plato</th>
                <th>Cantidad</th>
                <th>Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {summary?.topItems?.map((item: any) => (
                <tr key={item.itemId}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
