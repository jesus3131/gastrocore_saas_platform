import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
  pageSize?: number
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin datos disponibles',
  loading = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let items = data
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((row) =>
        columns.some((col) => {
          try { return String(row[col.key] ?? '').toLowerCase().includes(q) }
          catch { return false }
        })
      )
    }
    if (sortKey) {
      items = [...items].sort((a, b) => {
        try {
          const av = a?.[sortKey as string] ?? ''
          const bv = b?.[sortKey as string] ?? ''
          const cmp = typeof av === 'number' ? av - Number(bv) : String(av).localeCompare(String(bv))
          return sortDir === 'asc' ? cmp : -cmp
        } catch { return 0 }
      })
    }
    return items
  }, [data, search, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (loading) {
    return (
      <div className="table-container">
        <div className="p-8 text-center text-sm text-on-surface-muted">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-surface-container-high rounded" />
            <div className="h-8 bg-surface-container-high rounded" />
            <div className="h-8 bg-surface-container-high rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {searchable && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="input pl-9"
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`select-none ${col.sortable !== false ? 'cursor-pointer hover:bg-surface-container-higher' : ''} ${col.className || ''}`}
                  onClick={() => { if (col.sortable !== false) toggleSort(col.key) }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 text-on-surface-muted/40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-sm text-on-surface-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row[keyField]}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className || ''}>
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-on-surface-muted">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost btn-sm text-xs"
            >
              Anterior
            </button>
            <span className="px-2 py-1 text-xs text-on-surface-muted">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost btn-sm text-xs"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
