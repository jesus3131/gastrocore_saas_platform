import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { Modal, EmptyState, ErrorState } from '../../../shared/components/ui'
import { LoadingSkeleton } from '../../../shared/components/ui/loading'
import { CreditCard, Banknote, Smartphone, QrCode, ArrowLeft, CheckCircle } from 'lucide-react'

const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: Banknote, color: 'text-success bg-success/10 border-success/20' },
  { id: 'card', label: 'Tarjeta', icon: CreditCard, color: 'text-primary bg-primary/10 border-primary/20' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: Smartphone, color: 'text-info bg-info/10 border-info/20' },
  { id: 'stripe', label: 'Stripe', icon: QrCode, color: 'text-warning bg-warning/10 border-warning/20' },
  { id: 'transfer', label: 'Transferencia', icon: Banknote, color: 'text-on-surface bg-surface-container-high border-on-surface-muted/20' },
]

export function CheckoutPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [splitMode, setSplitMode] = useState<'none' | 'equal' | 'items'>('none')
  const [splitCount, setSplitCount] = useState(2)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['pos', 'orders'],
    queryFn: () => api.get('/pos/orders').then((r) => r.data.data),
  })

  const processPayment = useMutation({
    mutationFn: (data: any) => api.post('/pos/payments', data),
    onSuccess: () => {
      toast.success('Pago procesado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['pos'] })
      setSelectedOrder(null)
      setPaymentMethod('')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al procesar pago'),
  })

  const splitPayment = useMutation({
    mutationFn: (data: any) => api.post('/pos/payments/split', data),
    onSuccess: () => {
      toast.success('Cuenta dividida exitosamente')
      queryClient.invalidateQueries({ queryKey: ['pos'] })
      setSelectedOrder(null)
      setSplitMode('none')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al dividir'),
  })

  if (isLoading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message="Error al cargar órdenes" onRetry={refetch} />

  const pendingOrders = orders?.filter((o: any) => o.status !== 'paid' && o.status !== 'canceled') || []

  const handlePay = () => {
    if (!selectedOrder || !paymentMethod) return
    if (splitMode !== 'none') {
      splitPayment.mutate({
        orderId: selectedOrder.id,
        method: paymentMethod,
        parts: splitMode === 'equal' ? splitCount : undefined,
      })
    } else {
      processPayment.mutate({
        orderId: selectedOrder.id,
        method: paymentMethod,
        amount: selectedOrder.total,
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pos')} className="btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">Cobro</h1>
      </div>

      {pendingOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-on-surface">Órdenes Pendientes</h3>
            {pendingOrders.map((order: any) => (
              <div
                key={order.id}
                className={`card cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => { setSelectedOrder(order); setPaymentMethod('') }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Orden #{order.orderNumber || order.id.slice(0, 6)}</p>
                    <p className="text-2xs text-on-surface-muted">
                      Mesa: {order.table?.label || '—'} · {order.items?.length || 0} items
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {order.items?.slice(0, 5).map((item: any) => (
                    <span key={item.id} className="badge-neutral text-2xs">{item.name} x{item.quantity}</span>
                  ))}
                  {order.items?.length > 5 && (
                    <span className="badge-neutral text-2xs">+{order.items.length - 5} más</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="card-title mb-3">Método de Pago</h3>
                <div className="grid grid-cols-1 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        paymentMethod === method.id
                          ? `${method.color} ring-2 ring-primary`
                          : 'border-on-surface-muted/10 hover:bg-surface-container'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{method.label}</span>
                      {paymentMethod === method.id && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title mb-3">Dividir Cuenta</h3>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setSplitMode('none')}
                    className={`btn-sm flex-1 ${splitMode === 'none' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Completo
                  </button>
                  <button
                    onClick={() => setSplitMode('equal')}
                    className={`btn-sm flex-1 ${splitMode === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Partes Iguales
                  </button>
                </div>
                {splitMode === 'equal' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-muted">Dividir en:</span>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={splitCount}
                      onChange={(e) => setSplitCount(Number(e.target.value))}
                      className="input w-16 text-center"
                    />
                    <span className="text-xs text-on-surface-muted">partes</span>
                    <span className="text-sm font-semibold text-primary ml-auto">
                      ${(selectedOrder.total / splitCount).toFixed(2)} c/u
                    </span>
                  </div>
                )}
              </div>

              <div className="card bg-primary/5 border-primary/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-on-surface-muted">Total a Cobrar</p>
                    <p className="text-2xl font-bold text-primary">${Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={!paymentMethod || processPayment.isPending || splitPayment.isPending}
                    className="btn-primary btn-lg"
                  >
                    {processPayment.isPending || splitPayment.isPending ? 'Procesando...' : 'Cobrar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="Sin órdenes pendientes"
          message="Todas las órdenes han sido cobradas"
          action={<button onClick={() => navigate('/pos')} className="btn-primary btn-sm">Ir a POS</button>}
        />
      )}
    </div>
  )
}
