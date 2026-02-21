export default function SummaryCard({ report }) {
  if (!report) {
    return (
      <div className="glass-panel p-6">
        <h3 className="section-title">AI Summary</h3>
        <p className="mt-4 text-sm text-white/60">Generate a report to see the AI summary.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel space-y-4 p-6">
      <div>
        <h3 className="section-title">AI Summary</h3>
        <p className="mt-2 text-sm text-white/70">{report.summary_text}</p>
      </div>
      <div>
        <p className="label">Optimization Suggestions</p>
        <ul className="mt-2 space-y-2 text-sm text-white/70">
          {(report.optimization_suggestions || []).map((item, index) => (
            <li key={`${item}-${index}`}>• {item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="label">Risk Advisory</p>
        <p className="mt-2 text-sm text-white/70">{report.risk_advisory}</p>
      </div>
    </div>
  )
}
