import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

const statusColors: Record<string, string> = {
  available: 'border-success bg-success/5 text-success',
  occupied: 'border-error bg-error/5 text-error',
  reserved: 'border-warning bg-warning/5 text-warning',
  closed: 'border-on-surface-muted/30 bg-surface-container text-on-surface-muted',
}

export function TableMapPage() {
  const { data: branches } = useQuery({
    queryKey: ['pos', 'tables'],
    queryFn: () => api.get('/pos/tables').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Mapa de Mesas</h1>

      {branches?.map((branch: any) => (
        <div key={branch.id}>
          <h2 className="text-sm font-semibold text-on-surface mb-3">{branch.name}</h2>
          <div className="space-y-4">
            {branch.areas?.map((area: any) => (
              <div key={area.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{area.name}</h3>
                  <span className="badge-neutral text-xs">{area.type}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {area.tables?.map((table: any) => (
                    <div
                      key={table.id}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[table.status] || statusColors.available}`}
                    >
                      <span className="text-sm font-bold">{table.label}</span>
                      <span className="text-2xs">{table.capacity} pax</span>
                      {table.activeOrder && (
                        <span className="text-2xs font-semibold mt-1">
                          ${Number(table.activeOrder.total).toFixed(0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
