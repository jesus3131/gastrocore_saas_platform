import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, EmptyState, ErrorState, MetricCard } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Table2, Users, Clock, Coffee, ChefHat } from 'lucide-react'
import { useWebsocket } from '../../../app/hooks/use-websocket'

const statusColors: Record<string, string> = {
  available: 'border-success bg-success/5 text-success hover:bg-success/10',
  taking_order: 'border-info bg-info/5 text-info hover:bg-info/10',
  occupied: 'border-error bg-error/5 text-error hover:bg-error/10',
  bill_requested: 'border-warning bg-warning/5 text-warning hover:bg-warning/10',
  reserved: 'border-warning bg-warning/5 text-warning hover:bg-warning/10',
  cleaning: 'border-teal-500 bg-teal-50 text-teal-700 hover:bg-teal-100',
  closed: 'border-on-surface-muted/30 bg-surface-container text-on-surface-muted hover:bg-surface-container-high',
}

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  taking_order: 'Tomando pedido',
  occupied: 'Ocupada',
  bill_requested: 'Cuenta',
  cleaning: 'Limpieza',
  reserved: 'Reservada',
  closed: 'Cerrada',
}

export function TableMapPage() {
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const queryClient = useQueryClient()
  const { subscribe } = useWebsocket()

  useEffect(() => {
    const unsub1 = subscribe('table.status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'tables'] })
    })
    const unsub2 = subscribe('order.created', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'tables'] })
    })
    const unsub3 = subscribe('order.status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'tables'] })
    })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [subscribe, queryClient])

  const { data: branches, isLoading, error, refetch } = useQuery({
    queryKey: ['pos', 'tables'],
    queryFn: () => api.get('/pos/tables').then((r) => r.data.data),
  })

  const updateTableStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/pos/tables/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Estado de mesa actualizado')
      queryClient.invalidateQueries({ queryKey: ['pos', 'tables'] })
      setSelectedTable(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar mapa de mesas" onRetry={refetch} />

  const allTables = branches?.flatMap((b: any) => b.areas?.flatMap((a: any) => a.tables || []) || []) || []
  const available = allTables.filter((t: any) => t.status === 'available').length
  const taking = allTables.filter((t: any) => t.status === 'taking_order').length
  const occupied = allTables.filter((t: any) => t.status === 'occupied').length
  const reserved = allTables.filter((t: any) => t.status === 'reserved').length

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Mapa de Mesas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Disponibles" value={available} icon={Coffee} color="text-success bg-success/10" />
        <MetricCard label="Tomando" value={taking} icon={ChefHat} color="text-info bg-info/10" />
        <MetricCard label="Ocupadas" value={occupied} icon={Users} color="text-error bg-error/10" />
        <MetricCard label="Total" value={allTables.length} icon={Table2} color="text-primary bg-primary/10" />
      </div>

      {branches?.length > 0 ? (
        branches.map((branch: any) => (
          <div key={branch.id}>
            <h2 className="text-sm font-semibold text-on-surface mb-3">{branch.name}</h2>
            <div className="space-y-4">
              {branch.areas?.map((area: any) => (
                <div key={area.id} className="card">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <h3 className="card-title">{area.name}</h3>
                      <span className="badge-neutral text-2xs">{area.type === 'dining' ? 'Comedor' : area.type === 'terrace' ? 'Terraza' : area.type === 'bar' ? 'Barra' : area.type === 'vip' ? 'VIP' : area.type}</span>
                    </div>
                    <span className="text-xs text-on-surface-muted">
                      {area.tables?.filter((t: any) => t.status === 'available').length}/{area.tables?.length || 0} libres
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {area.tables?.map((table: any) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[table.status] || statusColors.available}`}
                      >
                        <span className="text-sm font-bold">{table.label}</span>
                        <span className="text-2xs">{table.capacity} pax</span>
                        {table.waiterName && (
                          <span className="text-2xs mt-0.5 font-medium">{table.waiterName}</span>
                        )}
                        {table.activeOrder && (
                          <div className="mt-1">
                            <span className="text-2xs font-semibold">${Number(table.activeOrder.total).toFixed(0)}</span>
                          </div>
                        )}
                        <span className="text-2xs mt-0.5 opacity-70">{statusLabels[table.status] || table.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title="Sin mesas configuradas"
          message="Ve a Onboarding para configurar áreas y mesas"
        />
      )}

      <Modal open={!!selectedTable} onClose={() => setSelectedTable(null)} title={`Mesa ${selectedTable?.label || ''}`} size="sm">
        {selectedTable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Capacidad</p>
                <p className="text-lg font-bold">{selectedTable.capacity} pax</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container">
                <p className="text-2xs text-on-surface-muted">Estado</p>
                <p className={`text-lg font-bold ${selectedTable.status === 'available' ? 'text-success' : selectedTable.status === 'occupied' ? 'text-error' : 'text-warning'}`}>
                  {statusLabels[selectedTable.status] || selectedTable.status}
                </p>
              </div>
            </div>

            {selectedTable.waiterName && (
              <div className="p-3 rounded-lg bg-info/5 border border-info/20 text-center">
                <p className="text-2xs text-on-surface-muted">Mesero asignado</p>
                <p className="text-sm font-bold text-info">{selectedTable.waiterName}</p>
              </div>
            )}

            {selectedTable.activeOrder && (
              <div className="p-3 rounded-lg bg-surface-container text-center">
                <p className="text-2xs text-on-surface-muted">Orden activa</p>
                <p className="text-sm font-bold text-on-surface">${Number(selectedTable.activeOrder.total).toFixed(2)}</p>
              </div>
            )}

            <p className="text-xs font-semibold text-on-surface">Cambiar Estado:</p>
            <div className="grid grid-cols-2 gap-2">
              {['available', 'taking_order', 'occupied', 'bill_requested', 'cleaning', 'reserved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateTableStatus.mutate({ id: selectedTable.id, status })}
                  disabled={status === selectedTable.status || updateTableStatus.isPending}
                  className={`btn btn-sm ${status === selectedTable.status ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {statusLabels[status] || status}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
