import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { MetricCard, ErrorState, EmptyState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import {
  DollarSign, ShoppingCart, TrendingUp, TrendingDown, RefreshCw,
  Wallet, ArrowUpRight, Circle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FlowDiagram } from '../components/flow-diagram'

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

const DONUT_COLORS = ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981']

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

  const refreshAll = () => { refetchSummary(); refetchBcg(); refetchPerf(); toast.success('Datos actualizados') }

  const incomeByCategory = bcg?.length
    ? Object.entries(
        bcg.reduce((acc: Record<string, number>, item: any) => {
          const cat = item.category || 'General'
          acc[cat] = (acc[cat] || 0) + item.revenue
          return acc
        }, {}),
      )
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value)
    : []

  const totalIncome = incomeByCategory.reduce((s, i) => s + i.value, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Analítica & Rendimiento</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">Monitoreo de alta precisión y flujos integrados</p>
        </div>
        <button onClick={refreshAll} className="btn-secondary btn-sm text-xs">
          <RefreshCw className="w-3 h-3" /> Actualizar Datos
        </button>
      </div>

      {/* Metric Cards */}
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

      {/* Main Charts Row: Bar + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Comparativa por Sucursal */}
        <div className="lg:col-span-2 rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Comparativa de Ventas</h3>
              <p className="text-xs text-on-surface-muted">Desglose de ingresos por sucursal</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-muted">
                <div className="w-2.5 h-2.5 rounded bg-primary" />
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-muted">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Órdenes</span>
              </div>
            </div>
          </div>
          {multiBranch && multiBranch.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiBranch} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="branchName" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="revenue" name="Ingresos" fill="#1E3A8A" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="ordersCount" name="Órdenes" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sin datos de sucursales" message="No hay sucursales configuradas" />
          )}
        </div>

        {/* Donut Chart - Distribución de Ingresos */}
        <div className="rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-on-surface">Distribución de Ingresos</h3>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full uppercase tracking-wider">Por categoría</span>
          </div>
          <p className="text-xs text-on-surface-muted mb-4">Análisis de rendimiento por menú</p>

          {incomeByCategory.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-center items-center py-4">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      cx="50%" cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomeByCategory.map((_, idx) => (
                        <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${(value).toLocaleString()}`, 'Ingreso']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 space-y-2">
                {incomeByCategory.map((item, idx) => {
                  const pct = totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(1) : '0'
                  return (
                    <div key={item.name} className="flex justify-between items-center p-2.5 bg-surface-container rounded-xl border border-on-surface-muted/5">
                      <div className="flex items-center gap-2.5">
                        <Circle className="w-3 h-3" fill={DONUT_COLORS[idx % DONUT_COLORS.length]} stroke="none" />
                        <span className="text-xs font-semibold text-on-surface">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-on-surface">${item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <EmptyState title="Sin datos" message="No hay ingresos por categoría" />
          )}
        </div>
      </div>

      {/* BCG Matrix */}
      <div className="rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm">
        <div className="card-header">
          <h3 className="card-title">Matriz BCG - Análisis de Menú</h3>
        </div>
        {bcg && bcg.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['star', 'cash_cow', 'question_mark', 'dog'] as const).map((quadrant) => {
              const items = bcg.filter((i: any) => i.quadrant === quadrant)
              return (
                <div key={quadrant} className="p-4 rounded-xl border" style={{ borderColor: BCG_COLORS[quadrant] + '30' }}>
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
                          <span className="text-sm font-medium text-on-surface">{item.name}</span>
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

      {/* Flow Diagram */}
      <FlowDiagram />

      {/* Bottom Row: Top Items + Peak Hours Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm">
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
                      <td className="font-medium text-on-surface">{item.name}</td>
                      <td className="text-on-surface">{item.quantity}</td>
                      <td className="font-semibold text-on-surface">${Number(item.revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin ventas" message="Aún no hay platos vendidos" />
          )}
        </div>

        <div className="rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Tendencia por Hora</h3>
          </div>
          {peakHours && peakHours.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sin horas pico" message="No hay suficientes datos de órdenes" />
          )}
        </div>
      </div>
    </div>
  )
}
