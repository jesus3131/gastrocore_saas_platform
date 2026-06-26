import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, LoadingSkeleton, EmptyState, ErrorState, DataTable } from '../../../shared/components/ui'
import { Plus, Send, Trash2, CheckCircle, Clock } from 'lucide-react'

export function JournalEntriesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    status: 'draft',
    lines: [{ accountId: '', debit: '', credit: '', description: '' }],
  })

  const { data, isLoading } = useQuery({
    queryKey: ['accounting', 'journal-entries', page],
    queryFn: () => api.get('/accounting/journal-entries', { params: { limit: 20, offset: page * 20 } }).then(r => r.data.data),
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounting', 'accounts', 'flat'],
    queryFn: () => api.get('/accounting/accounts').then(r => {
      const flatten = (items: any[]): any[] => items.flatMap((i: any) => [i, ...flatten(i.children || [])])
      return flatten(r.data.data)
    }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/accounting/journal-entries', data),
    onSuccess: () => { toast.success('Asiento creado'); setShowForm(false); resetForm(); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const postMutation = useMutation({
    mutationFn: (id: string) => api.post(`/accounting/journal-entries/${id}/post`),
    onSuccess: () => { toast.success('Asiento contabilizado'); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounting/journal-entries/${id}`),
    onSuccess: () => { toast.success('Asiento eliminado'); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const resetForm = () => setForm({
    entryDate: new Date().toISOString().split('T')[0],
    description: '', reference: '', status: 'draft',
    lines: [{ accountId: '', debit: '', credit: '', description: '' }],
  })

  const addLine = () => setForm({ ...form, lines: [...form.lines, { accountId: '', debit: '', credit: '', description: '' }] })

  const updateLine = (idx: number, field: string, value: any) => {
    const lines = form.lines.map((l: any, i: number) => i === idx ? { ...l, [field]: value } : l)
    setForm({ ...form, lines })
  }

  const removeLine = (idx: number) => {
    if (form.lines.length <= 2) return
    setForm({ ...form, lines: form.lines.filter((_: any, i: number) => i !== idx) })
  }

  const totalDebit = form.lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0)
  const totalCredit = form.lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!balanced) return toast.error('Debe y Haber no cuadran')
    createMutation.mutate({
      ...form,
      entryDate: form.entryDate,
      lines: form.lines.map((l: any) => ({
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description,
      })),
    })
  }

  if (isLoading) return <LoadingSkeleton rows={6} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-on-surface">Asientos Contables</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Nuevo Asiento</button>
      </div>

      {data?.entries?.length === 0 ? (
        <EmptyState title="Sin asientos" message="Crea asientos manuales o automáticos desde las ventas POS" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-on-surface-muted">
                <th className="pb-2 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Descripción</th>
                <th className="pb-2 font-medium">Referencia</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium text-right">Debe</th>
                <th className="pb-2 font-medium text-right">Haber</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {data?.entries?.map((entry: any) => {
                const d = entry.lines?.reduce((s: number, l: any) => s + Number(l.debit), 0) || 0
                const c = entry.lines?.reduce((s: number, l: any) => s + Number(l.credit), 0) || 0
                return (
                  <tr key={entry.id} className="border-b border-on-surface-muted/5 hover:bg-surface-container/50">
                    <td className="py-2 text-xs text-on-surface-muted">{new Date(entry.entryDate).toLocaleDateString()}</td>
                    <td className="py-2 font-medium text-on-surface max-w-[200px] truncate">{entry.description}</td>
                    <td className="py-2 text-xs text-on-surface-muted">{entry.reference || '—'}</td>
                    <td className="py-2"><span className={`text-2xs px-1.5 py-0.5 rounded ${entry.entryType === 'automatic' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-muted'}`}>{entry.entryType === 'automatic' ? 'Auto' : 'Manual'}</span></td>
                    <td className="py-2">{entry.status === 'posted' ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle className="w-3 h-3" /> Contabilizado</span> : <span className="flex items-center gap-1 text-xs text-warning"><Clock className="w-3 h-3" /> Borrador</span>}</td>
                    <td className="py-2 text-right font-mono text-xs tabular-nums">${d.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-xs tabular-nums">${c.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.status === 'draft' && (
                          <>
                            <button onClick={() => postMutation.mutate(entry.id)} className="btn-ghost btn-xs p-1 text-success" title="Contabilizar"><Send className="w-3 h-3" /></button>
                            <button onClick={() => deleteMutation.mutate(entry.id)} className="btn-ghost btn-xs p-1 text-error" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between pt-3 text-xs text-on-surface-muted">
            <span>{data?.total || 0} asientos</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-ghost btn-xs">Anterior</button>
              <button disabled={(data?.entries?.length || 0) < 20} onClick={() => setPage(p => p + 1)} className="btn-ghost btn-xs">Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showForm && (
        <Modal open={showForm} title="Nuevo Asiento Contable" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fecha</label>
                <input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className="input text-sm" required />
              </div>
              <div>
                <label className="label">Referencia</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input text-sm" placeholder="Opcional" />
              </div>
            </div>
            <div>
              <label className="label">Descripción</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input text-sm" placeholder="Ej: Pago a proveedor" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">Líneas (Partida Doble)</label>
                <button type="button" onClick={addLine} className="btn-secondary btn-xs"><Plus className="w-3 h-3" /> Agregar línea</button>
              </div>
              <div className="space-y-2">
                {form.lines.map((line: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-surface-container">
                    <div className="flex-1">
                      <select value={line.accountId} onChange={(e) => updateLine(idx, 'accountId', e.target.value)} className="input text-xs" required>
                        <option value="">Seleccionar cuenta</option>
                        {accounts?.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                    </div>
                    <input value={line.debit} onChange={(e) => updateLine(idx, 'debit', e.target.value)} className="input text-xs w-20 text-right" placeholder="Debe" />
                    <input value={line.credit} onChange={(e) => updateLine(idx, 'credit', e.target.value)} className="input text-xs w-20 text-right" placeholder="Haber" />
                    {form.lines.length > 2 && (
                      <button type="button" onClick={() => removeLine(idx)} className="btn-ghost btn-xs p-1 text-error"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-4 mt-2 text-xs">
                <span>Total Debe: <strong className="tabular-nums">${totalDebit.toFixed(2)}</strong></span>
                <span>Total Haber: <strong className="tabular-nums">${totalCredit.toFixed(2)}</strong></span>
                <span className={balanced ? 'text-success' : 'text-error'}>{balanced ? '✅ Cuadrado' : '❌ No cuadra'}</span>
              </div>
            </div>

            <button type="submit" disabled={createMutation.isPending || !balanced} className="btn-primary w-full">
              {createMutation.isPending ? 'Creando...' : 'Crear Asiento'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
