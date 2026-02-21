export default function SavedAnalysis() {
  return (
    <div className="space-y-10">
      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Saved Analysis</p>
            <h2 className="section-title">Your Intelligence Library</h2>
          </div>
          <a className="button-secondary" href="/new">New analysis</a>
        </div>
        <p className="mt-3 text-sm text-[color:var(--text-muted)]">
          Review past classifications, duty forecasts, and sourcing scenarios. Filter by region,
          product, or last updated.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Performance Jackets', meta: 'HS 6101.30 · Updated 2 days ago' },
            { title: 'Smart Kitchenware', meta: 'HS 8516.79 · Updated 1 week ago' },
            { title: 'Audio Accessories', meta: 'HS 8518.30 · Updated 3 weeks ago' }
          ].map((item) => (
            <div key={item.title} className="insight-card">
              <h4>{item.title}</h4>
              <p>{item.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <h3 className="section-title">Pinned Playbooks</h3>
          <div className="list-stack">
            <div>
              <p className="list-title">EU Apparel Compliance</p>
              <p className="list-sub">Updated tariff guidance and origin rules.</p>
            </div>
            <div>
              <p className="list-title">North America Lane Review</p>
              <p className="list-sub">Transit, duty, and logistics benchmarking.</p>
            </div>
            <div>
              <p className="list-title">Electronics Risk Watch</p>
              <p className="list-sub">Priority alerts and sourcing alternatives.</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6">
          <h3 className="section-title">Upcoming Reviews</h3>
          <div className="checklist">
            <div className="check-row">
              <span className="check-dot" />
              <p>Update EU duty exposure summary</p>
            </div>
            <div className="check-row">
              <span className="check-dot" />
              <p>Run Q2 supplier mix scenario</p>
            </div>
            <div className="check-row warn">
              <span className="check-dot" />
              <p>Verify India textile origin documents</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
