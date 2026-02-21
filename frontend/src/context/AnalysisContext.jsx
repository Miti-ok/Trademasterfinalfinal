import { createContext, useCallback, useMemo, useState } from 'react'

export const AnalysisContext = createContext(null)
const SAVED_ANALYSES_KEY = 'saved_analyses_v1'

const initialState = {
  analysis: null,
  materials: [],
  tariffSummary: null,
  riskScore: null,
  mapFlow: null,
  report: null,
  tradeRoute: null
}

const loadSavedAnalysesFromStorage = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SAVED_ANALYSES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistSavedAnalyses = (items) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(items))
}

export const AnalysisProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedAnalyses, setSavedAnalyses] = useState(loadSavedAnalysesFromStorage)

  const setAnalysisPayload = useCallback((payload) => {
    if (!payload) return
    setState((prev) => ({
      ...prev,
      analysis: {
        analysis_id: payload.analysis_id,
        hs_code: payload.hs_code,
        confidence: payload.confidence,
        explanation: payload.explanation ?? null,
        manufacturing_country: payload.manufacturing_country ?? null,
        destination_country: payload.destination_country ?? null,
        declared_value: payload.declared_value ?? null
      },
      materials: payload.materials || [],
      tariffSummary: payload.tariff_summary || null,
      riskScore: payload.risk_score ?? null,
      mapFlow: payload.map_flow || null
    }))
  }, [])

  const updateMaterials = useCallback((materials) => {
    setState((prev) => ({ ...prev, materials }))
  }, [])

  const updateResults = useCallback(({ tariffSummary, riskScore, mapFlow, analysisPatch }) => {
    setState((prev) => ({
      ...prev,
      analysis: analysisPatch
        ? {
            ...(prev.analysis || {}),
            ...analysisPatch
          }
        : prev.analysis,
      tariffSummary: tariffSummary ?? prev.tariffSummary,
      riskScore: riskScore ?? prev.riskScore,
      mapFlow: mapFlow ?? prev.mapFlow
    }))
  }, [])

  const setReport = useCallback((report) => {
    setState((prev) => ({ ...prev, report }))
  }, [])

  const setTradeRoute = useCallback((tradeRoute) => {
    setState((prev) => ({ ...prev, tradeRoute }))
  }, [])

  const saveCurrentAnalysis = useCallback(
    (title) => {
      if (!state.analysis) {
        throw new Error('No analysis available to save.')
      }

      const safeTitle = (title || '').trim()
      const autoTitle = safeTitle || `HS ${state.analysis.hs_code || 'Unknown'} Analysis`
      const savedId = state.analysis.analysis_id || `local-${Date.now()}`

      const entry = {
        id: savedId,
        title: autoTitle,
        saved_at: new Date().toISOString(),
        payload: {
          analysis: state.analysis,
          materials: state.materials,
          tariffSummary: state.tariffSummary,
          riskScore: state.riskScore,
          mapFlow: state.mapFlow,
          report: state.report,
          tradeRoute: state.tradeRoute
        }
      }

      setSavedAnalyses((prev) => {
        const next = [entry, ...prev.filter((item) => item.id !== savedId)]
        persistSavedAnalyses(next)
        return next
      })

      return entry
    },
    [state]
  )

  const loadSavedAnalysis = useCallback((savedId) => {
    const entry = savedAnalyses.find((item) => item.id === savedId)
    if (!entry) {
      throw new Error('Saved analysis not found.')
    }

    const payload = entry.payload || {}
    setState((prev) => ({
      ...prev,
      analysis: payload.analysis ?? prev.analysis,
      materials: payload.materials ?? prev.materials,
      tariffSummary: payload.tariffSummary ?? prev.tariffSummary,
      riskScore: payload.riskScore ?? prev.riskScore,
      mapFlow: payload.mapFlow ?? prev.mapFlow,
      report: payload.report ?? prev.report,
      tradeRoute: payload.tradeRoute ?? prev.tradeRoute
    }))

    return entry
  }, [savedAnalyses])

  const deleteSavedAnalysis = useCallback((savedId) => {
    setSavedAnalyses((prev) => {
      const next = prev.filter((item) => item.id !== savedId)
      persistSavedAnalyses(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      loading,
      error,
      setLoading,
      setError,
      setAnalysisPayload,
      updateMaterials,
      updateResults,
      setReport,
      setTradeRoute,
      savedAnalyses,
      saveCurrentAnalysis,
      loadSavedAnalysis,
      deleteSavedAnalysis,
      reset
    }),
    [
      state,
      loading,
      error,
      setAnalysisPayload,
      updateMaterials,
      updateResults,
      setReport,
      setTradeRoute,
      savedAnalyses,
      saveCurrentAnalysis,
      loadSavedAnalysis,
      deleteSavedAnalysis,
      reset
    ]
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}
