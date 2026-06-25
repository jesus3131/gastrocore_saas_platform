import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function HrDashboardPage() {
  const { data: employees } = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: () => api.get('/hr/employees').then((r) => r.data.data),
  })

  const { data: shifts } = useQuery({
    queryKey: ['hr', 'shifts'],
    queryFn: () => api.get('/hr/shifts').then((r) => r.data.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-on-surface">Gestión de Personal</h1>

      {/* Employees */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Empleados</h3>
          <span className="badge-info">{employees?.length || 0} activos</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Comisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp: any) => (
                <tr key={emp.id}>
                  <td className="font-medium">{emp.name}</td>
                  <td><span className="badge-neutral">{emp.role}</span></td>
                  <td className="text-on-surface-muted">{emp.email}</td>
                  <td>{emp.phone || '-'}</td>
                  <td>{emp.commissionPct ? `${emp.commissionPct}%` : '-'}</td>
                  <td>{emp.isActive ? <span className="badge-success">Activo</span> : <span className="badge-error">Inactivo</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shifts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Turnos Recientes</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {shifts?.map((shift: any) => (
                <tr key={shift.id}>
                  <td className="font-medium">{shift.employee?.name}</td>
                  <td>{new Date(shift.date).toLocaleDateString()}</td>
                  <td>{new Date(shift.startTime).toLocaleTimeString()}</td>
                  <td>{shift.endTime ? new Date(shift.endTime).toLocaleTimeString() : '-'}</td>
                  <td><span className={`badge-${shift.status === 'checked_out' ? 'success' : shift.status === 'checked_in' ? 'info' : 'neutral'}`}>{shift.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
