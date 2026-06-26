import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { DataTable, Modal, FormField, ConfirmDialog, MetricCard, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Plus, Edit, Trash2, Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Ingredient {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minimumStock: number
  unitCost: number
  unit: string
}

export function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>()

  const { data: ingredients, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', 'ingredients'],
    queryFn: () => api.get('/inventory/ingredients').then((r) => r.data.data),
  })

  const { data: alerts } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => api.get('/inventory/stock/alerts').then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/inventory/ingredients', data),
    onSuccess: () => { toast.success('Ingrediente creado'); queryClient.invalidateQueries({ queryKey: ['inventory'] }); setModalOpen(false); reset() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/inventory/ingredients/${editing?.id}`, data),
    onSuccess: () => { toast.success('Ingrediente actualizado'); queryClient.invalidateQueries({ queryKey: ['inventory'] }); setModalOpen(false); setEditing(null); reset() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', sku: '', category: 'produce', currentStock: 0, minimumStock: 10, unitCost: 0, unit: 'kg' }); setModalOpen(true) }
  const openEdit = (item: Ingredient) => { setEditing(item); reset(item); setModalOpen(true) }

  const onSubmit = (data: any) => {
    if (editing) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar inventario" onRetry={refetch} />

  const lowStock = ingredients?.filter((i: Ingredient) => Number(i.currentStock) <= Number(i.minimumStock)) || []
  const totalValue = ingredients?.reduce((s: number, i: Ingredient) => s + Number(i.currentStock) * Number(i.unitCost), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Inventario</h1>
        <button onClick={openCreate} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Nuevo Ingrediente</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Total Ingredientes" value={ingredients?.length || 0} icon={Package} color="text-primary bg-primary/10" />
        <MetricCard label="Valor Total" value={`$${totalValue.toFixed(2)}`} icon={DollarSign} color="text-success bg-success/10" />
        <MetricCard label="Stock Bajo" value={lowStock.length} icon={AlertTriangle} color="text-error bg-error/10" />
      </div>

      {alerts?.length > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-error">Alertas de Stock Bajo</p>
            <p className="text-xs text-on-surface-muted mt-1">{alerts.length} ingrediente{alerts.length > 1 ? 's' : ''} por debajo del mínimo</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ingredientes</h3>
        </div>
        {ingredients?.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: 'Nombre' },
              { key: 'sku', label: 'SKU', render: (r: Ingredient) => <span className="text-xs font-mono">{r.sku}</span> },
              { key: 'category', label: 'Categoría' },
              { key: 'currentStock', label: 'Stock Actual', render: (r: Ingredient) => {
                const isLow = Number(r.currentStock) <= Number(r.minimumStock)
                return <span className={isLow ? 'text-error font-semibold' : ''}>{Number(r.currentStock).toFixed(2)} {r.unit}</span>
              }},
              { key: 'minimumStock', label: 'Stock Mínimo', render: (r: Ingredient) => `${Number(r.minimumStock).toFixed(2)} ${r.unit}` },
              { key: 'unitCost', label: 'Costo Uni.', render: (r: Ingredient) => `$${Number(r.unitCost).toFixed(2)}` },
              { key: 'status', label: 'Estado', sortable: false, render: (r: Ingredient) => {
                const isLow = Number(r.currentStock) <= Number(r.minimumStock)
                return isLow ? <span className="badge-error">Stock Bajo</span> : <span className="badge-success">OK</span>
              }},
              { key: 'actions', label: '', sortable: false, render: (r: Ingredient) => (
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="btn-ghost btn-sm p-1"><Edit className="w-3 h-3" /></button>
                </div>
              )},
            ]}
            data={ingredients || []}
            keyField="id"
            emptyMessage="No hay ingredientes registrados"
            pageSize={15}
          />
        ) : (
          <EmptyState title="Sin ingredientes" message="Agrega tu primer ingrediente" action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Nuevo Ingrediente</button>} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre" registration={register('name', { required: true })} error={errors.name ? 'Requerido' : undefined} />
            <FormField label="SKU" registration={register('sku', { required: true })} error={errors.sku ? 'Requerido' : undefined} />
          </div>
          <FormField label="Categoría" type="select" registration={register('category')} options={[
            { value: 'produce', label: 'Produce' }, { value: 'meat', label: 'Carne' }, { value: 'seafood', label: 'Mariscos' },
            { value: 'dairy', label: 'Lácteos' }, { value: 'dry', label: 'Secos' }, { value: 'beverage', label: 'Bebidas' },
            { value: 'other', label: 'Otros' },
          ]} />
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Stock Actual" type="number" registration={register('currentStock')} />
            <FormField label="Stock Mínimo" type="number" registration={register('minimumStock')} />
            <FormField label="Unidad" type="select" registration={register('unit')} options={[
              { value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }, { value: 'l', label: 'L' },
              { value: 'ml', label: 'mL' }, { value: 'pcs', label: 'pz' }, { value: 'bags', label: 'bolsas' },
            ]} />
          </div>
          <FormField label="Costo por Unidad" type="number" registration={register('unitCost')} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setEditing(null) }} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
