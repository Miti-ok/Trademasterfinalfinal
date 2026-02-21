import { useMemo, useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis.js'
import TradeRouteGlobe from '../components/globe/TradeRouteGlobe.jsx'
import { countries } from '../constants/countries.js'

export default function Results() {
  const [saveStatus, setSaveStatus] = useState('')
  const { analysis, tradeRoute, tariffSummary, riskScore, materials, saveCurrentAnalysis } = useAnalysis()

  const countryNameByCode = useMemo(
    () => Object.fromEntries(countries.map((country) => [country.code, country.name])),
    []
  )

  const confidence = useMemo(() => Math.round((analysis?.confidence || 0.82) * 100), [analysis])
  const dutyPercent = Number(tariffSummary?.total_duty_percent)
  const dutyAmount = Number(tariffSummary?.estimated_duty_amount)
  const riskValue = Number(riskScore)
  const riskLabel =
    !Number.isFinite(riskValue) ? 'N/A' : riskValue >= 70 ? 'High' : riskValue >= 40 ? 'Medium' : 'Low'

  const uniqueOrigins = useMemo(
    () =>
      new Set(
        (materials || [])
          .map((material) => String(material.origin_country || '').toUpperCase())
          .filter(Boolean)
      ).size,
    [materials]
  )

  const leadTimeDays = useMemo(() => {
    const riskFactor = Number.isFinite(riskValue) ? Math.round(riskValue / 14) : 4
    const dutyFactor = Number.isFinite(dutyPercent) ? Math.round(dutyPercent / 7) : 2
    const complexityFactor = Math.max(1, uniqueOrigins) * 2
    return Math.max(7, 8 + riskFactor + dutyFactor + complexityFactor)
  }, [riskValue, dutyPercent, uniqueOrigins])

  const leadTimeRange = `${Math.max(5, leadTimeDays - 2)}-${leadTimeDays + 3} days`

  const originMix = useMemo(() => {
    if (!Array.isArray(materials) || materials.length === 0) {
      return []
    }

    const totalsByCountry = materials.reduce((acc, material) => {
      const code = String(material.origin_country || '').toUpperCase()
      const percentage = Number(material.percentage) || 0
      if (!code) return acc
      acc[code] = (acc[code] || 0) + percentage
      return acc
    }, {})

    return Object.entries(totalsByCountry)
      .map(([code, percentage]) => ({
        code,
        country: countryNameByCode[code] || code,
        percentage
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
  }, [materials, countryNameByCode])

  const declaredValue = useMemo(() => {
    const explicit = Number(analysis?.declared_value)
    if (Number.isFinite(explicit) && explicit > 0) {
      return explicit
    }
    if (Number.isFinite(dutyAmount) && Number.isFinite(dutyPercent) && dutyPercent > 0) {
      return (dutyAmount * 100) / dutyPercent
    }
    return 0
  }, [analysis?.declared_value, dutyAmount, dutyPercent])

  const costBreakdown = useMemo(() => {
    if (!(declaredValue > 0)) {
      return []
    }

    const dutyTaxes = Number.isFinite(dutyAmount) ? dutyAmount : 0
    const logistics = Math.max(120, declaredValue * (0.06 + Math.max(1, uniqueOrigins) * 0.01))
    const other = Math.max(60, declaredValue * 0.025)

    const items = [
      { label: 'Manufacturing', amount: declaredValue, fillClass: 'stacked-fill' },
      { label: 'Duty + Taxes', amount: dutyTaxes, fillClass: 'stacked-fill alt' },
      { label: 'Logistics', amount: logistics, fillClass: 'stacked-fill warm' },
      { label: 'Other', amount: other, fillClass: 'stacked-fill muted' }
    ]
    const total = items.reduce((sum, item) => sum + item.amount, 0)

    return items.map((item) => ({
      ...item,
      width: total > 0 ? (item.amount / total) * 100 : 0
    }))
  }, [declaredValue, dutyAmount, uniqueOrigins])

  const policyItems = useMemo(() => {
    const baseDuty = Number.isFinite(Number(tariffSummary?.base_duty))
      ? Number(tariffSummary.base_duty).toFixed(1)
      : 'N/A'
    const additionalDuty = Number.isFinite(Number(tariffSummary?.additional_duty))
      ? Number(tariffSummary.additional_duty).toFixed(1)
      : 'N/A'
    const agreementAdjustment = Number.isFinite(Number(tariffSummary?.trade_agreement_discount))
      ? Number(tariffSummary.trade_agreement_discount).toFixed(1)
      : 'N/A'
    const actionText =
      !Number.isFinite(dutyPercent)
        ? 'Run an analysis to get policy guidance.'
        : dutyPercent >= 20
        ? 'High duty exposure detected. Validate agreement eligibility and alternate origin options.'
        : 'Duty exposure is manageable. Monitor agreement changes before shipment confirmation.'

    return [
      {
        title: 'Tariff Explanation',
        body: tariffSummary?.explanation || 'No tariff explanation available yet.'
      },
      {
        title: 'Duty Inputs',
        body: `Base ${baseDuty}% + Additional ${additionalDuty}% + Agreement adjustment ${agreementAdjustment}%.`
      },
      {
        title: 'Recommended Policy Action',
        body: actionText
      }
    ]
  }, [tariffSummary, dutyPercent])

  const exporterCountry =
    tradeRoute?.find((entry) => entry.role === 'exporter')?.country ||
    countryNameByCode[analysis?.manufacturing_country] ||
    analysis?.manufacturing_country ||
    'Origin'
  const importerCountry =
    tradeRoute?.find((entry) => entry.role === 'importer')?.country ||
    countryNameByCode[analysis?.destination_country] ||
    analysis?.destination_country ||
    'Destination'

  const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleSave = () => {
    try {
      const entry = saveCurrentAnalysis()
      setSaveStatus(`Saved on ${new Date(entry.saved_at).toLocaleString()}`)
    } catch (saveError) {
      setSaveStatus(saveError.message || 'Unable to save analysis.')
    }
  }

  return (
    <div className="space-y-12">
      <section className="dashboard-hero">
        <div className="dashboard-frame">
          <div className="dashboard-map">
            <TradeRouteGlobe routeData={tradeRoute} />
          </div>
          <div className="dashboard-cta-row">
            <button className="dashboard-chip" type="button">
              Change country
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="stat-card">
          <p className="label">HS Code</p>
          <h3>{analysis?.hs_code || '6101.30'}</h3>
          <span>{confidence}% confidence</span>
        </div>
        <div className="stat-card">
          <p className="label">Estimated Duty</p>
          <h3>{Number.isFinite(dutyPercent) ? `${dutyPercent.toFixed(1)}%` : 'N/A'}</h3>
          <span>{Number.isFinite(dutyAmount) ? `${formatCurrency(dutyAmount)} estimated` : 'No duty data'}</span>
        </div>
        <div className="stat-card">
          <p className="label">Risk Score</p>
          <h3>{riskLabel}</h3>
          <span>{Number.isFinite(riskValue) ? `${riskValue.toFixed(1)}/100` : 'No risk data'}</span>
        </div>
        <div className="stat-card">
          <p className="label">Lead Time</p>
          <h3>{leadTimeDays} days</h3>
          <span>{leadTimeRange} estimated door-to-door</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-6">
          <h3 className="section-title">Tariff Exposure</h3>
          <div className="stacked-bars">
            <div className="stacked-row">
              <span>Base Duty</span>
              <div className="stacked-track">
                <div
                  className="stacked-fill"
                  style={{ width: `${Math.max(0, Number(tariffSummary?.base_duty || 0) * 4)}%` }}
                />
              </div>
            </div>
            <div className="stacked-row">
              <span>Additional Duty</span>
              <div className="stacked-track">
                <div
                  className="stacked-fill alt"
                  style={{ width: `${Math.max(0, Number(tariffSummary?.additional_duty || 0) * 4)}%` }}
                />
              </div>
            </div>
            <div className="stacked-row">
              <span>Agreement Discount</span>
              <div className="stacked-track">
                <div
                  className="stacked-fill warm"
                  style={{
                    width: `${Math.max(0, Math.abs(Number(tariffSummary?.trade_agreement_discount || 0)) * 4)}%`
                  }}
                />
              </div>
            </div>
            <p className="list-sub mt-3">
              Total duty: {Number.isFinite(dutyPercent) ? `${dutyPercent.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Shipment Timeline</h3>
          <div className="list-stack">
            <div>
              <p className="list-title">Estimated transit and clearance</p>
              <p className="list-sub">{leadTimeRange}</p>
            </div>
            <div>
              <p className="list-title">Supply chain handoffs</p>
              <p className="list-sub">{Math.max(1, uniqueOrigins)} origin checkpoints</p>
            </div>
            <div>
              <p className="list-title">Risk-adjusted customs buffer</p>
              <p className="list-sub">{riskLabel} risk profile</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6">
          <h3 className="section-title">Top Origin Mix</h3>
          <div className="donut-grid">
            <div className="donut-ring" />
            <div className="space-y-3">
              {originMix.length === 0 && <p className="list-sub">No origin mix available yet.</p>}
              {originMix.map((origin, index) => {
                const dotClass = index === 1 ? 'legend-dot alt' : index === 2 ? 'legend-dot warm' : 'legend-dot'
                return (
                  <div className="legend-row" key={origin.code}>
                    <span className={dotClass} />
                    <p>
                      {origin.country} - {origin.percentage.toFixed(1)}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Cost Breakdown</h3>
          <div className="stacked-bars">
            {costBreakdown.length === 0 && <p className="list-sub">Run an analysis to see cost allocation.</p>}
            {costBreakdown.map((costItem) => (
              <div className="stacked-row" key={costItem.label}>
                <span>{costItem.label}</span>
                <div className="stacked-track">
                  <div className={costItem.fillClass} style={{ width: `${costItem.width}%` }} />
                </div>
                <span>{formatCurrency(costItem.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <h3 className="section-title">Policy Changes</h3>
          <div className="list-stack">
            {policyItems.map((item) => (
              <div key={item.title}>
                <p className="list-title">{item.title}</p>
                <p className="list-sub">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Routing Options</h3>
          <div className="route-grid">
            <div className="route-card">
              <h4>SEA - {exporterCountry} to {importerCountry}</h4>
              <p>{leadTimeDays + 8}-{leadTimeDays + 12} days - Low cost</p>
              <span>{formatCurrency(Math.max(500, declaredValue * 0.12))} per container</span>
            </div>
            <div className="route-card">
              <h4>AIR - {exporterCountry} to {importerCountry}</h4>
              <p>{Math.max(2, leadTimeDays - 8)}-{Math.max(4, leadTimeDays - 5)} days - Fast lane</p>
              <span>{formatCurrency(Math.max(1200, declaredValue * 0.25))} per pallet</span>
            </div>
            <div className="route-card">
              <h4>HYBRID - Consolidated flow</h4>
              <p>{leadTimeDays + 2}-{leadTimeDays + 6} days - Balanced</p>
              <span>{formatCurrency(Math.max(850, declaredValue * 0.18))} per load</span>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Compliance Checks</h3>
          <div className="checklist">
            <div className="check-row">
              <span className="check-dot" />
              <p>{Array.isArray(materials) && materials.length > 0 ? 'Materials declaration complete' : 'Materials pending'}</p>
            </div>
            <div className="check-row">
              <span className="check-dot" />
              <p>{analysis?.hs_code ? `HS code ${analysis.hs_code} mapped` : 'HS mapping pending'}</p>
            </div>
            <div className={Number.isFinite(riskValue) && riskValue >= 60 ? 'check-row warn' : 'check-row'}>
              <span className="check-dot" />
              <p>
                {Number.isFinite(riskValue) && riskValue >= 60
                  ? 'Origin certificate review recommended'
                  : 'Origin certificate risk is low'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h3 className="section-title">Recent Insights</h3>
        <div className="insight-grid">
          <div className="insight-card">
            <h4>Origin sensitivity</h4>
            <p>
              {originMix.length > 0
                ? `Largest origin share: ${originMix[0].country} at ${originMix[0].percentage.toFixed(1)}%.`
                : 'Origin mix will appear after material extraction.'}
            </p>
          </div>
          <div className="insight-card">
            <h4>Tariff pressure</h4>
            <p>
              {Number.isFinite(dutyPercent)
                ? `Current landed-duty rate is ${dutyPercent.toFixed(1)}%.`
                : 'Tariff rate pending analysis.'}
            </p>
          </div>
          <div className="insight-card">
            <h4>Lead-time outlook</h4>
            <p>{leadTimeRange} expected based on route complexity and risk profile.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-actions print-hidden">
        <button className="button-secondary" type="button">
          Go back
        </button>
        <div className="action-group">
          <button className="button-secondary" type="button">
            Main menu
          </button>
          <button className="button-secondary" type="button" onClick={() => window.print()}>
            Export report
          </button>
          <button className="button-primary" type="button" onClick={handleSave}>
            Save analysis
          </button>
        </div>
      </section>
      {saveStatus && (
        <section className="glass-panel p-4">
          <p className="text-sm text-[color:var(--text-muted)]">{saveStatus}</p>
        </section>
      )}
    </div>
  )
}
