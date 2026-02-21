import { motion } from 'framer-motion'

const getTone = (score) => {
  if (score >= 70) return 'text-ember'
  if (score >= 40) return 'text-yellow-400'
  return 'text-moss'
}

export default function RiskScoreCard({ score }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="section-title">Risk Score</h3>
      <div className="mt-6 flex items-center gap-6">
        <div className="relative h-24 w-24">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/10"
            initial={{ rotate: -90 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-ocean"
            style={{ clipPath: 'inset(0 0 0 0 round 999px)' }}
            animate={{ rotate: (score || 0) * 1.8 - 90 }}
            transition={{ duration: 0.8 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-semibold ${getTone(score || 0)}`}>{score ?? '—'}</span>
          </div>
        </div>
        <div className="text-sm text-white/70">
          <p>Composite compliance and duty exposure.</p>
          <p className="mt-2 text-white/50">Lower is better.</p>
        </div>
      </div>
    </div>
  )
}
