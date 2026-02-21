import { useMemo } from 'react'
import { useAnalysis } from '../hooks/useAnalysis.js'
import TradeRouteGlobe from '../components/globe/TradeRouteGlobe.jsx'

export default function Results() {
  const { analysis, tradeRoute } = useAnalysis()
  const confidence = useMemo(() => Math.round((analysis?.confidence || 0.82) * 100), [analysis])

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
          <h3>14.8%</h3>
          <span>Includes origin mix</span>
        </div>
        <div className="stat-card">
          <p className="label">Risk Score</p>
          <h3>Medium</h3>
          <span>3 alerts open</span>
        </div>
        <div className="stat-card">
          <p className="label">Lead Time</p>
          <h3>18 days</h3>
          <span>Avg. clearance + transit</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-6">
          <h3 className="section-title">Tariff Exposure</h3>
          <div className="chart-block">
            <div className="chart-bar" />
            <div className="chart-bar" />
            <div className="chart-bar" />
            <div className="chart-bar" />
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Shipment Timeline</h3>
          <div className="chart-line" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6">
          <h3 className="section-title">Top Origin Mix</h3>
          <div className="donut-grid">
            <div className="donut-ring" />
            <div className="space-y-3">
              <div className="legend-row">
                <span className="legend-dot" />
                <p>Vietnam · 42%</p>
              </div>
              <div className="legend-row">
                <span className="legend-dot alt" />
                <p>China · 31%</p>
              </div>
              <div className="legend-row">
                <span className="legend-dot warm" />
                <p>Bangladesh · 27%</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Cost Breakdown</h3>
          <div className="stacked-bars">
            <div className="stacked-row">
              <span>Manufacturing</span>
              <div className="stacked-track">
                <div className="stacked-fill" style={{ width: '54%' }} />
              </div>
            </div>
            <div className="stacked-row">
              <span>Duty + Taxes</span>
              <div className="stacked-track">
                <div className="stacked-fill alt" style={{ width: '22%' }} />
              </div>
            </div>
            <div className="stacked-row">
              <span>Logistics</span>
              <div className="stacked-track">
                <div className="stacked-fill warm" style={{ width: '16%' }} />
              </div>
            </div>
            <div className="stacked-row">
              <span>Other</span>
              <div className="stacked-track">
                <div className="stacked-fill muted" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <h3 className="section-title">Policy Changes</h3>
          <div className="list-stack">
            <div>
              <p className="list-title">EU textile duty update</p>
              <p className="list-sub">Effective in 14 days</p>
            </div>
            <div>
              <p className="list-title">Section 301 exemptions</p>
              <p className="list-sub">Review pending extension</p>
            </div>
            <div>
              <p className="list-title">Origin verification</p>
              <p className="list-sub">Heightened checks this quarter</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Routing Options</h3>
          <div className="route-grid">
            <div className="route-card">
              <h4>SEA · HCMC → LA</h4>
              <p>28–32 days · Low risk</p>
              <span>$2.3k / container</span>
            </div>
            <div className="route-card">
              <h4>AIR · SGN → ORD</h4>
              <p>6–9 days · Medium risk</p>
              <span>$6.1k / pallet</span>
            </div>
            <div className="route-card">
              <h4>SEA · SHZ → NY</h4>
              <p>24–29 days · Medium risk</p>
              <span>$2.7k / container</span>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Compliance Checks</h3>
          <div className="checklist">
            <div className="check-row">
              <span className="check-dot" />
              <p>Materials declaration complete</p>
            </div>
            <div className="check-row">
              <span className="check-dot" />
              <p>HTS notes verified</p>
            </div>
            <div className="check-row warn">
              <span className="check-dot" />
              <p>Origin certificate pending</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h3 className="section-title">Recent Insights</h3>
        <div className="insight-grid">
          <div className="insight-card">
            <h4>Origin sensitivity</h4>
            <p>High duty variance across alternate sourcing regions.</p>
          </div>
          <div className="insight-card">
            <h4>Customs alerts</h4>
            <p>Two recent rule changes may affect shipment timing.</p>
          </div>
          <div className="insight-card">
            <h4>Cost optimization</h4>
            <p>Consolidate shipments to reduce clearance fees.</p>
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
          <button className="button-primary" type="button">
            Save analysis
          </button>
        </div>
      </section>
    </div>
  )
}
