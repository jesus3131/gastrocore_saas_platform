import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { DataTable, Modal, FormField, ConfirmDialog, MetricCard, ErrorState, EmptyState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Plus, Edit, Trash2, Users, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  totalVisits: number
  totalSpent: number
  loyaltyPoints: number
  segment: string
  notes?: string
  tags?: string[]
  createdAt: string
}

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>()

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['crm', 'customers'],
    queryFn: () => api.get('/crm/customers').then((r) => r.data.data),
  })

  const { data: segments } = useQuery({
    queryKey: ['crm', 'segments'],
    queryFn: () => api.get('/crm/segments').then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/crm/customers', data),
    onSuccess: () => {
      toast.success('Cliente creado')
      queryClient.invalidateQueries({ queryKey: ['crm'] })
      setModalOpen(false)
      reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/crm/customers/${editingCustomer?.id}`, data),
    onSuccess: () => {
      toast.success('Cliente actualizado')
      queryClient.invalidateQueries({ queryKey: ['crm'] })
      setModalOpen(false)
      setEditingCustomer(null)
      reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.put(`/crm/customers/${deleteId}`, { isActive: false }),
    onSuccess: () => {
      toast.success('Cliente eliminado')
      queryClient.invalidateQueries({ queryKey: ['crm'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al eliminar'),
  })

  const openCreate = () => {
    setEditingCustomer(null)
    reset({ name: '', email: '', phone: '', notes: '' })
    setModalOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    reset({ name: customer.name, email: customer.email || '', phone: customer.phone || '', notes: customer.notes || '' })
    setModalOpen(true)
  }

  const onSubmit = (data: any) => {
    if (editingCustomer) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message="Error al cargar clientes" onRetry={refetch} />

  const filtered = customers?.filter((c: Customer) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Clientes CRM</h1>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <UserPlus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {segments && segments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Total Clientes" value={customers?.length || 0} icon={Users} color="text-primary bg-primary/10" />
          {segments.map((seg: any) => (
            <div key={seg.name} className="card text-center">
              <p className="text-2xl font-bold text-primary">{seg.count}</p>
              <p className="text-xs font-medium text-on-surface-muted">{seg.name}</p>
              <p className="text-2xs text-on-surface-subtle mt-1">{seg.condition}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Directorio de Clientes</h3>
        </div>
        {customers?.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: 'Nombre' },
              { key: 'email', label: 'Email', render: (r: Customer) => r.email || '-' },
              { key: 'phone', label: 'Teléfono', render: (r: Customer) => r.phone || '-' },
              { key: 'totalVisits', label: 'Visitas' },
              { key: 'totalSpent', label: 'Total Gastado', render: (r: Customer) => `$${Number(r.totalSpent).toFixed(2)}` },
              { key: 'loyaltyPoints', label: 'Puntos' },
              { key: 'segment', label: 'Segmento', render: (r: Customer) => <span className="badge-info">{r.segment}</span> },
              { key: 'actions', label: 'Acciones', sortable: false, render: (r: Customer) => (
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="btn-ghost btn-sm p-1"><Edit className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id) }} className="btn-ghost btn-sm p-1 text-error"><Trash2 className="w-3 h-3" /></button>
                </div>
              )},
            ]}
            data={filtered || []}
            keyField="id"
            searchable
            searchPlaceholder="Buscar cliente..."
            emptyMessage="No se encontraron clientes"
            pageSize={10}
          />
        ) : (
          <EmptyState
            title="Sin clientes"
            message="Aún no hay clientes registrados. Crea tu primer cliente."
            action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Nuevo Cliente</button>}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingCustomer(null) }} title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nombre" registration={register('name', { required: true })} error={errors.name ? 'Requerido' : undefined} />
          <FormField label="Email" type="email" registration={register('email')} />
          <FormField label="Teléfono" registration={register('phone')} />
          <FormField label="Notas" type="textarea" registration={register('notes')} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setEditingCustomer(null) }} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Eliminar Cliente"
        message="¿Desactivar este cliente? Podrás reactivarlo después."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
