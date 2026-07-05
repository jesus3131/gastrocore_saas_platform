import { useState, useRef } from 'react'
import { Upload, X, ImageOff } from 'lucide-react'

interface ImageUploadProps {
  currentUrl?: string | null
  entityType: 'menu-item' | 'ingredient'
  entityId: string
  onUploaded: (url: string) => void
  onRemoved: () => void
}

export function ImageUpload({ currentUrl, entityType, entityId, onUploaded, onRemoved }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)

      const res = await fetch('/api/v1/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        onUploaded(data.data.url)
      }
    } catch {
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await fetch(`/api/v1/images/${entityType}/${entityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setPreview(null)
      onRemoved()
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = preview || currentUrl

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-on-surface">Imagen</label>
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-alt border border-border shrink-0">
          {displayUrl ? (
            <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-muted">
              <ImageOff className="w-6 h-6" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost btn-xs" disabled={uploading}>
            <Upload className="w-3 h-3" /> Subir imagen
          </button>
          {currentUrl && (
            <button type="button" onClick={handleRemove} className="btn-ghost btn-xs text-error" disabled={uploading}>
              <X className="w-3 h-3" /> Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
