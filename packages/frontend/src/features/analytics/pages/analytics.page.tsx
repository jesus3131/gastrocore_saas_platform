import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { MetricCard, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { EmptyState } from '../../../shared/components/ui/empty-state'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

const BCG_COLORS: Record<string, string> = {
  star: '#10B981',
  cash_cow: '#3B82F6',
  question_mark: '#F59E0B',
  dog: '#EF4444',
}

const BCG_LABELS: Record<string, string> = {
  star: 'Estrella',
  cash_cow: 'Vaca',
  question_mark: 'Interrogante',
  dog: 'Perro',
}

export function AnalyticsPage() {
  const { data: summary, isLoading: loadingSummary, error: errorSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => api.get('/analytics/sales').then((r) => r.data.data),
  })

  const { data: bcg, isLoading: loadingBcg, error: errorBcg, refetch: refetchBcg } = useQuery({
    queryKey: ['analytics', 'bcg'],
    queryFn: () => api.get('/analytics/bcg-matrix').then((r) => r.data.data),
  })

  const { data: performance, isLoading: loadingPerf, error: errorPerf, refetch: refetchPerf } = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: () => api.get('/analytics/performance').then((r) => r.data.data),
  })

  const { data: peakHours } = useQuery({
    queryKey: ['analytics', 'peak-hours'],
    queryFn: () => api.get('/analytics/peak-hours').then((r) => r.data.data),
  })

  const { data: multiBranch } = useQuery({
    queryKey: ['analytics', 'multi-branch'],
    queryFn: () => api.get('/analytics/multi-branch').then((r) => r.data.data),
  })

  if (loadingSummary || loadingBcg || loadingPerf) return <LoadingSkeleton rows={8} />
  if (errorSummary || errorBcg || errorPerf) {
    return <ErrorState message="Error al cargar datos de analítica" onRetry={() => { refetchSummary(); refetchBcg(); refetchPerf() }} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Analítica & Rendimiento</h1>
        <button onClick={() => { refetchSummary(); refetchBcg(); refetchPerf() }} className="btn-secondary btn-sm text-xs">
          <RefreshCw className="w-3 h-3" /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos Este Mes"
          value={`$${Number(performance?.currentMonth?.revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-success bg-success/10"
          trend={performance?.growth?.revenue ? { value: performance.growth.revenue, label: 'vs anterior' } : undefined}
        />
        <MetricCard
          label="Ingresos Mes Anterior"
          value={`$${Number(performance?.previousMonth?.revenue || 0).toLocaleString()}`}
          icon={TrendingDown}
          color="text-info bg-info/10"
        />
        <MetricCard
          label="Órdenes Este Mes"
          value={performance?.currentMonth?.orders || 0}
          icon={ShoppingCart}
          color="text-primary bg-primary/10"
          trend={performance?.growth?.orders ? { value: performance.growth.orders } : undefined}
        />
        <MetricCard
          label="Ticket Promedio"
          value={`$${(summary?.averageTicket || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="text-warning bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribución de Horas Pico</h3>
          </div>
          {(peakHours && peakHours.length > 0) ? (
            <div className="h-64">
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
            <EmptyState title="Sin horas pico" message="No hay suficientes datos de órdenes" />
          )}
        </div>

        {multiBranch && multiBranch.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Comparativa por Sucursal</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiBranch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Ingresos" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Órdenes" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Matriz BCG - Análisis de Menú</h3>
        </div>
        {bcg && bcg.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['star', 'cash_cow', 'question_mark', 'dog'] as const).map((quadrant) => {
              const items = bcg.filter((i: any) => i.quadrant === quadrant)
              return (
                <div key={quadrant} className="p-4 rounded-lg border" style={{ borderColor: BCG_COLORS[quadrant] + '30' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BCG_COLORS[quadrant] }} />
                    <h4 className="text-xs font-bold uppercase" style={{ color: BCG_COLORS[quadrant] }}>
                      {BCG_LABELS[quadrant]}
                    </h4>
                    <span className="text-xs text-on-surface-muted ml-auto">{items.length} platos</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-on-surface-muted">Sin platos en esta categoría</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.itemId} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-on-surface-muted">
                            {item.revenueShare.toFixed(1)}% · {item.profitMargin.toFixed(1)}% margen
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState title="Sin datos BCG" message="No hay suficientes ventas para generar la matriz" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Platos Más Vendidos</h3>
          </div>
          {summary?.topItems?.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Plato</th><th>Cant.</th><th>Ingreso</th></tr>
                </thead>
                <tbody>
                  {summary.topItems.map((item: any, i: number) => (
                    <tr key={item.itemId}>
                      <td className="text-on-surface-muted">{i + 1}</td>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold">${Number(item.revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin ventas" message="Aún no hay platos vendidos" />
          )}
        </div>

        {peakHours && peakHours.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tendencia por Hora</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
