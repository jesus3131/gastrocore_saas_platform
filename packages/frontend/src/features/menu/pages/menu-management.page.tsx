import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, FormField, ConfirmDialog, LoadingSkeleton, EmptyState, ErrorState } from '../../../shared/components/ui'
import { ImageUpload } from '../../../shared/components/ui/image-upload'
import { useForm } from 'react-hook-form'
import {
  Plus, Edit, Trash2, ChevronDown, ChevronRight, ImageOff,
  Eye, EyeOff, GripVertical,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  menuItems: MenuItem[]
}

interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string | null
  price: number
  cost?: number | null
  imageUrl?: string | null
  available: boolean
  sortOrder: number
  createdAt: string
}

export function MenuManagementPage() {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [catModal, setCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [itemModal, setItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'cat' | 'item'; id: string; name: string } | null>(null)
  const queryClient = useQueryClient()

  const catForm = useForm<any>()
  const itemForm = useForm<any>()

  const { data: menu, isLoading, error, refetch } = useQuery({
    queryKey: ['menu', 'full'],
    queryFn: () => api.get('/menu').then((r) => r.data.data as Category[]),
  })

  const createCat = useMutation({
    mutationFn: (d: any) => api.post('/menu/categories', d),
    onSuccess: () => { toast.success('Categoría creada'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setCatModal(false); catForm.reset() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })
  const updateCat = useMutation({
    mutationFn: (d: any) => api.put(`/menu/categories/${editingCat?.id}`, d),
    onSuccess: () => { toast.success('Categoría actualizada'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setCatModal(false); setEditingCat(null); catForm.reset() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })
  const deleteCat = useMutation({
    mutationFn: () => api.delete(`/menu/categories/${deleteTarget!.id}`),
    onSuccess: () => { toast.success('Categoría eliminada'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setDeleteTarget(null) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })

  const createItem = useMutation({
    mutationFn: (d: any) => api.post('/menu/items', d),
    onSuccess: () => { toast.success('Plato creado'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setItemModal(false); itemForm.reset() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })
  const updateItem = useMutation({
    mutationFn: (d: any) => api.put(`/menu/items/${editingItem?.id}`, d),
    onSuccess: () => { toast.success('Plato actualizado'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setItemModal(false); setEditingItem(null); itemForm.reset() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })
  const deleteItem = useMutation({
    mutationFn: () => api.delete(`/menu/items/${deleteTarget!.id}`),
    onSuccess: () => { toast.success('Plato eliminado'); queryClient.invalidateQueries({ queryKey: ['menu'] }); setDeleteTarget(null) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  })

  const openNewCat = () => { setEditingCat(null); catForm.reset({ name: '', sortOrder: 0 }) ; setCatModal(true) }
  const openEditCat = (c: Category) => { setEditingCat(c); catForm.reset({ name: c.name, sortOrder: c.sortOrder }); setCatModal(true) }
  const openNewItem = (catId: string) => { setEditingItem(null); setSelectedCatId(catId); itemForm.reset({ categoryId: catId, name: '', description: '', price: 0, cost: 0, sortOrder: 0, available: true }); setItemModal(true) }
  const openEditItem = (item: MenuItem) => { setEditingItem(item); setSelectedCatId(item.categoryId); itemForm.reset({ ...item }); setItemModal(true) }

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const onCatSubmit = (d: any) => {
    if (editingCat) updateCat.mutate(d); else createCat.mutate(d)
  }
  const onItemSubmit = (d: any) => {
    const payload = {
      ...d,
      price: Number(d.price),
      cost: d.cost ? Number(d.cost) : undefined,
      sortOrder: Number(d.sortOrder) || 0,
      available: d.available === true || d.available === 'true',
    }
    if (editingItem) updateItem.mutate(payload); else createItem.mutate(payload)
  }

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar el menú" onRetry={refetch} />

  const totalItems = menu?.reduce((s, c) => s + (c.menuItems?.length || 0), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Gestión del Menú</h1>
          <p className="text-xs text-on-surface-muted mt-0.5">
            {menu?.length || 0} categorías · {totalItems} platos
          </p>
        </div>
        <button onClick={openNewCat} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      {menu && menu.length > 0 ? (
        <div className="space-y-3">
          {menu.map((cat) => {
            const isExpanded = expandedCats.has(cat.id)
            const items = cat.menuItems || []
            return (
              <div key={cat.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container-hover transition-colors"
                  onClick={() => toggleCat(cat.id)}
                >
                  <button className="btn-ghost btn-sm p-0.5 text-on-surface-muted">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-semibold text-on-surface">{cat.name}</span>
                    <span className="text-2xs text-on-surface-muted bg-surface-container-high px-2 py-0.5 rounded-full">
                      {items.length} plato{items.length !== 1 ? 's' : ''}
                    </span>
                    {!cat.isActive && <span className="badge-error text-[10px]">Inactiva</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEditCat(cat) }}
                      className="btn-ghost btn-sm p-1.5 text-on-surface-muted hover:text-on-surface">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'cat', id: cat.id, name: cat.name }) }}
                      className="btn-ghost btn-sm p-1.5 text-on-surface-muted hover:text-error">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-on-surface-muted/10">
                    {items.length > 0 ? (
                      <div className="divide-y divide-on-surface-muted/5">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 pl-11 hover:bg-surface-container-hover transition-colors group">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-alt border border-border shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.querySelector('div')!.style.display = 'flex' }} />
                              ) : (
                                <ImageOff className="w-4 h-4 text-on-surface-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-on-surface truncate">{item.name}</span>
                                {!item.available && <span className="badge-error text-[9px]">Agotado</span>}
                              </div>
                              {item.description && (
                                <p className="text-xs text-on-surface-muted truncate">{item.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm shrink-0">
                              <span className="font-semibold text-success">${Number(item.price).toFixed(2)}</span>
                              {item.cost != null && (
                                <span className="text-xs text-on-surface-muted">C: ${Number(item.cost).toFixed(2)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditItem(item)}
                                className="btn-ghost btn-sm p-1.5 text-on-surface-muted hover:text-on-surface">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                                className="btn-ghost btn-sm p-1.5 text-on-surface-muted hover:text-error">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 pl-11">
                        <p className="text-xs text-on-surface-muted">Sin platos en esta categoría</p>
                      </div>
                    )}
                    <div className="border-t border-on-surface-muted/5 px-4 py-2">
                      <button onClick={() => openNewItem(cat.id)}
                        className="btn-ghost btn-xs text-on-surface-muted hover:text-primary gap-1">
                        <Plus className="w-3 h-3" /> Añadir plato
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState title="Menú vacío" message="Crea tu primera categoría y comienza a agregar platos"
          action={<button onClick={openNewCat} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Nueva Categoría</button>} />
      )}

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => { setCatModal(false); setEditingCat(null) }}
        title={editingCat ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="space-y-4">
          <FormField label="Nombre" registration={catForm.register('name', { required: true })}
            error={catForm.formState.errors.name ? 'Requerido' : undefined} />
          <FormField label="Orden" type="number" registration={catForm.register('sortOrder')} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setCatModal(false); setEditingCat(null) }}
              className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={createCat.isPending || updateCat.isPending}>
              {createCat.isPending || updateCat.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal open={itemModal} onClose={() => { setItemModal(false); setEditingItem(null) }}
        title={editingItem ? 'Editar Plato' : 'Nuevo Plato'} size="lg">
        <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
          <input type="hidden" {...itemForm.register('categoryId')} />
          <FormField label="Nombre" registration={itemForm.register('name', { required: true })}
            error={itemForm.formState.errors.name ? 'Requerido' : undefined} />
          <FormField label="Descripción" type="textarea" registration={itemForm.register('description')} placeholder="Descripción del plato..." />
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Precio" type="number" registration={itemForm.register('price', { required: true, min: 0.01 })}
              error={itemForm.formState.errors.price ? 'Debe ser > 0' : undefined} />
            <FormField label="Costo" type="number" registration={itemForm.register('cost')} />
            <FormField label="Orden" type="number" registration={itemForm.register('sortOrder')} />
          </div>
          <FormField label="Disponible" type="select" registration={itemForm.register('available')}
            options={[{ value: 'true', label: 'Disponible' }, { value: 'false', label: 'Agotado' }]} />
          {editingItem && (
            <ImageUpload
              currentUrl={editingItem.imageUrl}
              entityType="menu-item"
              entityId={editingItem.id}
              onUploaded={(url) => setEditingItem({ ...editingItem, imageUrl: url })}
              onRemoved={() => setEditingItem({ ...editingItem, imageUrl: null })}
            />
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setItemModal(false); setEditingItem(null) }}
              className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={createItem.isPending || updateItem.isPending}>
              {createItem.isPending || updateItem.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (deleteTarget?.type === 'cat') deleteCat.mutate()
          else if (deleteTarget?.type === 'item') deleteItem.mutate()
        }}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.type === 'cat' ? 'Eliminar Categoría' : 'Eliminar Plato'}
        message={
          deleteTarget?.type === 'cat'
            ? `¿Eliminar la categoría "${deleteTarget?.name}"? Solo se eliminará si no contiene platos.`
            : `¿Eliminar el plato "${deleteTarget?.name}"? Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
