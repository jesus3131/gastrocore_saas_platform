import { useQuery } from '@tanstack/react-query'
import { Gift, Star } from 'lucide-react'
import { api } from '../../../lib/api'

export function LoyaltyPage() {
  const { data: program } = useQuery({
    queryKey: ['crm', 'loyalty'],
    queryFn: () => api.get('/crm/loyalty').then((r) => r.data.data),
  })

  const { data: rewards } = useQuery({
    queryKey: ['crm', 'rewards'],
    queryFn: () => api.get('/crm/rewards').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Programa de Fidelización</h1>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{program?.name || 'Programa'} </h3>
          <Gift className="w-4 h-4 text-on-surface-muted" />
        </div>
        <p className="text-xs text-on-surface-muted mb-4">
          {program?.pointsPerUnit} puntos por cada unidad monetaria gastada
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(program?.tiers || []).map((tier: any) => (
            <div key={tier.name} className="p-3 rounded-lg border border-on-surface-muted/10 text-center">
              <Star className="w-5 h-5 mx-auto mb-1" style={{ color: tier.color }} />
              <p className="text-sm font-semibold">{tier.name}</p>
              <p className="text-xs text-on-surface-muted">{tier.minPoints} pts mín</p>
              <p className="text-xs font-medium text-success">{(tier.discount * 100).toFixed(0)}% desc</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Canjes Recientes</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Cliente</th><th>Recompensa</th><th>Puntos</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {rewards?.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.customer?.name}</td>
                  <td>{r.reward}</td>
                  <td>{r.points}</td>
                  <td className="text-on-surface-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
