import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '../../../lib/stripe'
import { Modal } from '../../../shared/components/ui'

interface StripeCardFormProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
  onCancel: () => void
}

function StripePaymentForm({ amount, onSuccess, onError, onCancel }: Omit<StripeCardFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/pos/checkout' },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Error al procesar el pago')
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-surface-container p-4 rounded-lg border border-on-surface-muted/10">
        <PaymentElement />
      </div>

      <div className="text-xs text-on-surface-muted text-center">
        Total a pagar: <span className="font-semibold text-on-surface">${amount.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} disabled={isProcessing} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={!stripe || !elements || isProcessing} className="btn-primary flex-1">
          {isProcessing ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

export function StripeCardForm({ clientSecret, amount, onSuccess, onError, onCancel }: StripeCardFormProps) {
  if (!stripePromise) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-error">Stripe no está configurado. <br />Falta VITE_STRIPE_PUBLISHABLE_KEY.</p>
        <button onClick={onCancel} className="btn-secondary mt-4">Cerrar</button>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <StripePaymentForm amount={amount} onSuccess={onSuccess} onError={onError} onCancel={onCancel} />
    </Elements>
  )
}
