import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Error al cargar los datos', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-sm font-semibold text-on-surface mb-1">Algo salió mal</h3>
      <p className="text-xs text-on-surface-muted max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm">
          <RefreshCw className="w-3 h-3" /> Reintentar
        </button>
      )}
    </div>
  )
}
