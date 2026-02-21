import { Link } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis.js'

export default function Dashboard() {
  const { analysis, tariffSummary, riskScore, materials } = useAnalysis()

  return (
    <div className="space-y-8">
      <section className="glass-panel p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="label">Trade Intelligence Dashboard</p>
            <h2 className="mt-3 font-display text-3xl">Model-driven global tariff forecasting.</h2>
            <p className="mt-4 text-sm text-white/70">
              Run AI classification, simulate duty impacts, and visualize sourcing risk in one workflow.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link className="button-primary" to="/new">
                New Analysis
              </Link>
              {analysis && (
                <Link className="button-secondary" to="/results">
                  View Latest Results
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="label">Latest HS Code</p>
              <p className="mt-3 text-2xl font-semibold">
                {analysis?.hs_code || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="label">Risk Score</p>
              <p className="mt-3 text-2xl font-semibold">
                {riskScore ?? '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="label">Materials</p>
              <p className="mt-3 text-2xl font-semibold">
                {materials?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid">
        <div className="glass-panel p-6">
          <h3 className="section-title">Duty Simulation</h3>
          <p className="mt-3 text-sm text-white/70">
            Update material composition and see instant tariff recalculations and duty impact.
          </p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Compliance Map</h3>
          <p className="mt-3 text-sm text-white/70">
            Track origin, manufacturing, and destination flows across a live sourcing map.
          </p>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">AI Summary</h3>
          <p className="mt-3 text-sm text-white/70">
            Auto-generate executive insights, risk advisories, and optimization actions.
          </p>
        </div>
      </section>

      {tariffSummary && (
        <section className="glass-panel p-6">
          <h3 className="section-title">Latest Duty Snapshot</h3>
          <p className="mt-3 text-sm text-white/70">
            Total duty: {tariffSummary.total_duty ?? '—'} | Effective rate: {tariffSummary.effective_rate ?? '—'}
          </p>
        </section>
      )}
    </div>
  )
}
