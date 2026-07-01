import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: string
  trend?: { value: number; label?: string }
  onClick?: () => void
}

export function MetricCard({ label, value, icon: Icon, color = 'text-primary bg-primary/10', trend, onClick }: MetricCardProps) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-muted font-medium">{label}</p>
          <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
              {trend.label && <span className="text-on-surface-muted font-normal">{trend.label}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
