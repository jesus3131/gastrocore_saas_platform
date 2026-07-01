import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { MetricCard, EmptyState, ErrorState, Modal } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Truck, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw } from 'lucide-react'

const statusColumns = ['pending', 'preparing', 'in_transit', 'delivered', 'canceled']
const statusLabels: Record<string, string> = {
  pending: 'Pendientes', preparing: 'Preparando', in_transit: 'En Camino', delivered: 'Entregados', canceled: 'Cancelados',
}
const statusColors: Record<string, string> = {
  pending: 'bg-warning/5 border-warning/20',
  preparing: 'bg-info/5 border-info/20',
  in_transit: 'bg-primary/5 border-primary/20',
  delivered: 'bg-success/5 border-success/20',
  canceled: 'bg-error/5 border-error/20',
}
const badgeColors: Record<string, string> = {
  pending: 'badge-warning', preparing: 'badge-info', in_transit: 'badge-neutral', delivered: 'badge-success', canceled: 'badge-error',
}

export function DeliveryHubPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: deliveries, isLoading, error, refetch } = useQuery({
    queryKey: ['integrations', 'delivery'],
    queryFn: () => api.get('/integrations/delivery').then((r) => r.data.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/integrations/delivery/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['integrations', 'delivery'] })
      setSelectedOrder(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar entregas" onRetry={refetch} />

  const grouped = statusColumns.reduce((acc, status) => {
    acc[status] = deliveries?.filter((d: any) => d.status === status) || []
    return acc
  }, {} as Record<string, any[]>)

  const totalDeliveries = deliveries?.length || 0
  const activeDeliveries = (grouped.preparing?.length || 0) + (grouped.in_transit?.length || 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Delivery Hub</h1>
        <button onClick={() => refetch()} className="btn-secondary btn-sm"><RefreshCw className="w-3 h-3" /> Actualizar</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Entregas" value={totalDeliveries} icon={Truck} color="text-primary bg-primary/10" />
        <MetricCard label="Activas" value={activeDeliveries} icon={Clock} color="text-info bg-info/10" />
        <MetricCard label="Entregadas" value={grouped.delivered?.length || 0} icon={CheckCircle} color="text-success bg-success/10" />
        <MetricCard label="Canceladas" value={grouped.canceled?.length || 0} icon={XCircle} color="text-error bg-error/10" />
      </div>

      {totalDeliveries > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statusColumns.map((status) => (
            <div key={status} className={`rounded-lg border p-3 ${statusColors[status] || ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold">{statusLabels[status]}</h3>
                <span className="badge-neutral text-2xs">{grouped[status]?.length || 0}</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {grouped[status]?.length === 0 ? (
                  <p className="text-xs text-on-surface-muted text-center py-4">Vacío</p>
                ) : (
                  grouped[status]?.map((delivery: any) => (
                    <div
                      key={delivery.id}
                      onClick={() => setSelectedOrder(delivery)}
                      className="p-2 rounded bg-white/50 cursor-pointer hover:shadow-sm transition-shadow text-xs"
                    >
                      <p className="font-semibold">{delivery.customerName || delivery.customer?.name || '—'}</p>
                      <p className="text-on-surface-muted">{delivery.items?.length || 0} items</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-primary">${Number(delivery.total).toFixed(2)}</span>
                        <span className={`${badgeColors[delivery.status]} text-2xs`}>{statusLabels[delivery.status]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin entregas" message="No hay entregas a domicilio registradas" />
      )}

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Delivery #${selectedOrder?.id?.slice(0, 8) || ''}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Cliente</p>
                <p className="text-sm font-medium">{selectedOrder.customerName || selectedOrder.customer?.name || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Total</p>
                <p className="text-sm font-bold text-primary">${Number(selectedOrder.total).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Plataforma</p>
                <p className="text-sm font-medium capitalize">{selectedOrder.channel || selectedOrder.platform || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Estado</p>
                <p className={`text-sm font-semibold ${selectedOrder.status === 'delivered' ? 'text-success' : selectedOrder.status === 'canceled' ? 'text-error' : 'text-warning'}`}>
                  {statusLabels[selectedOrder.status] || selectedOrder.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2">Items</p>
              {selectedOrder.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-on-surface-muted/5 last:border-0">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-medium">${Number(item.price || item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold mb-2">Cambiar Estado</p>
              <div className="flex flex-wrap gap-1">
                {['pending', 'preparing', 'in_transit', 'delivered', 'canceled'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ id: selectedOrder.id, status: s })}
                    disabled={s === selectedOrder.status || updateStatus.isPending}
                    className={`btn-sm text-xs ${s === selectedOrder.status ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
