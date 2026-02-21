import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { countries } from '../constants/countries.js'
import { isIso2, validateDeclaredValue } from '../utils/validators.js'

export default function ProductInputForm({ onSubmit, loading }) {
  const [imageBase64, setImageBase64] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      product_name: '',
      description: '',
      manufacturing_country: 'US',
      destination_country: 'DE',
      declared_value: 1000
    }
  })

  const descriptionValue = watch('description')

  const countryOptions = useMemo(
    () =>
      countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name} ({country.code})
        </option>
      )),
    []
  )

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageBase64('')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const [, base64] = result.split(',')
        setImageBase64(base64 || '')
      }
    }
    reader.readAsDataURL(file)
  }

  const submit = (data) => {
    if (!data.description && !imageBase64) {
      return
    }
    onSubmit({
      ...data,
      manufacturing_country: data.manufacturing_country.toUpperCase(),
      destination_country: data.destination_country.toUpperCase(),
      declared_value: Number(data.declared_value),
      image_base64: imageBase64 || undefined
    })
  }

  const descriptionRequired = !imageBase64

  return (
    <form onSubmit={handleSubmit(submit)} className="glass-panel space-y-6 p-6">
      <div>
        <label className="label">Product Name</label>
        <input
          className="input mt-2"
          {...register('product_name', { required: 'Product name is required.' })}
          placeholder="e.g., Performance polyester jacket"
        />
        {errors.product_name && (
          <p className="mt-2 text-sm text-ember">{errors.product_name.message}</p>
        )}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input mt-2 min-h-[120px]"
          {...register('description', {
            required: descriptionRequired ? 'Description or image is required.' : false
          })}
          placeholder="Describe materials, usage, and construction..."
        />
        {errors.description && (
          <p className="mt-2 text-sm text-ember">{errors.description.message}</p>
        )}
        {!descriptionValue && !imageBase64 && (
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">
            Provide a description or upload an image.
          </p>
        )}
      </div>

      <div>
        <label className="label">Reference Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="file-upload mt-2 block w-full text-sm"
        />
        {imageBase64 && (
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">Image loaded.</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Manufacturing Country</label>
          <select
            className="input mt-2"
            {...register('manufacturing_country', {
              validate: (value) => isIso2(value, countries) || 'Invalid ISO2 code.'
            })}
          >
            {countryOptions}
          </select>
        </div>
        <div>
          <label className="label">Destination Country</label>
          <select
            className="input mt-2"
            {...register('destination_country', {
              validate: (value) => isIso2(value, countries) || 'Invalid ISO2 code.'
            })}
          >
            {countryOptions}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Declared Value (USD)</label>
        <input
          type="number"
          step="0.01"
          className="input mt-2"
          {...register('declared_value', {
            validate: (value) => validateDeclaredValue(value) || 'Value must be positive.'
          })}
        />
        {errors.declared_value && (
          <p className="mt-2 text-sm text-ember">{errors.declared_value.message}</p>
        )}
      </div>

      <button className="button-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Run AI Classification'}
      </button>
    </form>
  )
}
