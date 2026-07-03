import { useState } from 'react'
import { UtensilsCrossed, ChefHat, Bike, Receipt } from 'lucide-react'

const nodes = [
  {
    id: 'capture',
    title: '1. Captura',
    subtitle: 'Pedidos en Cola',
    time: '1.4 min',
    icon: UtensilsCrossed,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-500/80',
  },
  {
    id: 'kitchen',
    title: '2. Cocina',
    subtitle: 'Preparación & Chef',
    time: '18.5 min',
    icon: ChefHat,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-500/80',
    alert: true,
  },
  {
    id: 'dispatch',
    title: '3. Despacho',
    subtitle: 'Empaque & Servicio',
    time: '3.2 min',
    icon: Bike,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-500/80',
  },
  {
    id: 'billing',
    title: '4. Cobro',
    subtitle: 'Cierre de Caja',
    time: '0.8 min',
    icon: Receipt,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-500/80',
  },
]

function NodeCard({ node, isSelected, onSelect }: {
  node: typeof nodes[0]
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`relative w-44 bg-white dark:bg-slate-900 border-2 p-4 rounded-2xl shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 text-center ${
        isSelected ? node.border + ' ring-2 ring-offset-2 dark:ring-offset-slate-900' : node.border + ' opacity-90'
      }`}
    >
      {node.alert && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full animate-pulse uppercase">
          Alerta
        </span>
      )}
      <div className={`w-12 h-12 mx-auto rounded-xl ${node.bg} ${node.color} flex items-center justify-center mb-3`}>
        <node.icon className="w-6 h-6" />
      </div>
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{node.title}</h4>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{node.subtitle}</p>
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center font-mono">
        <span className="text-[9px] text-slate-400">T. Prom:</span>
        <span className={`text-[10px] font-bold ${node.color}`}>{node.time}</span>
      </div>
    </button>
  )
}

export function FlowDiagram() {
  const [selected, setSelected] = useState<string | null>(null)

  const infos: Record<string, { title: string; desc: string }> = {
    capture: { title: 'Fase 1: Captura de Orden', desc: 'El cliente envía su pedido desde App o POS. Promedio: 1.4 minutos.' },
    kitchen: { title: 'Fase 2: Preparación Cocina', desc: 'Platos preparados por la línea principal. Cuello de botella actual: 18.5 min.' },
    dispatch: { title: 'Fase 3: Despacho & Embalaje', desc: 'Control de calidad del empaque y asignación de mesa/repartidor. Promedio: 3.2 min.' },
    billing: { title: 'Fase 4: Cobro o Transacción', desc: 'Cierre de comandas electrónicas y pasarela de pago. Promedio: 0.8 min.' },
  }

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
          <p className="text-xs text-on-surface-muted">Mapeo del ciclo de vida operativa y embudo de conversión logística.</p>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[900px] flex justify-between items-center relative py-6 px-10">
          {/* SVG Connectors */}
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

          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} isSelected={selected === node.id} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {selected && (
        <div className="mt-4 p-4 rounded-xl bg-surface-container border border-on-surface-muted/10 animate-fade-in">
          <p className="text-sm font-semibold text-on-surface">{infos[selected].title}</p>
          <p className="text-xs text-on-surface-muted mt-1">{infos[selected].desc}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-on-surface-muted/10 pt-6">
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Eficiencia Operativa</span>
          <p className="text-lg font-black text-on-surface mt-1">94.2%</p>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center mt-0.5">▲ +2.1% esta semana</span>
        </div>
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5 relative overflow-hidden">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Mayor Retraso</span>
          <p className="text-lg font-black text-rose-500 mt-1">Fase Cocina</p>
          <span className="text-[10px] text-on-surface-muted flex items-center mt-0.5">Debido a alta demanda</span>
        </div>
        <div className="bg-surface-container p-4 rounded-xl border border-on-surface-muted/5">
          <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-wider">Satisfacción de Entrega</span>
          <p className="text-lg font-black text-cyan-500 mt-1">4.8 / 5.0</p>
          <span className="text-[10px] text-on-surface-muted flex items-center mt-0.5">Feedback de 842 clientes</span>
        </div>
      </div>
    </div>
  )
}
