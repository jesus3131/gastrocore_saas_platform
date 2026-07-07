import { useQuery } from '@tanstack/react-query'
import { UtensilsCrossed, ChefHat, Bike, Receipt, TrendingUp } from 'lucide-react'
import { api } from '../../../lib/api'

interface FlowMetrics {
  statusBreakdown: Record<string, number>
  today: { orders: number; revenue: number }
  avgProcessingMinutes: number
  weeklyEfficiency: number
  busiestDay: string
  totalCustomers30d: number
}

function FlowNode({ icon: Icon, label, sublabel, value, unit, color, bg, border, alert }: {
  icon: any; label: string; sublabel: string; value: string | number; unit?: string
  color: string; bg: string; border: string; alert?: boolean
}) {
  return (
    <div className={`relative w-44 bg-white dark:bg-slate-900 border-2 p-4 rounded-2xl shadow-md z-10 text-center ${border}`}>
      {alert && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full animate-pulse uppercase">
          Alerta
        </span>
      )}
      <div className={`w-12 h-12 mx-auto rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</h4>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center font-mono">
        <span className={`text-sm font-bold ${color}`}>{value}</span>
        {unit && <span className="text-[9px] text-slate-400">{unit}</span>}
      </div>
    </div>
  )
}

export function FlowDiagram() {
  const { data: flow, isLoading } = useQuery({
    queryKey: ['analytics', 'flow'],
    queryFn: () => api.get('/analytics/flow-metrics').then((r) => r.data.data as FlowMetrics),
    refetchInterval: 30_000,
  })

  const pending = flow?.statusBreakdown?.pending ?? 0
  const preparing = flow?.statusBreakdown?.preparing ?? 0
  const ready = flow?.statusBreakdown?.ready ?? 0
  const paid = flow?.statusBreakdown?.paid ?? 0
  const totalOrders = flow?.totalCustomers30d ?? 0

  const maxStatus = Math.max(pending, preparing, ready, paid, 1)

  const bottleneck = preparing > 0 && preparing >= pending && preparing >= ready ? 'Cocina' :
    pending > 0 && pending >= preparing && pending >= ready ? 'Captura' :
    ready > 0 && ready >= preparing && ready >= pending ? 'Despacho' : 'N/A'

  return (
    <div className="rounded-2xl border border-on-surface-muted/10 bg-surface p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h3 className="text-lg font-bold text-on-surface">Flujo de Procesamiento de Pedidos</h3>
          </div>
          <p className="text-xs text-on-surface-muted">
            {isLoading ? 'Cargando...' :
              `Órdenes activas: ${pending + preparing + ready} · Procesadas (30d): ${totalOrders}`}
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[900px] flex justify-between items-center relative py-6 px-10">
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 950 200" preserveAspectRatio="none">
              <defs>
                <pattern id="dash-indigo" patternUnits="userSpaceOnUse" width="10" height="4">
                  <line x1="0" y1="2" x2="10" y2="2" stroke="#6366f1" strokeWidth="2" strokeDasharray="3,3" />
                </pattern>
                <pattern id="dash-rose" patternUnits="userSpaceOnUse" width="10" height="4">
                  <line x1="0" y1="2" x2="10" y2="2" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                </pattern>
                <pattern id="dash-cyan" patternUnits="userSpaceOnUse" width="10" height="4">
                  <line x1="0" y1="2" x2="10" y2="2" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3,3" />
                </pattern>
              </defs>
              <line x1="175" y1="95" x2="265" y2="95" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" />
              <line x1="175" y1="95" x2="265" y2="95" stroke="url(#dash-indigo)" strokeWidth="3" />
              <line x1="395" y1="95" x2="485" y2="95" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" />
              <line x1="395" y1="95" x2="485" y2="95" stroke="url(#dash-rose)" strokeWidth="3" />
              <line x1="615" y1="95" x2="705" y2="95" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" />
              <line x1="615" y1="95" x2="705" y2="95" stroke="url(#dash-cyan)" strokeWidth="3" />
            </svg>
          </div>

          <FlowNode icon={UtensilsCrossed} label="1. Captura" sublabel="Pedidos en Cola"
            value={pending} unit="pendientes"
            color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-950/30"
            border="border-indigo-500/80" />

          <FlowNode icon={ChefHat} label="2. Cocina" sublabel="Preparación & Chef"
            value={preparing} unit="en cocina"
            color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-950/30"
            border="border-rose-500/80" alert={preparing > pending && preparing > 0} />

          <FlowNode icon={Bike} label="3. Despacho" sublabel="Empaque & Servicio"
            value={ready} unit="listos"
            color="text-cyan-600 dark:text-cyan-400" bg="bg-cyan-50 dark:bg-cyan-950/30"
            border="border-cyan-500/80" />

          <FlowNode icon={Receipt} label="4. Cobro" sublabel="Cierre de Caja"
            value={paid} unit="pagados"
            color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30"
            border="border-emerald-500/80" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-on-surface-muted/10 pt-6">
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Eficiencia Operativa</span>
          <p className="text-lg font-black text-on-surface mt-1">{flow?.weeklyEfficiency ?? 0}%</p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center mt-0.5">
            <TrendingUp className="w-3 h-3 mr-1" />
            {flow?.avgProcessingMinutes ?? 0} min promedio
          </span>
        </div>
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5 relative overflow-hidden">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Mayor Demanda</span>
          <p className="text-lg font-black text-rose-500 mt-1">{bottleneck}</p>
          <span className="text-[10px] text-on-surface-muted flex items-center mt-0.5">
            Día más ocupado: {flow?.busiestDay ?? 'N/A'}
          </span>
        </div>
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Órdenes Hoy</span>
          <p className="text-lg font-black text-cyan-500 mt-1">{flow?.today?.orders ?? 0}</p>
          <span className="text-[10px] text-on-surface-muted flex items-center mt-0.5">
            ${(flow?.today?.revenue ?? 0).toLocaleString()} en ingresos
          </span>
        </div>
      </div>
    </div>
  )
}
