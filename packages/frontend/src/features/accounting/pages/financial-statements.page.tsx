import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { LoadingSkeleton, ErrorState } from '../../../shared/components/ui'
import { FileSpreadsheet, ScrollText, Scale, BookOpen } from 'lucide-react'

const tabs = [
  { id: 'balance', label: 'Balance General', icon: Scale },
  { id: 'pnl', label: 'Pérdidas y Ganancias', icon: FileSpreadsheet },
  { id: 'trial', label: 'Trial Balance', icon: ScrollText },
  { id: 'ledger', label: 'Libro Mayor', icon: BookOpen },
]

export function FinancialStatementsPage() {
  const [activeTab, setActiveTab] = useState('balance')
  const [periodId, setPeriodId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [ledgerAccount, setLedgerAccount] = useState('')
  const [ledgerPage, setLedgerPage] = useState(0)

  const { data: periods } = useQuery({
    queryKey: ['accounting', 'periods'],
    queryFn: () => api.get('/accounting/periods').then(r => r.data.data),
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounting', 'accounts', 'flat2'],
    queryFn: () => api.get('/accounting/accounts').then(r => {
      const flatten = (items: any[]): any[] => items.flatMap((i: any) => [i, ...flatten(i.children || [])])
      return flatten(r.data.data)
    }),
  })

  const { data: bs, isLoading: bsLoading } = useQuery({
    queryKey: ['accounting', 'balance-sheet', periodId],
    queryFn: () => api.get('/accounting/balance-sheet', { params: { periodId: periodId || undefined } }).then(r => r.data.data),
    enabled: activeTab === 'balance',
  })

  const { data: pl, isLoading: plLoading } = useQuery({
    queryKey: ['accounting', 'income-statement', periodId],
    queryFn: () => api.get('/accounting/income-statement', { params: { periodId: periodId || undefined } }).then(r => r.data.data),
    enabled: activeTab === 'pnl',
  })

  const { data: trial, isLoading: tbLoading } = useQuery({
    queryKey: ['accounting', 'trial-balance', periodId],
    queryFn: () => api.get('/accounting/trial-balance', { params: { periodId: periodId || undefined } }).then(r => r.data.data),
    enabled: activeTab === 'trial',
  })

  const { data: ledger, isLoading: lgLoading } = useQuery({
    queryKey: ['accounting', 'general-ledger', ledgerAccount, fromDate, toDate, ledgerPage],
    queryFn: () => api.get('/accounting/general-ledger', {
      params: {
        accountId: ledgerAccount || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 50,
        offset: ledgerPage * 50,
      },
    }).then(r => r.data.data),
    enabled: activeTab === 'ledger',
  })

  const isLoading = bsLoading || plLoading || tbLoading || lgLoading

  const formatCurrency = (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  const formatPct = (val: number) => `${(val * 100).toFixed(1)}%`

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-on-surface">Estados Financieros</h1>
        <select value={periodId} onChange={(e) => setPeriodId(e.target.value)} className="input text-sm max-w-xs">
          <option value="">Todos los períodos</option>
          {periods?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} {p.isClosed ? '🔒' : ''}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={8} /> : (
        <>
          {/* ─── Balance Sheet ─── */}
          {activeTab === 'balance' && bs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['asset', 'liability', 'equity'].map(section => (
                <div key={section} className="card">
                  <h2 className="text-sm font-bold text-on-surface capitalize mb-3">{section === 'asset' ? 'Activos' : section === 'liability' ? 'Pasivos' : 'Capital'}</h2>
                  <div className="space-y-1">
                    {bs[section]?.accounts?.length > 0 ? bs[section].accounts.map((a: any) => (
                      <div key={a.code} className="flex justify-between text-xs py-0.5">
                        <span className="text-on-surface-muted">{a.code} {a.name}</span>
                        <span className="font-medium tabular-nums">{formatCurrency(a.balance)}</span>
                      </div>
                    )) : <p className="text-xs text-on-surface-muted">Sin movimientos</p>}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(bs[section]?.total || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── P&L ─── */}
          {activeTab === 'pnl' && pl && (
            <div className="max-w-2xl card space-y-3">
              <h2 className="text-sm font-bold text-on-surface">Estado de Resultados</h2>
              {pl.incomes?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-success mb-1">Ingresos</h3>
                  {pl.incomes.map((i: any) => (
                    <div key={i.code} className="flex justify-between text-sm py-0.5">
                      <span className="text-on-surface-muted">{i.code} {i.name}</span>
                      <span className="tabular-nums">{formatCurrency(i.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold text-success">
                    <span>Total Ingresos</span><span className="tabular-nums">{formatCurrency(pl.totalIncome)}</span>
                  </div>
                </div>
              )}
              {pl.expenses?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-error mb-1">Gastos</h3>
                  {pl.expenses.map((e: any) => (
                    <div key={e.code} className="flex justify-between text-sm py-0.5">
                      <span className="text-on-surface-muted">{e.code} {e.name}</span>
                      <span className="tabular-nums">{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold text-error">
                    <span>Total Gastos</span><span className="tabular-nums">{formatCurrency(pl.totalExpense)}</span>
                  </div>
                </div>
              )}
              <div className="border-t-2 pt-2 mt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Utilidad / Pérdida Neta</span>
                  <span className={pl.netIncome >= 0 ? 'text-success tabular-nums' : 'text-error tabular-nums'}>
                    {formatCurrency(pl.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Trial Balance ─── */}
          {activeTab === 'trial' && trial && (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-on-surface-muted">
                    <th className="pb-2 font-medium">Código</th>
                    <th className="pb-2 font-medium">Cuenta</th>
                    <th className="pb-2 font-medium text-right">Debe</th>
                    <th className="pb-2 font-medium text-right">Haber</th>
                    <th className="pb-2 font-medium text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {trial.map((t: any) => {
                    const balance = t.totalDebit - t.totalCredit
                    return (
                      <tr key={t.account.id} className="border-b border-on-surface-muted/5">
                        <td className="py-1.5 text-xs font-mono text-on-surface-muted">{t.account.code}</td>
                        <td className="py-1.5 text-on-surface">{t.account.name}</td>
                        <td className="py-1.5 text-right font-mono text-xs tabular-nums">{t.totalDebit > 0 ? formatCurrency(t.totalDebit) : '—'}</td>
                        <td className="py-1.5 text-right font-mono text-xs tabular-nums">{t.totalCredit > 0 ? formatCurrency(t.totalCredit) : '—'}</td>
                        <td className={`py-1.5 text-right font-mono text-xs tabular-nums font-semibold ${balance >= 0 ? 'text-success' : 'text-error'}`}>{formatCurrency(balance)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── General Ledger ─── */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <select value={ledgerAccount} onChange={(e) => { setLedgerAccount(e.target.value); setLedgerPage(0) }} className="input text-sm flex-1 min-w-[200px]">
                  <option value="">Todas las cuentas</option>
                  {accounts?.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input text-sm" placeholder="Desde" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input text-sm" placeholder="Hasta" />
              </div>

              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-on-surface-muted">
                      <th className="pb-2 font-medium">Fecha</th>
                      <th className="pb-2 font-medium">Cuenta</th>
                      <th className="pb-2 font-medium">Descripción</th>
                      <th className="pb-2 font-medium text-right">Debe</th>
                      <th className="pb-2 font-medium text-right">Haber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger?.lines?.length > 0 ? ledger.lines.map((line: any) => (
                      <tr key={line.id} className="border-b border-on-surface-muted/5 hover:bg-surface-container/50">
                        <td className="py-1.5 text-xs text-on-surface-muted">{new Date(line.entry.entryDate).toLocaleDateString()}</td>
                        <td className="py-1.5 text-xs font-mono text-on-surface">{line.account.code}</td>
                        <td className="py-1.5 text-xs text-on-surface-muted max-w-[300px] truncate">{line.entry.description}</td>
                        <td className="py-1.5 text-right font-mono text-xs tabular-nums">{Number(line.debit) > 0 ? formatCurrency(Number(line.debit)) : '—'}</td>
                        <td className="py-1.5 text-right font-mono text-xs tabular-nums">{Number(line.credit) > 0 ? formatCurrency(Number(line.credit)) : '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-8 text-center text-sm text-on-surface-muted">Sin movimientos</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="flex items-center justify-between pt-3 text-xs text-on-surface-muted">
                  <span>{ledger?.total || 0} líneas</span>
                  <div className="flex gap-2">
                    <button disabled={ledgerPage === 0} onClick={() => setLedgerPage(p => p - 1)} className="btn-ghost btn-xs">Anterior</button>
                    <button disabled={(ledger?.lines?.length || 0) < 50} onClick={() => setLedgerPage(p => p + 1)} className="btn-ghost btn-xs">Siguiente</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
