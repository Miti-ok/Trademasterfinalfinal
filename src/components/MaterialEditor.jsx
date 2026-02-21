import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { countries } from '../constants/countries.js'
import { totalPercentage, validateMaterials } from '../utils/validators.js'

const stages = ['Raw', 'Processing', 'Assembly', 'Finishing']

export default function MaterialEditor({ materials, onApply, disabled }) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      materials: materials?.length
        ? materials
        : [
            { name: 'Polyester', percentage: 50, origin: 'CN', stage: 'Raw' },
            { name: 'Cotton', percentage: 50, origin: 'IN', stage: 'Processing' }
          ]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'materials' })
  const values = watch('materials')

  const total = useMemo(() => totalPercentage(values || []), [values])
  const validation = validateMaterials(values || [])

  const submit = (data) => {
    const validationResult = validateMaterials(data.materials)
    if (!validationResult.valid) return
    onApply(data.materials)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Material Composition</p>
          <p className="text-xs text-white/50">Total {total.toFixed(2)}%</p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => append({ name: '', percentage: 0, origin: 'US', stage: stages[0] })}
          disabled={disabled}
        >
          Add Material
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-4">
            <div>
              <label className="label">Material</label>
              <input
                className="input mt-2"
                {...register(`materials.${index}.name`, { required: 'Required' })}
              />
            </div>
            <div>
              <label className="label">Percentage</label>
              <input
                type="number"
                step="0.1"
                className="input mt-2"
                {...register(`materials.${index}.percentage`, { required: 'Required', min: 0.1 })}
              />
            </div>
            <div>
              <label className="label">Origin</label>
              <select className="input mt-2" {...register(`materials.${index}.origin`)}>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Stage</label>
              <select className="input mt-2" {...register(`materials.${index}.stage`)}>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                className="text-xs text-ember"
                type="button"
                onClick={() => remove(index)}
                disabled={disabled || fields.length === 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {!validation.valid && (
        <p className="text-sm text-ember">{validation.message}</p>
      )}
      {errors.materials && <p className="text-sm text-ember">Fix material errors.</p>}

      <button className="button-primary" type="submit" disabled={disabled || !validation.valid}>
        Apply Changes & Recalculate
      </button>
    </form>
  )
}
