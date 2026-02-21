import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis.js'

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read image file.'))
        return
      }
      const [, base64] = reader.result.split(',')
      resolve(base64 || '')
    }
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })

export default function NewAnalysisChoice() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { loading, error, runAnalysis, setTradeRoute, setError } = useAnalysis()

  const runImageAnalysis = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      const imageBase64 = await toBase64(file)
      const productName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Uploaded product'

      const data = await runAnalysis({
        product_name: productName,
        description: '',
        image_base64: imageBase64,
        manufacturing_country: 'US',
        destination_country: 'DE',
        declared_value: 1000
      })

      if (Array.isArray(data?.map_flow) && data.map_flow.length >= 2) {
        setTradeRoute(data.map_flow)
      }

      navigate('/results')
    } catch {
      // Error is already set in context.
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <motion.div
          className="choice-tile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="choice-glow" />
          <h3>Upload photo</h3>
          <p>Run image-first AI analysis automatically with default route settings.</p>
          <button className="tile-link" type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? 'Analyzing...' : 'Select image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="file-input"
            aria-label="Upload product image"
            onChange={runImageAnalysis}
          />
          {error && <p className="mt-2 text-sm text-ember">{error.message || 'Image analysis failed.'}</p>}
        </motion.div>
        <motion.div
          className="choice-tile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="choice-glow" />
          <h3>Enter details manually</h3>
          <p>Provide product specs, materials, and destination.</p>
          <Link className="tile-link" to="/analysis">
            Continue
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
