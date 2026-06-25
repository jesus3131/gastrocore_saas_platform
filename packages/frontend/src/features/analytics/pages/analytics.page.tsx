import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BCG_COLORS = {
  star: '#10B981',
  cash_cow: '#3B82F6',
  question_mark: '#F59E0B',
  dog: '#EF4444',
}

export function AnalyticsPage() {
  const { data: summary } = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => api.get('/analytics/sales').then((r) => r.data.data),
  })

  const { data: bcg } = useQuery({
    queryKey: ['analytics', 'bcg'],
    queryFn: () => api.get('/analytics/bcg-matrix').then((r) => r.data.data),
  })

  const { data: performance } = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: () => api.get('/analytics/performance').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Analítica & Rendimiento</h1>

      {/* Performance comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos Mes Actual', value: `$${Number(performance?.currentMonth?.revenue || 0).toLocaleString()}`, change: `${(performance?.growth?.revenue || 0).toFixed(1)}%` },
          { label: 'Ingresos Mes Anterior', value: `$${Number(performance?.previousMonth?.revenue || 0).toLocaleString()}`, change: '' },
          { label: 'Ordenes Este Mes', value: performance?.currentMonth?.orders || 0, change: `${(performance?.growth?.orders || 0).toFixed(1)}%` },
          { label: 'Ticket Promedio', value: `$${(summary?.averageTicket || 0).toFixed(2)}`, change: '' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-xs text-on-surface-muted">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.change && (
              <p className={`text-xs font-medium mt-1 ${Number(stat.change) > 0 ? 'text-success' : 'text-error'}`}>
                {Number(stat.change) > 0 ? '↑' : '↓'} {stat.change} vs mes anterior
              </p>
            )}
          </div>
        ))}
      </div>

      {/* BCG Matrix */}
      {bcg && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Matriz BCG - Análisis de Menú</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['star', 'cash_cow', 'question_mark', 'dog'] as const).map((quadrant) => {
              const items = bcg.filter((i: any) => i.quadrant === quadrant)
              const labels = { star: 'Estrella', cash_cow: 'Vaca', question_mark: 'Interrogante', dog: 'Perro' }
              return (
                <div key={quadrant} className="p-3 rounded-lg border" style={{ borderColor: BCG_COLORS[quadrant] + '40' }}>
                  <h4 className="text-xs font-semibold" style={{ color: BCG_COLORS[quadrant] }}>{labels[quadrant]}</h4>
                  {items.length === 0 ? (
                    <p className="text-xs text-on-surface-muted mt-2">Sin platos</p>
                  ) : (
                    items.map((item: any) => (
                      <div key={item.itemId} className="mt-2">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-2xs text-on-surface-muted">
                          {item.revenueShare.toFixed(1)}% ingresos · {item.profitMargin.toFixed(1)}% margen
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Peak hours chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Distribución de Horas Pico</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.peakHours || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
