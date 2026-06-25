import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function CustomersPage() {
  const { data: customers } = useQuery({
    queryKey: ['crm', 'customers'],
    queryFn: () => api.get('/crm/customers').then((r) => r.data.data),
  })

  const { data: segments } = useQuery({
    queryKey: ['crm', 'segments'],
    queryFn: () => api.get('/crm/segments').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Clientes CRM</h1>

      {/* Segments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments?.map((seg: any) => (
          <div key={seg.name} className="card text-center">
            <p className="text-2xl font-bold text-primary">{seg.count}</p>
            <p className="text-xs font-medium text-on-surface-muted">{seg.name}</p>
            <p className="text-2xs text-on-surface-subtle mt-1">{seg.condition}</p>
          </div>
        ))}
      </div>

      {/* Customers table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Directorio de Clientes</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Visitas</th>
                <th>Total Gastado</th>
                <th>Puntos</th>
                <th>Segmento</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="text-on-surface-muted">{c.email || '-'}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.totalVisits}</td>
                  <td className="font-semibold">${Number(c.totalSpent).toFixed(2)}</td>
                  <td>{c.loyaltyPoints || 0}</td>
                  <td><span className="badge-info">{c.segment}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
