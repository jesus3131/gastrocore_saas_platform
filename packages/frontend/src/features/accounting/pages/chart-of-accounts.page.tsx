import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, LoadingSkeleton, EmptyState, ErrorState } from '../../../shared/components/ui'
import { Plus, Edit3, Trash2, ChevronDown, ChevronRight, FolderOpen, FileText } from 'lucide-react'

const typeColors: Record<string, string> = {
  asset: 'text-blue-600 bg-blue-50',
  liability: 'text-orange-600 bg-orange-50',
  equity: 'text-green-600 bg-green-50',
  income: 'text-emerald-600 bg-emerald-50',
  expense: 'text-red-600 bg-red-50',
}

const typeLabels: Record<string, string> = {
  asset: 'Activo', liability: 'Pasivo', equity: 'Capital',
  income: 'Ingreso', expense: 'Gasto',
}

function AccountRow({ account, depth }: { account: any; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = account.children?.length > 0
  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-container text-sm group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button onClick={() => setExpanded(!expanded)} className="w-4 h-4 flex items-center justify-center">
          {hasChildren ? (expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : <span className="w-3 h-3" />}
        </button>
        {hasChildren ? <FolderOpen className="w-3.5 h-3.5 text-on-surface-muted" /> : <FileText className="w-3.5 h-3.5 text-on-surface-muted" />}
        <span className="text-xs text-on-surface-muted font-mono">{account.code}</span>
        <span className="flex-1 text-on-surface font-medium truncate">{account.name}</span>
        <span className={`text-2xs px-1.5 py-0.5 rounded ${typeColors[account.type] || ''}`}>{typeLabels[account.type] || account.type}</span>
      </div>
      {expanded && hasChildren && account.children.map((child: any) => (
        <AccountRow key={child.id} account={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function ChartOfAccountsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', type: 'asset' as string, subtype: '', parentId: '' })

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: () => api.get('/accounting/accounts').then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/accounting/accounts', data),
    onSuccess: () => { toast.success('Cuenta creada'); setShowForm(false); setForm({ code: '', name: '', type: 'asset', subtype: '', parentId: '' }); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounting/accounts/${id}`),
    onSuccess: () => { toast.success('Cuenta eliminada'); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...form, parentId: form.parentId || undefined })
  }

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message="No se pudieron cargar las cuentas" />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-on-surface">Plan de Cuentas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Nueva Cuenta</button>
      </div>

      <div className="card divide-y divide-on-surface-muted/5">
        {accounts?.length === 0 ? (
          <EmptyState title="Sin cuentas" message="Crea el plan de cuentas o importa una plantilla" />
        ) : (
          accounts?.map((acc: any) => <AccountRow key={acc.id} account={acc} depth={0} />)
        )}
      </div>

      {showForm && (
        <Modal open={showForm} title={editId ? 'Editar Cuenta' : 'Nueva Cuenta'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Código</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input text-sm" placeholder="Ej: 1101" required />
            </div>
            <div>
              <label className="label">Nombre</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm" placeholder="Ej: Caja y Bancos" required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subtipo</label>
              <input value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })} className="input text-sm" placeholder="Ej: current_asset" />
            </div>
            <div>
              <label className="label">Cuenta Padre (opcional)</label>
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="input text-sm">
                <option value="">— Sin padre (raíz) —</option>
                {accounts?.filter((a: any) => !a.parentId).map((a: any) => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
