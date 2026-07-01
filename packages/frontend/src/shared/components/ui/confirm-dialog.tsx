import { AlertTriangle } from 'lucide-react'
import { Modal } from './modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const btnClass =
    variant === 'danger'
      ? 'btn-danger'
      : variant === 'warning'
      ? 'bg-warning text-white hover:bg-amber-600'
      : 'btn-primary'

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-error/10' : variant === 'warning' ? 'bg-warning/10' : 'bg-info/10'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            variant === 'danger' ? 'text-error' : variant === 'warning' ? 'text-warning' : 'text-info'
          }`} />
        </div>
        <h3 className="text-base font-semibold text-on-surface">{title}</h3>
        <p className="text-sm text-on-surface-muted">{message}</p>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`${btnClass} flex-1`} disabled={loading}>
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
