import { useQuery } from '@tanstack/react-query'
import { Gift, Star, Medal, Award, Trophy } from 'lucide-react'
import { api } from '../../../lib/api'
import { MetricCard, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'

const tierIcons: Record<string, any> = { bronze: Medal, silver: Award, gold: Star, platinum: Trophy }

export function LoyaltyPage() {
  const { data: program, isLoading: loadingProgram, error: errorProgram, refetch: refetchProgram } = useQuery({
    queryKey: ['crm', 'loyalty'],
    queryFn: () => api.get('/crm/loyalty').then((r) => r.data.data),
  })

  const { data: rewards, isLoading: loadingRewards } = useQuery({
    queryKey: ['crm', 'rewards'],
    queryFn: () => api.get('/crm/rewards').then((r) => r.data.data),
  })

  if (loadingProgram || loadingRewards) return <LoadingSkeleton rows={6} />
  if (errorProgram) return <ErrorState message="Error al cargar programa de lealtad" onRetry={refetchProgram} />

  const tiers = program?.tiers || []
  const totalPoints = rewards?.reduce((s: number, r: any) => s + r.points, 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Programa de Fidelización</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Puntos Canjeados" value={totalPoints.toLocaleString()} icon={Gift} color="text-primary bg-primary/10" />
        <MetricCard label="Canjes Realizados" value={rewards?.length || 0} icon={Award} color="text-success bg-success/10" />
        <MetricCard label="Niveles Activos" value={tiers.length} icon={Trophy} color="text-warning bg-warning/10" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Programa: {program?.name || 'Fidelización'}</h3>
          <Gift className="w-4 h-4 text-on-surface-muted" />
        </div>
        <p className="text-xs text-on-surface-muted mb-4">
          {program?.pointsPerUnit || 10} puntos por cada unidad monetaria gastada
        </p>
        {tiers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tiers.map((tier: any) => {
              const Icon = tierIcons[tier.name?.toLowerCase()] || Star
              return (
                <div key={tier.name} className="relative p-4 rounded-lg border border-on-surface-muted/10 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: (tier.color || '#F59E0B') + '20' }}>
                    <Icon className="w-6 h-6" style={{ color: tier.color || '#F59E0B' }} />
                  </div>
                  <p className="text-sm font-bold text-on-surface mt-2">{tier.name}</p>
                  <p className="text-2xs text-on-surface-muted">{tier.minPoints} pts mínimo</p>
                  <div className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: (tier.color || '#F59E0B') + '20', color: tier.color || '#F59E0B' }}>
                    {(tier.discount * 100).toFixed(0)}% descuento
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState title="Sin niveles" message="No hay niveles configurados en el programa" />
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Canjes Recientes</h3>
        </div>
        {rewards?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Cliente</th><th>Recompensa</th><th>Puntos</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {rewards.map((r: any) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.customer?.name || '—'}</td>
                    <td>{r.reward || r.description}</td>
                    <td><span className="badge-warning">{r.points} pts</span></td>
                    <td className="text-on-surface-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin canjes" message="No hay canjes registrados aún" />
        )}
      </div>
    </div>
  )
}
