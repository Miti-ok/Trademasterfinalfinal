import { useNavigate } from 'react-router-dom'
import ProductInputForm from '../components/ProductInputForm.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useAnalysis } from '../hooks/useAnalysis.js'
import { countries } from '../constants/countries.js'

export default function NewAnalysis() {
  const navigate = useNavigate()
  const { loading, error, reset, setTradeRoute } = useAnalysis()

  const countryNameByCode = (code) =>
    countries.find((country) => country.code === code)?.name || code

  const handleSubmit = async (payload) => {
    if (!payload) {
      return
    }
    const exporter = countryNameByCode(payload.manufacturing_country)
    const importer = countryNameByCode(payload.destination_country)
    setTradeRoute([
      {
        country: exporter,
        role: 'exporter',
        material: payload.product_name || 'Trade shipment',
        hs_code: '0000.00'
      },
      {
        country: importer,
        role: 'importer',
        material: payload.product_name || 'Trade shipment',
        hs_code: '0000.00'
      }
    ])
    navigate('/results')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h2 className="section-title">New Trade Analysis</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Provide product details to generate HS classification, duty estimation, and sourcing risk.
        </p>
        <div className="mt-6">
          <ProductInputForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
      <div className="space-y-6">
        <div className="glass-panel p-6">
          <h3 className="section-title">Workflow</h3>
          <ol className="mt-4 space-y-3 text-sm text-[color:var(--text-muted)]">
            <li>1. Enter product specifications.</li>
            <li>2. Validate materials and origin mix.</li>
            <li>3. Review duty exposure and risk.</li>
          </ol>
          {loading && <div className="mt-6"><LoadingSpinner label="Running AI analysis" /></div>}
        </div>
        {error && (
          <ErrorState
            title="Analysis failed"
            message={error.message || 'Unable to complete the analysis.'}
            onRetry={reset}
          />
        )}
      </div>
    </div>
  )
}
