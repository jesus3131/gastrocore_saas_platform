import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { EmptyState, ErrorState, Modal } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Smartphone, Globe, Truck, ShoppingBag, Plus, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react'

const channelIcons: Record<string, any> = {
  rappi: Smartphone, uber_eats: Truck, didi_food: Truck, sin_delivery: Globe, website: Globe, other: ShoppingBag,
}

const channelColors: Record<string, string> = {
  rappi: 'text-purple-600 bg-purple-100',
  uber_eats: 'text-green-600 bg-green-100',
  didi_food: 'text-orange-600 bg-orange-100',
  sin_delivery: 'text-gray-600 bg-gray-100',
  website: 'text-blue-600 bg-blue-100',
}

export function ChannelConfigPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: channels, isLoading, error, refetch } = useQuery({
    queryKey: ['integrations', 'delivery'],
    queryFn: () => api.get('/integrations/delivery').then((r) => r.data.data),
  })

  const toggleIntegration = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.put(`/integrations/${id}`, { isActive: enabled }),
    onSuccess: () => {
      toast.success('Canal actualizado')
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const deleteIntegration = useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/${id}`),
    onSuccess: () => {
      toast.success('Canal eliminado')
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar canales" onRetry={refetch} />

  const activeChannels = channels?.filter((c: any) => c.isActive !== false) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Canales de Entrega</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Nuevo Canal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels?.length > 0 ? (
          channels.map((channel: any) => {
            const Icon = channelIcons[channel.channel] || ShoppingBag
            const colorClass = channelColors[channel.channel] || 'text-primary bg-primary/10'
            return (
              <div key={channel.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold capitalize">{channel.name || channel.channel?.replace(/_/g, ' ')}</h3>
                      <p className="text-2xs text-on-surface-muted capitalize">{channel.channel?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleIntegration.mutate({ id: channel.id, enabled: channel.isActive !== false })}
                    className="btn-ghost btn-sm p-1"
                  >
                    {channel.isActive !== false ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-on-surface-muted" />}
                  </button>
                </div>

                {channel.markup !== undefined && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-on-surface-muted">Markup</span>
                    <span className="font-semibold">{channel.markup}%</span>
                  </div>
                )}

                {channel.menuMapping && (
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-on-surface-muted">Menú</span>
                    <span className="font-semibold">{channel.menuMapping}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-3 pt-2 border-t border-on-surface-muted/10">
                  <button onClick={() => { setEditing(channel); setModalOpen(true) }} className="btn-ghost btn-sm text-xs flex-1">
                    <Edit className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => { deleteIntegration.mutate(channel.id) }}
                    className="btn-ghost btn-sm text-xs flex-1 text-error"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="Sin canales configurados"
              message="Conecta plataformas de delivery como Rappi, Uber Eats o Didi Food"
              action={<button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Conectar Canal</button>}
            />
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Canal' : 'Nuevo Canal'}>
        <div className="space-y-4">
          <p className="text-sm text-on-surface-muted">Configuración del canal de entrega</p>
          <div className="grid grid-cols-2 gap-3">
            {[{ channel: 'rappi', label: 'Rappi' }, { channel: 'uber_eats', label: 'Uber Eats' }, { channel: 'didi_food', label: 'Didi Food' }, { channel: 'website', label: 'Sitio Web' }, { channel: 'sin_delivery', label: 'Sin Delivery' }, { channel: 'other', label: 'Otro' }].map((opt) => (
              <label key={opt.channel} className={`p-3 rounded-lg border cursor-pointer text-center hover:bg-surface-container transition-all ${editing?.channel === opt.channel ? 'border-primary bg-primary/5' : 'border-on-surface-muted/10'}`}>
                <input type="radio" name="channel" value={opt.channel} className="sr-only" />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
          <button className="btn-primary w-full">
            {editing ? 'Guardar Cambios' : 'Conectar Canal'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
