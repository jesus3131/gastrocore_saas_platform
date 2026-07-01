import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../app/store/auth.store'
import { ChefHat, Delete } from 'lucide-react'

export function WaiterAuth() {
  const setWaiter = useAuthStore((s) => s.setWaiter)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDigit = (digit: string) => {
    setError('')
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        verifyPin(newPin)
      }
    }
  }

  const handleDelete = () => {
    setError('')
    setPin((prev) => prev.slice(0, -1))
  }

  const verifyPin = async (fullPin: string) => {
    setLoading(true)
    try {
      const res = await api.post('/hr/employees/verify-pin', { pin: fullPin, role: 'waiter' })
      setWaiter(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'PIN inválido')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ChefHat className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-1">Servicio a Mesas</h1>
        <p className="text-sm text-on-surface-muted mb-8">Ingresa tu PIN de mesero</p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'border-primary bg-primary'
                  : loading && i === pin.length
                  ? 'border-primary border-dashed animate-pulse'
                  : 'border-on-surface-muted/30'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-error mb-3 bg-error/5 rounded-lg py-2">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {['1','2','3','4','5','6','7','8','9','', '0',''].map((digit, i) => (
            digit ? (
              <button
                key={i}
                onClick={() => handleDigit(digit)}
                disabled={loading || pin.length >= 4}
                className="h-16 rounded-xl bg-surface-container text-xl font-bold text-on-surface hover:bg-surface-container-high active:scale-90 transition-all touch-manipulation disabled:opacity-30 shadow-sm"
              >
                {digit}
              </button>
            ) : (
              <div key={i} />
            )
          ))}
        </div>

        <div className="mt-3">
          <button
            onClick={handleDelete}
            disabled={pin.length === 0 || loading}
            className="h-12 px-6 rounded-xl bg-surface-container text-on-surface-muted hover:bg-surface-container-high active:scale-90 transition-all touch-manipulation disabled:opacity-30 text-sm font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <Delete className="w-4 h-4" /> Borrar
          </button>
        </div>
      </div>
    </div>
  )
}
