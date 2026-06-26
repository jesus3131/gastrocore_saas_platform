import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { MetricCard, ErrorState } from '../../../shared/components/ui'
import { useState } from 'react'
import {
  BarChart3, BookOpen, Receipt, FileSpreadsheet,
  TrendingUp, TrendingDown, DollarSign, Landmark,
} from 'lucide-react'

export function AccountingOverviewPage() {
  const [period, setPeriod] = useState('')

  const { data: bs, isLoading: bsLoading } = useQuery({
    queryKey: ['accounting', 'balance-sheet', period],
    queryFn: () => api.get('/accounting/balance-sheet', { params: { periodId: period || undefined } }).then(r => r.data.data),
  })

  const { data: pl, isLoading: plLoading } = useQuery({
    queryKey: ['accounting', 'income-statement', period],
    queryFn: () => api.get('/accounting/income-statement', { params: { periodId: period || undefined } }).then(r => r.data.data),
  })

  const { data: trial, isLoading: tbLoading } = useQuery({
    queryKey: ['accounting', 'trial-balance', period],
    queryFn: () => api.get('/accounting/trial-balance', { params: { periodId: period || undefined } }).then(r => r.data.data),
  })

  const { data: periods } = useQuery({
    queryKey: ['accounting', 'periods'],
    queryFn: () => api.get('/accounting/periods').then(r => r.data.data),
  })

  const isLoading = bsLoading || plLoading || tbLoading
  const error = !isLoading && (!bs || !pl) ? 'No data' : null

  if (error) return <ErrorState message="Sin datos contables — crea períodos contables y asientos para ver el resumen" />
  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div className="card animate-pulse h-24" /><div className="card animate-pulse h-24" /><div className="card animate-pulse h-24" /><div className="card animate-pulse h-24" /></div>

  const netIncome = pl?.netIncome ?? 0
  const totalAssets = bs?.asset?.total ?? 0
  const totalLiabilities = bs?.liability?.total ?? 0
  const totalEquity = bs?.equity?.total ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-on-surface">Contabilidad</h1>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input text-sm max-w-xs">
          <option value="">Todos los períodos</option>
          {periods?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} {p.isClosed ? '🔒' : ''}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Activos Totales"
          value={`$${totalAssets.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={Landmark}
        />
        <MetricCard
          label="Pasivos Totales"
          value={`$${totalLiabilities.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={Receipt}
        />
        <MetricCard
          label="Capital Contable"
          value={`$${totalEquity.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={BookOpen}
        />
        <MetricCard
          label={netIncome >= 0 ? 'Utilidad del Período' : 'Pérdida del Período'}
          value={`$${Math.abs(netIncome).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={netIncome >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-bold text-on-surface mb-3">Ecuación Contable</h2>
          {bs?.accountingEquation && (
            <div className="p-4 rounded-lg bg-surface-container space-y-2">
              <div className="flex justify-between text-sm"><span>Activos</span><span className="font-semibold tabular-nums">${bs.accountingEquation.assets.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm"><span>Pasivos + Capital</span><span className="font-semibold tabular-nums">${bs.accountingEquation.liabilitiesPlusEquity.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Balance</span>
                  <span className={bs.accountingEquation.balanced ? 'text-success' : 'text-error'}>
                    {bs.accountingEquation.balanced ? '✅ Cuadrado' : '❌ Descuaadrado'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-bold text-on-surface mb-3">Trial Balance</h2>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {trial?.slice(0, 15).map((item: any) => (
              <div key={item.account.id} className="flex justify-between text-xs py-0.5">
                <span className="text-on-surface-muted truncate mr-2">{item.account.code}</span>
                <span className="font-medium tabular-nums">${(item.totalDebit - item.totalCredit).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* P&L Summary */}
      {pl && (
        <div className="card">
          <h2 className="text-sm font-bold text-on-surface mb-3 py-3">
            Estado de Resultados {pl.totalIncome > 0 || pl.totalExpense > 0 ? `— Utilidad Neta: $${netIncome.toFixed(2)}` : '(sin datos)'}
          </h2>
          {pl.incomes?.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-success mb-2">Ingresos</h3>
              {pl.incomes.map((i: any) => (
                <div key={i.code} className="flex justify-between text-sm py-1"><span>{i.name}</span><span className="font-medium tabular-nums">${i.amount.toFixed(2)}</span></div>
              ))}
              <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold text-success"><span>Total Ingresos</span><span>${pl.totalIncome.toFixed(2)}</span></div>
            </div>
          )}
          {pl.expenses?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-error mb-2">Gastos</h3>
              {pl.expenses.map((e: any) => (
                <div key={e.code} className="flex justify-between text-sm py-1"><span>{e.name}</span><span className="font-medium tabular-nums">${e.amount.toFixed(2)}</span></div>
              ))}
              <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold text-error"><span>Total Gastos</span><span>${pl.totalExpense.toFixed(2)}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
