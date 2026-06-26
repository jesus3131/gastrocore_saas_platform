import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
  fullPage?: boolean
}

export function Loading({ text = 'Cargando...', fullPage = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-on-surface-muted">{text}</p>
    </div>
  )

  if (fullPage) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container">{content}</div>
  }

  return content
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-surface-container-high rounded-lg" />
      ))}
    </div>
  )
}
