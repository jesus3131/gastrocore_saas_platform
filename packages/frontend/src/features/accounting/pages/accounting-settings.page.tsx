import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { Modal, LoadingSkeleton } from '../../../shared/components/ui'
import { Plus, Lock, Upload, Download, Database, Link2, ExternalLink } from 'lucide-react'

export function AccountingSettingsPage() {
  const queryClient = useQueryClient()
  const [showPeriodForm, setShowPeriodForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [periodForm, setPeriodForm] = useState({ name: '', startDate: '', endDate: '' })

  const { data: periods, isLoading } = useQuery({
    queryKey: ['accounting', 'periods'],
    queryFn: () => api.get('/accounting/periods').then(r => r.data.data),
  })

  const createPeriod = useMutation({
    mutationFn: (data: any) => api.post('/accounting/periods', data),
    onSuccess: () => { toast.success('Período creado'); setShowPeriodForm(false); setPeriodForm({ name: '', startDate: '', endDate: '' }); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const closePeriod = useMutation({
    mutationFn: (periodId: string) => api.post('/accounting/periods/close', { periodId }),
    onSuccess: () => { toast.success('Período cerrado'); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const importAccounts = useMutation({
    mutationFn: (data: any) => api.post('/accounting/accounts/import', data),
    onSuccess: (res: any) => { toast.success(`${res.data.data?.length || 0} cuentas importadas`); setShowImport(false); setImportText(''); queryClient.invalidateQueries({ queryKey: ['accounting'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const handleImport = () => {
    try {
      const accounts = JSON.parse(importText)
      if (!Array.isArray(accounts)) throw new Error('Debe ser un array')
      importAccounts.mutate({ accounts })
    } catch {
      toast.error('JSON inválido. Debe ser un array de cuentas con code, name, type')
    }
  }

  const exportAccountTemplate = () => {
    const template = [
      { code: '1101', name: 'Caja y Bancos', type: 'asset', subtype: 'current_asset' },
      { code: '2101', name: 'IVA por Pagar', type: 'liability', subtype: 'current_liability' },
      { code: '3101', name: 'Capital Social', type: 'equity', subtype: '' },
      { code: '4101', name: 'Ingresos por Ventas', type: 'income', subtype: 'operating_revenue' },
      { code: '5101', name: 'Costo de Ventas', type: 'expense', subtype: 'cost_of_sales' },
      { code: '5201', name: 'Gastos de Nómina', type: 'expense', subtype: 'operating_expense' },
    ]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'plantilla-cuentas.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const odataUrl = `${window.location.origin}/api/v1/accounting/odata`

  if (isLoading) return <LoadingSkeleton rows={6} />

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-lg font-bold text-on-surface">Configuración Contable</h1>

      {/* Periods */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2"><Database className="w-4 h-4" /> Períodos Contables</h2>
          <button onClick={() => setShowPeriodForm(true)} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Nuevo Período</button>
        </div>
        <div className="space-y-2">
          {periods?.length === 0 && <p className="text-sm text-on-surface-muted">Crea un período contable para comenzar</p>}
          {periods?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container">
              <div>
                <p className="text-sm font-semibold text-on-surface">{p.name}</p>
                <p className="text-xs text-on-surface-muted">{new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.isClosed ? (
                  <span className="text-xs text-on-surface-muted flex items-center gap-1"><Lock className="w-3 h-3" /> Cerrado</span>
                ) : (
                  <button onClick={() => closePeriod.mutate(p.id)} className="btn-secondary btn-xs text-xs">
                    <Lock className="w-3 h-3" /> Cerrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import / Export */}
      <div className="card">
        <h2 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Importar / Exportar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => setShowImport(true)} className="p-4 rounded-xl border border-on-surface-muted/10 hover:border-primary/30 text-left transition-all">
            <Upload className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold text-on-surface">Importar Cuentas</p>
            <p className="text-xs text-on-surface-muted">Carga masiva de cuentas contables vía JSON</p>
          </button>
          <button onClick={exportAccountTemplate} className="p-4 rounded-xl border border-on-surface-muted/10 hover:border-primary/30 text-left transition-all">
            <Download className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-semibold text-on-surface">Descargar Plantilla</p>
            <p className="text-xs text-on-surface-muted">Ejemplo JSON para importar cuentas contables</p>
          </button>
        </div>
      </div>

      {/* OData / Power BI */}
      <div className="card">
        <h2 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><Link2 className="w-4 h-4" /> Conector Power BI (OData)</h2>
        <div className="p-4 rounded-lg bg-surface-container space-y-2">
          <p className="text-xs text-on-surface-muted">Usa el siguiente endpoint para conectar Power BI directamente:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-surface p-2 rounded border break-all">{odataUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(odataUrl); toast.success('URL copiada') }} className="btn-secondary btn-xs">
              <ExternalLink className="w-3 h-3" /> Copiar
            </button>
          </div>
          <p className="text-xs text-on-surface-muted mt-2">
            Entidades disponibles: <code>accounts</code>, <code>journalEntries</code>, <code>trialBalance</code>
          </p>
        </div>
      </div>

      {/* Period Form Modal */}
      {showPeriodForm && (
        <Modal open={showPeriodForm} title="Nuevo Período Contable" onClose={() => setShowPeriodForm(false)}>
          <form onSubmit={(e) => { e.preventDefault(); createPeriod.mutate(periodForm) }} className="space-y-3">
            <div>
              <label className="label">Nombre</label>
              <input value={periodForm.name} onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })} className="input text-sm" placeholder="Ej: Enero 2026" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fecha Inicio</label>
                <input type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} className="input text-sm" required />
              </div>
              <div>
                <label className="label">Fecha Fin</label>
                <input type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} className="input text-sm" required />
              </div>
            </div>
            <button type="submit" disabled={createPeriod.isPending} className="btn-primary w-full">Crear Período</button>
          </form>
        </Modal>
      )}

      {/* Import Modal */}
      {showImport && (
        <Modal open={showImport} title="Importar Cuentas (JSON)" onClose={() => setShowImport(false)} size="lg">
          <div className="space-y-3">
            <p className="text-xs text-on-surface-muted">Pega un array JSON con la estructura: {'{'} code, name, type, subtype?, parentCode? {'}'}</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="input min-h-[200px] font-mono text-xs resize-none"
              placeholder='[{ "code": "1101", "name": "Caja", "type": "asset" }]'
            />
            <div className="flex gap-2">
              <button onClick={handleImport} disabled={importAccounts.isPending || !importText} className="btn-primary flex-1">
                {importAccounts.isPending ? 'Importando...' : 'Importar'}
              </button>
              <button onClick={() => setShowImport(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
