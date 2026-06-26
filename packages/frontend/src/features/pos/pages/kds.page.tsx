import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { LoadingSkeleton, EmptyState, ErrorState, MetricCard } from '../../../shared/components/ui'
import { Clock, ChefHat, UtensilsCrossed, RefreshCw, Bell } from 'lucide-react'

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'served']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendientes',
  preparing: 'Preparación',
  ready: 'Listos',
  served: 'Servidos',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/5 border-warning/30',
  preparing: 'bg-info/5 border-info/30',
  ready: 'bg-success/5 border-success/30',
  served: 'bg-surface-container border-on-surface-muted/10',
}
const BADGE_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  preparing: 'badge-info',
  ready: 'badge-success',
  served: 'badge-neutral',
}

export function KdsPage() {
  const [notiSound, setNotiSound] = useState(false)
  const queryClient = useQueryClient()

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['pos', 'orders'],
    queryFn: () => api.get('/pos/orders').then((r) => r.data.data),
    refetchInterval: 15000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/pos/orders/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      if (vars.status === 'preparing') {
        setNotiSound(true)
        setTimeout(() => setNotiSound(false), 2000)
      }
      toast.success(`Orden actualizada a "${STATUS_LABELS[vars.status] || vars.status}"`)
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar comandas" onRetry={refetch} />

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = orders?.filter((o: any) => o.status === status) || []
    return acc
  }, {} as Record<string, any[]>)

  const newOrders = grouped.pending?.length || 0
  const inKitchen = grouped.preparing?.length || 0
  const ready = grouped.ready?.length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-on-surface">Comandas - Cocina</h1>
        </div>
        <div className="flex items-center gap-2">
          {notiSound && (
            <div className="flex items-center gap-1 text-warning text-xs font-medium animate-bounce">
              <Bell className="w-4 h-4" /> ¡Nueva comanda!
            </div>
          )}
          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw className="w-3 h-3" /> Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Nuevas Órdenes" value={newOrders} icon={Bell} color="text-warning bg-warning/10" />
        <MetricCard label="En Cocina" value={inKitchen} icon={ChefHat} color="text-info bg-info/10" />
        <MetricCard label="Listas para Servir" value={ready} icon={UtensilsCrossed} color="text-success bg-success/10" />
      </div>

      {orders?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_ORDER.map((status) => {
            const items = grouped[status] || []
            const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1] || status

            return (
              <div key={status} className={`rounded-lg border p-3 ${STATUS_COLORS[status] || ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">{STATUS_LABELS[status]}</h3>
                  <span className={`${BADGE_COLORS[status]} text-xs`}>{items.length}</span>
                </div>

                <div className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-xs text-on-surface-muted text-center py-6">Sin órdenes</p>
                  ) : (
                    items.map((order: any) => (
                      <div key={order.id} className="p-3 rounded-lg bg-surface border border-on-surface-muted/10 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-bold text-on-surface">
                              #{order.orderNumber || order.id.slice(0, 6)}
                            </span>
                            {order.table && (
                              <span className="text-xs text-on-surface-muted ml-2">
                                Mesa {order.table.label}
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            (order.priority === 'high' || order.type === 'urgent')
                              ? 'bg-error/10 text-error'
                              : 'bg-surface-container-high text-on-surface-muted'
                          }`}>
                            {order.type || 'dine_in'}
                          </span>
                        </div>

                        <div className="space-y-1 mb-2">
                          {order.items?.map((item: any, i: number) => (
                            <div key={item.id || i} className="text-xs flex items-start gap-2">
                              <span className="font-bold text-primary w-5 shrink-0">x{item.quantity}</span>
                              <div className="flex-1">
                                <span className="font-medium text-on-surface">{item.name}</span>
                                {item.notes && (
                                  <p className="text-2xs text-on-surface-muted italic">"{item.notes}"</p>
                                )}
                                {item.modifiers?.map((m: any) => (
                                  <span key={m} className="text-2xs text-on-surface-muted block">+ {m}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-2xs text-on-surface-muted mb-2 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                          <span className="font-medium text-on-surface-muted">
                            {Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min
                          </span>
                        </div>

                        {status !== 'served' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                            disabled={updateStatus.isPending}
                            className={`w-full text-xs py-1.5 rounded-lg font-medium transition-all ${
                              status === 'pending'
                                ? 'bg-primary text-white hover:bg-primary-700'
                                : status === 'preparing'
                                ? 'bg-success text-white hover:bg-green-600'
                                : 'bg-surface-container-high text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            {status === 'pending' ? '▶ Iniciar Preparación' :
                             status === 'preparing' ? '✓ Marcar Listo' :
                             '→ Marcar Servido'}
                          </button>
                        )}

                        {status === 'pending' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: order.id, status: 'canceled' })}
                            className="w-full text-xs py-1 rounded-lg mt-1 text-error hover:bg-error/5 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Sin comandas"
          message="No hay órdenes enviadas a cocina. Crea una orden desde POS."
        />
      )}
    </div>
  )
}
