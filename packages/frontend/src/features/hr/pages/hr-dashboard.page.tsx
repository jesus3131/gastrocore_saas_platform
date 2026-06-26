import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../app/store/auth.store'
import { DataTable, Modal, FormField, ConfirmDialog, MetricCard, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { Plus, Edit, Trash2, Users, Clock, DollarSign, UserPlus, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  commissionPct?: number
  isActive: boolean
  hourlyRate?: number
}

export function HrDashboardPage() {
  const { user, updateUser } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>()

  const { data: employees, isLoading: loadingEmp, error: errorEmp, refetch: refetchEmp } = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: () => api.get('/hr/employees').then((r) => r.data.data),
  })

  const { data: shifts } = useQuery({
    queryKey: ['hr', 'shifts'],
    queryFn: () => api.get('/hr/shifts').then((r) => r.data.data),
  })

  const { data: roles } = useQuery({
    queryKey: ['hr', 'roles'],
    queryFn: () => api.get('/hr/roles').then((r) => r.data.data),
  })

  const { data: commissions } = useQuery({
    queryKey: ['hr', 'commissions'],
    queryFn: () => api.get('/hr/commissions').then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/hr/employees', data),
    onSuccess: () => { toast.success('Empleado creado'); queryClient.invalidateQueries({ queryKey: ['hr'] }); setModalOpen(false); reset() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/hr/employees/${editing?.id}`, data),
    onSuccess: () => { toast.success('Empleado actualizado'); queryClient.invalidateQueries({ queryKey: ['hr'] }); setModalOpen(false); setEditing(null); reset() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const updateAdminMutation = useMutation({
    mutationFn: (data: any) => api.put('/tenants/config', { adminName: data.name, adminEmail: data.email }),
    onSuccess: (_, variables) => {
      toast.success('Administrador actualizado')
      if (user) updateUser({ ...user, name: variables.name, email: variables.email })
      setAdminModalOpen(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar admin'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.put(`/hr/employees/${deleteId}`, { isActive: false }),
    onSuccess: () => { toast.success('Empleado desactivado'); queryClient.invalidateQueries({ queryKey: ['hr'] }); setDeleteId(null) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', email: '', phone: '', role: 'waiter', commissionPct: 0, hourlyRate: 0 }); setModalOpen(true) }
  const openEdit = (emp: Employee) => { setEditing(emp); reset(emp); setModalOpen(true) }

  const onSubmit = (data: any) => {
    if (editing) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  if (loadingEmp) return <LoadingSkeleton rows={6} />
  if (errorEmp) return <ErrorState message="Error al cargar empleados" onRetry={refetchEmp} />

  const adminUser = user ? { id: user.id || 'admin', name: user.name || 'Admin', email: user.email || '', role: 'admin', isActive: true, phone: '' } : null
  const employeeList = adminUser ? [adminUser, ...(employees || [])] : (employees || [])
  const activeEmployees = employees?.filter((e: Employee) => e.isActive) || []
  const pendingCommissions = Array.isArray(commissions) ? commissions.filter((c: any) => c.status === 'pending') : []
  const totalCommissions = Array.isArray(commissions) ? commissions.reduce((s: number, c: any) => s + Number(c.amount), 0) : 0
  const todayShifts = Array.isArray(shifts) ? shifts.filter((s: any) => {
    try { return new Date(s.date).toDateString() === new Date().toDateString() }
    catch { return false }
  }).length : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Gestión de Personal</h1>
        <div className="flex gap-2">
          <button onClick={() => { reset({ name: user?.name, email: user?.email }); setAdminModalOpen(true) }} className="btn-secondary btn-sm">
            <Shield className="w-4 h-4" /> Editar Admin
          </button>
          <button onClick={openCreate} className="btn-primary btn-sm"><UserPlus className="w-4 h-4" /> Nuevo Empleado</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Empleados Activos" value={activeEmployees.length} icon={Users} color="text-primary bg-primary/10" />
        <MetricCard label="Turnos Hoy" value={todayShifts} icon={Clock} color="text-info bg-info/10" />
        <MetricCard label="Comisiones Pendientes" value={pendingCommissions.length} icon={DollarSign} color="text-warning bg-warning/10" />
        <MetricCard label="Total Comisiones" value={`$${totalCommissions.toFixed(2)}`} icon={DollarSign} color="text-success bg-success/10" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Empleados</h3>
          <span className="badge-info">{activeEmployees.length} activos + admin</span>
        </div>
        {employeeList.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: 'Nombre' },
              { key: 'role', label: 'Rol', render: (r: Employee) => (
                r.role === 'admin'
                  ? <span className="badge bg-primary/10 text-primary font-semibold">Administrador</span>
                  : <span className="badge-neutral">{r.role}</span>
              )},
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Teléfono', render: (r: Employee) => r.phone || '-' },
              { key: 'commissionPct', label: 'Comisión', render: (r: Employee) => r.commissionPct ? `${r.commissionPct}%` : '-' },
              { key: 'isActive', label: 'Estado', render: (r: Employee) => {
                if (r.role === 'admin') return <span className="badge-success">Admin</span>
                return r.isActive ? <span className="badge-success">Activo</span> : <span className="badge-error">Inactivo</span>
              }},
              { key: 'actions', label: '', sortable: false, render: (r: Employee) => (
                <div className="flex gap-1">
                  {r.role === 'admin' ? (
                    <button onClick={(e) => { e.stopPropagation(); reset({ name: user?.name, email: user?.email }); setAdminModalOpen(true) }} className="btn-ghost btn-sm p-1">
                      <Shield className="w-3 h-3 text-primary" />
                    </button>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="btn-ghost btn-sm p-1"><Edit className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id) }} className="btn-ghost btn-sm p-1 text-error"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              )},
            ]}
            data={employeeList}
            keyField="id"
            emptyMessage="No hay empleados registrados"
            pageSize={10}
          />
        ) : (
          <EmptyState title="Sin empleados" message="Registra tu primer empleado" action={<button onClick={openCreate} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Nuevo Empleado</button>} />
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Turnos Recientes</h3>
        </div>
        {Array.isArray(shifts) && shifts.length > 0 ? (
          <DataTable
            columns={[
              { key: 'employeeName', label: 'Empleado', render: (r: any) => r.employee?.name || '-' },
              { key: 'date', label: 'Fecha', render: (r: any) => { try { return new Date(r.date).toLocaleDateString() } catch { return '-' } } },
              { key: 'startTime', label: 'Inicio', render: (r: any) => { try { return new Date(r.startTime).toLocaleTimeString() } catch { return '-' } } },
              { key: 'endTime', label: 'Fin', render: (r: any) => { try { return r.endTime ? new Date(r.endTime).toLocaleTimeString() : '-' } catch { return '-' } } },
              { key: 'status', label: 'Estado', render: (r: any) => {
                const cls = r.status === 'checked_out' ? 'success' : r.status === 'checked_in' ? 'info' : r.status === 'on_break' ? 'warning' : 'neutral'
                return <span className={`badge-${cls}`}>{r.status?.replace(/_/g, ' ') || '-'}</span>
              }},
            ]}
            data={shifts}
            keyField="id"
            emptyMessage="Sin turnos registrados"
            searchable={false}
            pageSize={10}
          />
        ) : (
          <EmptyState title="Sin turnos" message="No hay turnos registrados aún" />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nombre" registration={register('name', { required: true })} error={errors.name ? 'Requerido' : undefined} />
          <FormField label="Email" type="email" registration={register('email', { required: true })} error={errors.email ? 'Requerido' : undefined} />
          <FormField label="Teléfono" registration={register('phone')} />
          <FormField label="Rol" type="select" registration={register('role')} options={(roles || []).map((r: any) => ({ value: r.role, label: r.role.charAt(0).toUpperCase() + r.role.slice(1) }))} />
          <FormField label="Comisión (%)" type="number" registration={register('commissionPct')} />
          <FormField label="Tarifa por Hora" type="number" registration={register('hourlyRate')} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setEditing(null) }} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Editar Administrador">
        <form onSubmit={handleSubmit((data) => updateAdminMutation.mutate(data))} className="space-y-4">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-2">
            <p className="text-xs font-medium text-primary flex items-center gap-1">
              <Shield className="w-3 h-3" /> Administrador del sistema
            </p>
          </div>
          <FormField label="Nombre del Administrador" registration={register('name', { required: true })} error={errors.name ? 'Requerido' : undefined} />
          <FormField label="Email" type="email" registration={register('email', { required: true })} error={errors.email ? 'Requerido' : undefined} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setAdminModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={updateAdminMutation.isPending}>
              {updateAdminMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate()} title="Desactivar Empleado" message="¿Desactivar este empleado?" loading={deleteMutation.isPending} />
    </div>
  )
}
