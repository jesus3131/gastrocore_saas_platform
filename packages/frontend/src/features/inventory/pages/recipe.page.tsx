import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, FormField, EmptyState, ErrorState, MetricCard } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Scale, ChefHat } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface RecipeIngredient {
  id: string
  quantity: number
  ingredient: {
    id: string
    name: string
    unit: string
    unitCost: number
  }
}

interface Recipe {
  id: string
  name: string
  servings: number
  wastePercentage: number
  instructions?: string
  menuItemId?: string
  menuItem?: { id: string; name: string; price: number }
  ingredients: RecipeIngredient[]
}

export function RecipePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [ingredientLines, setIngredientLines] = useState<{ ingredientId: string; quantity: number }[]>([])
  const [editing, setEditing] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>()

  const { data: recipes, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', 'recipes'],
    queryFn: () => api.get('/inventory/recipes').then((r) => r.data.data),
  })

  const { data: ingredients } = useQuery({
    queryKey: ['inventory', 'ingredients'],
    queryFn: () => api.get('/inventory/ingredients').then((r) => r.data.data),
  })

  const { data: menu } = useQuery({
    queryKey: ['pos', 'menu'],
    queryFn: () => api.get('/pos/menu').then((r) => r.data.data),
  })

  const createRecipe = useMutation({
    mutationFn: (data: any) => api.post('/inventory/recipes', {
      ...data,
      ingredients: ingredientLines.filter((l) => l.ingredientId && l.quantity > 0),
    }),
    onSuccess: () => {
      toast.success('Receta creada exitosamente')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      closeModal()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const updateRecipe = useMutation({
    mutationFn: (data: any) => api.put(`/inventory/recipes/${selectedRecipe!.id}`, {
      ...data,
      ingredients: ingredientLines.filter((l) => l.ingredientId && l.quantity > 0),
    }),
    onSuccess: () => {
      toast.success('Receta actualizada exitosamente')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      closeModal()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const closeModal = () => {
    setModalOpen(false)
    setSelectedRecipe(null)
    setIngredientLines([])
    setEditing(false)
    reset()
  }

  const openCreate = () => {
    setSelectedRecipe(null)
    setEditing(true)
    setIngredientLines([{ ingredientId: '', quantity: 0 }])
    reset({ name: '', menuItemId: '', servings: 1, wastePercentage: 0, instructions: '' })
    setModalOpen(true)
  }

  const openEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setEditing(true)
    const lines = recipe.ingredients?.map((ri) => ({
      ingredientId: ri.ingredient.id,
      quantity: Number(ri.quantity),
    })) || [{ ingredientId: '', quantity: 0 }]
    setIngredientLines(lines)
    reset({
      name: recipe.name,
      menuItemId: recipe.menuItem?.id || recipe.menuItemId || '',
      servings: recipe.servings,
      wastePercentage: recipe.wastePercentage,
      instructions: recipe.instructions || '',
    })
    setModalOpen(true)
  }

  const openDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setEditing(false)
    reset()
    setModalOpen(true)
  }

  const addIngredientLine = () => {
    setIngredientLines([...ingredientLines, { ingredientId: '', quantity: 0 }])
  }

  const removeIngredientLine = (idx: number) => {
    setIngredientLines(ingredientLines.filter((_, i) => i !== idx))
  }

  const updateIngredientLine = (idx: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const updated = [...ingredientLines]
    updated[idx] = { ...updated[idx], [field]: value }
    setIngredientLines(updated)
  }

  const onSubmit = (data: any) => {
    if (selectedRecipe) {
      updateRecipe.mutate(data)
    } else {
      createRecipe.mutate(data)
    }
  }

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar recetas" onRetry={refetch} />

  const allMenuItems = menu?.flatMap((cat: any) => cat.menuItems || []) || []
  const avgFoodCost = recipes?.length
    ? recipes.reduce((s: number, r: Recipe) => {
        const cost = r.ingredients?.reduce((sum: number, ri: RecipeIngredient) =>
          sum + Number(ri.ingredient.unitCost) * Number(ri.quantity), 0) || 0
        return s + cost
      }, 0) / recipes.length
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Escandallos (Recetas)</h1>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Recetas" value={recipes?.length || 0} icon={ChefHat} color="text-primary bg-primary/10" />
        <MetricCard label="Costo Promedio" value={`$${avgFoodCost.toFixed(2)}`} icon={TrendingDown} color="text-warning bg-warning/10" />
        <MetricCard label="Ingredientes" value={ingredients?.length || 0} icon={Scale} color="text-info bg-info/10" />
        <MetricCard label="Items Menú" value={allMenuItems.length} icon={DollarSign} color="text-success bg-success/10" />
      </div>

      {recipes?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recipes.map((recipe: Recipe) => {
            const totalCost = recipe.ingredients?.reduce(
              (sum: number, ri: RecipeIngredient) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity), 0
            ) || 0
            const suggestedPrice = totalCost * 3.5
            const profitMargin = suggestedPrice > 0 ? ((suggestedPrice - totalCost) / suggestedPrice) * 100 : 0
            const marginColor = profitMargin > 60 ? 'text-success' : profitMargin > 40 ? 'text-warning' : 'text-error'

            return (
              <div key={recipe.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 cursor-pointer" onClick={() => openDetail(recipe)}>
                    <h3 className="font-semibold text-on-surface">{recipe.name}</h3>
                    <p className="text-2xs text-on-surface-muted">
                      {recipe.servings} porcione{recipe.servings !== 1 ? 's' : ''}
                      {recipe.menuItem && ` · ${recipe.menuItem.name}`}
                      {recipe.wastePercentage > 0 && ` · ${recipe.wastePercentage}% merma`}
                    </p>
                  </div>
                  <button onClick={() => openEdit(recipe)} className="btn-ghost btn-sm p-1" title="Editar receta">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 mb-4">
                  {recipe.ingredients?.map((ri: RecipeIngredient) => {
                    const lineCost = Number(ri.ingredient.unitCost) * Number(ri.quantity)
                    const pct = totalCost > 0 ? (lineCost / totalCost) * 100 : 0
                    return (
                      <div key={ri.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-surface-container/50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-on-surface">{ri.ingredient.name}</span>
                          <span className="text-on-surface-muted">
                            {Number(ri.quantity).toFixed(2)} {ri.ingredient.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${lineCost.toFixed(2)}</span>
                          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-2xs text-on-surface-muted w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {recipe.instructions && (
                  <p className="text-2xs text-on-surface-muted italic mb-2 line-clamp-2">{recipe.instructions}</p>
                )}

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-on-surface-muted/10 text-center">
                  <div>
                    <p className="text-2xs text-on-surface-muted">Costo</p>
                    <p className="text-sm font-bold text-on-surface">${totalCost.toFixed(2)}</p>
                  </div>
                  <div className="border-x border-on-surface-muted/10">
                    <p className="text-2xs text-on-surface-muted">Precio Sug.</p>
                    <p className="text-sm font-bold text-primary">${suggestedPrice.toFixed(2)}</p>
                  </div>
                  <div className="border-r border-on-surface-muted/10">
                    <p className="text-2xs text-on-surface-muted">Margen</p>
                    <p className={`text-sm font-bold ${marginColor}`}>{profitMargin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-2xs text-on-surface-muted">Precio Menú</p>
                    <p className="text-sm font-bold text-on-surface">
                      ${Number(recipe.menuItem?.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Sin recetas"
          message="Crea tu primera receta seleccionando ingredientes y sus cantidades exactas para calcular costos."
          action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Nueva Receta</button>}
        />
      )}

      <Modal open={modalOpen} onClose={closeModal} title={selectedRecipe ? (editing ? `Editar: ${selectedRecipe.name}` : selectedRecipe.name) : 'Nueva Receta'} size={editing ? 'lg' : 'xl'}>
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Nombre de la Receta" registration={register('name', { required: true })} error={errors.name ? 'Requerido' : undefined} placeholder="Ej: Hamburguesa Clásica" />

            <FormField label="Vincular a producto del Menú" type="select" registration={register('menuItemId')} options={[
              { value: '', label: 'Sin vínculo (solo receta)' },
              ...allMenuItems.map((mi: any) => ({ value: mi.id, label: `${mi.name} - $${Number(mi.price).toFixed(2)}` })),
            ]} />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Porciones" type="number" registration={register('servings')} />
              <FormField label="% Merma" type="number" registration={register('wastePercentage')} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Ingredientes y Cantidades</label>
                <button type="button" onClick={addIngredientLine} className="btn-ghost btn-sm text-xs">
                  <Plus className="w-3 h-3" /> Agregar Ingrediente
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ingredientLines.map((line, idx) => {
                  const ing = ingredients?.find((i: any) => i.id === line.ingredientId)
                  const lineCost = ing ? Number(ing.unitCost) * Number(line.quantity) : 0
                  return (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container/50">
                      <select
                        value={line.ingredientId}
                        onChange={(e) => updateIngredientLine(idx, 'ingredientId', e.target.value)}
                        className="select text-xs flex-1"
                      >
                        <option value="">Seleccionar ingrediente...</option>
                        {ingredients?.map((ing: any) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (${Number(ing.unitCost).toFixed(2)}/{ing.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.quantity || ''}
                        onChange={(e) => updateIngredientLine(idx, 'quantity', Number(e.target.value))}
                        className="input text-xs w-20 text-center"
                        placeholder="Cant."
                      />
                      {ing && <span className="text-2xs text-on-surface-muted w-8">{ing.unit}</span>}
                      <span className="text-xs font-medium w-16 text-right">${lineCost.toFixed(2)}</span>
                      {ingredientLines.length > 1 && (
                        <button type="button" onClick={() => removeIngredientLine(idx)} className="btn-ghost btn-sm p-1 text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {ingredientLines.length > 0 && (
                <div className="mt-2 text-xs text-on-surface-muted text-right">
                  Costo ingredientes: <span className="font-bold text-on-surface">
                    ${ingredientLines.reduce((s, l) => {
                      const ing = ingredients?.find((i: any) => i.id === l.ingredientId)
                      return s + (ing ? Number(ing.unitCost) * Number(l.quantity) : 0)
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <FormField label="Instrucciones de Preparación" type="textarea" registration={register('instructions')} placeholder="Describe el proceso de preparación..." />

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={createRecipe.isPending || updateRecipe.isPending}>
                {(createRecipe.isPending || updateRecipe.isPending) ? 'Guardando...' : selectedRecipe ? 'Actualizar Receta' : 'Crear Receta'}
              </button>
            </div>
          </form>
        ) : selectedRecipe ? (
          <RecipeDetail recipe={selectedRecipe} ingredients={ingredients || []} onEdit={() => openEdit(selectedRecipe)} />
        ) : null}
      </Modal>
    </div>
  )
}

function RecipeDetail({ recipe, ingredients, onEdit }: { recipe: Recipe; ingredients: any[]; onEdit: () => void }) {
  const totalCost = recipe.ingredients?.reduce(
    (sum: number, ri: RecipeIngredient) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity), 0
  ) || 0
  const suggestedPrice = totalCost * 3.5
  const profitMargin = suggestedPrice > 0 ? ((suggestedPrice - totalCost) / suggestedPrice) * 100 : 0
  const marginColor = profitMargin > 60 ? 'text-success' : profitMargin > 40 ? 'text-warning' : 'text-error'
  const menuPrice = Number(recipe.menuItem?.price || 0)
  const actualMargin = menuPrice > 0 ? ((menuPrice - totalCost) / menuPrice) * 100 : 0

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={onEdit} className="btn-primary btn-sm">
          <Edit className="w-3.5 h-3.5" /> Editar Receta
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-surface-container text-center">
          <p className="text-2xs text-on-surface-muted">Costo Total</p>
          <p className="text-xl font-bold text-on-surface">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 text-center">
          <p className="text-2xs text-on-surface-muted">Precio Sugerido (×3.5)</p>
          <p className="text-xl font-bold text-primary">${suggestedPrice.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-surface-container text-center">
          <p className="text-2xs text-on-surface-muted">Margen Sugerido</p>
          <p className={`text-xl font-bold ${marginColor}`}>{profitMargin.toFixed(1)}%</p>
        </div>
        <div className={`p-3 rounded-lg text-center ${menuPrice > 0 ? 'bg-success/5' : 'bg-surface-container'}`}>
          <p className="text-2xs text-on-surface-muted">Precio en Menú</p>
          <p className="text-xl font-bold text-on-surface">${menuPrice.toFixed(2)}</p>
          {menuPrice > 0 && (
            <p className={`text-xs font-medium ${actualMargin > 50 ? 'text-success' : actualMargin > 30 ? 'text-warning' : 'text-error'}`}>
              {actualMargin.toFixed(1)}% margen real
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-2">
          <Scale className="w-3.5 h-3.5" />
          Desglose de Ingredientes
        </h4>
        <div className="space-y-1">
          {recipe.ingredients?.map((ri: RecipeIngredient) => {
            const lineCost = Number(ri.ingredient.unitCost) * Number(ri.quantity)
            const pct = totalCost > 0 ? (lineCost / totalCost) * 100 : 0
            return (
              <div key={ri.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <span className="font-medium text-on-surface">{ri.ingredient.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-on-surface-muted w-20 text-right">
                    {Number(ri.quantity).toFixed(2)} {ri.ingredient.unit}
                  </span>
                  <span className="text-on-surface-muted w-12 text-right">
                    @ ${Number(ri.ingredient.unitCost).toFixed(2)}
                  </span>
                  <span className="font-semibold w-16 text-right">${lineCost.toFixed(2)}</span>
                  <div className="flex items-center gap-1.5 w-16">
                    <div className="w-10 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-2xs text-on-surface-muted w-8 text-right">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {recipe.instructions && (
        <div>
          <h4 className="text-xs font-semibold text-on-surface mb-1">Instrucciones</h4>
          <p className="text-xs text-on-surface-muted whitespace-pre-wrap">{recipe.instructions}</p>
        </div>
      )}

      <div className="pt-3 border-t border-on-surface-muted/10">
        <p className="text-2xs text-on-surface-muted">
          {recipe.servings} porcione{recipe.servings !== 1 ? 's' : ''}
          {recipe.wastePercentage > 0 && ` · ${recipe.wastePercentage}% de merma`}
        </p>
      </div>
    </div>
  )
}
