import { UseFormRegisterReturn } from 'react-hook-form'

interface Option {
  value: string
  label: string
}

interface FormFieldProps {
  label: string
  error?: string
  registration?: UseFormRegisterReturn
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea'
  placeholder?: string
  options?: Option[]
  disabled?: boolean
  defaultValue?: string | number
}

export function FormField({
  label,
  error,
  registration,
  type = 'text',
  placeholder,
  options,
  disabled,
  defaultValue,
}: FormFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      {type === 'select' ? (
        <select
          {...registration}
          className="select"
          disabled={disabled}
          defaultValue={defaultValue}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          {...registration}
          className="input min-h-[80px] resize-y"
          placeholder={placeholder}
          disabled={disabled}
          defaultValue={defaultValue}
        />
      ) : (
        <input
          type={type}
          {...registration}
          className="input"
          placeholder={placeholder}
          disabled={disabled}
          defaultValue={defaultValue}
        />
      )}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}
