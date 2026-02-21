import { Link, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis.js'

export default function SavedAnalysis() {
  const navigate = useNavigate()
  const { savedAnalyses, loadSavedAnalysis, deleteSavedAnalysis } = useAnalysis()

  const openSaved = (savedId) => {
    try {
      loadSavedAnalysis(savedId)
      navigate('/results')
    } catch {
      // Keep user on this page if the entry is invalid.
    }
  }

  return (
    <div className="space-y-10">
      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Saved Analysis</p>
            <h2 className="section-title">Your Intelligence Library</h2>
          </div>
          <Link className="button-secondary" to="/new">New analysis</Link>
        </div>
        <p className="mt-3 text-sm text-[color:var(--text-muted)]">
          Reopen any saved run to view HS classification, duty and risk outputs.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedAnalyses.length === 0 && (
            <div className="insight-card">
              <h4>No saved analyses yet</h4>
              <p>Run an analysis and click Save analysis on the results screen.</p>
            </div>
          )}
          {savedAnalyses.map((entry) => {
            const payload = entry.payload || {}
            const analysis = payload.analysis || {}
            const tariffSummary = payload.tariffSummary || {}
            const savedAt = entry.saved_at ? new Date(entry.saved_at).toLocaleString() : 'Unknown'
            return (
              <div key={entry.id} className="insight-card">
                <h4>{entry.title || 'Saved analysis'}</h4>
                <p>
                  HS {analysis.hs_code || 'N/A'} · Duty {Number(tariffSummary.total_duty_percent || 0).toFixed(1)}%
                </p>
                <p>Saved {savedAt}</p>
                <div className="mt-4 flex gap-2">
                  <button className="button-secondary" type="button" onClick={() => openSaved(entry.id)}>
                    Open
                  </button>
                  <button className="button-secondary" type="button" onClick={() => deleteSavedAnalysis(entry.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
