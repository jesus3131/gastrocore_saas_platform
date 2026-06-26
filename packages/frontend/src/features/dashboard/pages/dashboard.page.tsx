import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, ShoppingCart, TrendingDown, UtensilsCrossed, Clock } from 'lucide-react'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'
import { MetricCard } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { EmptyState, ErrorState } from '../../../shared/components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const BCG_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']

export function DashboardPage() {
  const { user } = useAuthStore()

  const { data: summary, isLoading: loadingSummary, error: errorSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => api.get('/analytics/sales').then((r) => r.data.data),
  })

  const { data: performance, isLoading: loadingPerf, error: errorPerf, refetch: refetchPerf } = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: () => api.get('/analytics/performance').then((r) => r.data.data),
  })

  const { data: bcg } = useQuery({
    queryKey: ['analytics', 'bcg'],
    queryFn: () => api.get('/analytics/bcg-matrix').then((r) => r.data.data),
  })

  const { data: peakHours } = useQuery({
    queryKey: ['analytics', 'peak-hours'],
    queryFn: () => api.get('/analytics/peak-hours').then((r) => r.data.data),
  })

  if (loadingSummary || loadingPerf) return <LoadingSkeleton rows={6} />
  if (errorSummary || errorPerf) {
    return <ErrorState message="Error al cargar datos del dashboard" onRetry={() => { refetchSummary(); refetchPerf() }} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-muted">Bienvenido, {user?.name}</p>
        </div>
        <button onClick={() => { refetchSummary(); refetchPerf() }} className="btn-secondary btn-sm text-xs">
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos del Mes"
          value={`$${(summary?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-success bg-success/10"
          trend={performance?.growth?.revenue ? { value: performance.growth.revenue, label: 'vs mes anterior' } : undefined}
        />
        <MetricCard
          label="Órdenes"
          value={summary?.totalOrders || 0}
          icon={ShoppingCart}
          color="text-primary bg-primary/10"
          trend={performance?.growth?.orders ? { value: performance.growth.orders } : undefined}
        />
        <MetricCard
          label="Ticket Promedio"
          value={`$${(summary?.averageTicket || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="text-info bg-info/10"
        />
        <MetricCard
          label="Platos Vendidos"
          value={summary?.totalItems || 0}
          icon={UtensilsCrossed}
          color="text-warning bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Horas Pico</h3>
            <Clock className="w-4 h-4 text-on-surface-muted" />
          </div>
          {peakHours?.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sin datos de horas pico" message="No hay órdenes registradas para mostrar" />
          )}
        </div>

        {bcg && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Matriz BCG</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Estrella', value: bcg.filter((i: any) => i.quadrant === 'star').length, color: '#10B981' },
                      { name: 'Vaca', value: bcg.filter((i: any) => i.quadrant === 'cash_cow').length, color: '#3B82F6' },
                      { name: 'Interrogante', value: bcg.filter((i: any) => i.quadrant === 'question_mark').length, color: '#F59E0B' },
                      { name: 'Perro', value: bcg.filter((i: any) => i.quadrant === 'dog').length, color: '#EF4444' },
                    ]}
                    cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {BCG_COLORS.map((color) => <Cell key={color} fill={color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platos Más Vendidos</h3>
          <TrendingUp className="w-4 h-4 text-on-surface-muted" />
        </div>
        {summary?.topItems?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Plato</th>
                  <th>Cantidad</th>
                  <th>Ingreso</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.topItems.map((item: any, i: number) => (
                  <tr key={item.itemId}>
                    <td className="text-on-surface-muted w-8">{i + 1}</td>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.quantity}</td>
                    <td className="font-semibold text-success">${Number(item.revenue).toFixed(2)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (item.revenue / (summary?.totalRevenue || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-on-surface-muted">{((item.revenue / (summary?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin platos vendidos" message="Aún no hay ventas registradas" />
        )}
      </div>
    </div>
  )
}
