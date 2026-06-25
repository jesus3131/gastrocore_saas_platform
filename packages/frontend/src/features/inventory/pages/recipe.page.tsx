import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function RecipePage() {
  const { data: recipes } = useQuery({
    queryKey: ['inventory', 'recipes'],
    queryFn: () => api.get('/inventory/recipes').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Escandallos (Recetas)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recipes?.map((recipe: any) => {
          const totalCost = recipe.ingredients?.reduce(
            (sum: number, ri: any) => sum + Number(ri.ingredient.unitCost) * Number(ri.quantity), 0
          ) || 0
          const suggestedPrice = totalCost * 3.5
          const profitMargin = suggestedPrice > 0 ? ((suggestedPrice - totalCost) / suggestedPrice) * 100 : 0

          return (
            <div key={recipe.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-on-surface">{recipe.name}</h3>
                <span className="text-xs text-on-surface-muted">{recipe.menuItem?.name}</span>
              </div>

              <div className="space-y-1 mb-3">
                {recipe.ingredients?.map((ri: any) => (
                  <div key={ri.id} className="flex justify-between text-xs text-on-surface-muted">
                    <span>{ri.ingredient.name}</span>
                    <span>{Number(ri.quantity).toFixed(2)} {ri.ingredient.unit}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-on-surface-muted/10 text-center">
                <div>
                  <p className="text-2xs text-on-surface-muted">Costo</p>
                  <p className="text-sm font-semibold text-on-surface">${totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-2xs text-on-surface-muted">Precio Sug.</p>
                  <p className="text-sm font-semibold text-primary">${suggestedPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-2xs text-on-surface-muted">Margen</p>
                  <p className={`text-sm font-semibold ${profitMargin > 50 ? 'text-success' : 'text-warning'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
