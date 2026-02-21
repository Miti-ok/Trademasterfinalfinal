import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const toCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)

const toPercent = (value) => `${Number(value || 0).toFixed(1)}%`

export default function DutyBreakdown({ materials = [], tariffSummary }) {
  const pieData = materials.map((material) => ({
    name: material.name,
    value: Number(material.percentage || 0)
  }))

  const breakdown = tariffSummary?.duty_breakdown || tariffSummary?.items || []
  const barData = Array.isArray(breakdown)
    ? breakdown.map((item) => ({
        name: item.name || item.material || 'Duty',
        duty: Number(item.duty || item.amount || 0)
      }))
    : Object.entries(breakdown).map(([name, duty]) => ({ name, duty: Number(duty || 0) }))

  const totalDuty = tariffSummary?.total_duty || barData.reduce((sum, item) => sum + item.duty, 0)

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <h3 className="section-title">Duty Breakdown</h3>
        <p className="text-sm text-white/70">Total {toCurrency(totalDuty)}</p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="h-56">
          <p className="label">Material Composition</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} fill="#0E5CAD" />
              <Tooltip formatter={(value) => toPercent(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-56">
          <p className="label">Duty by Material</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#E8EDF2', fontSize: 10 }} />
              <YAxis tick={{ fill: '#E8EDF2', fontSize: 10 }} />
              <Tooltip formatter={(value) => toCurrency(value)} />
              <Bar dataKey="duty" fill="#E26B2B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
