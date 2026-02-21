import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

const getCoord = (node) => {
  if (!node) return null
  if (Array.isArray(node.coordinates)) return node.coordinates
  if (typeof node.lon === 'number' && typeof node.lat === 'number') return [node.lon, node.lat]
  if (typeof node.lng === 'number' && typeof node.lat === 'number') return [node.lng, node.lat]
  return null
}

const buildLineFeatures = (nodes = [], edges = []) => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  return edges
    .map((edge) => {
      const source = nodeMap.get(edge.source) || edge.source
      const target = nodeMap.get(edge.target) || edge.target
      const start = getCoord(source)
      const end = getCoord(target)
      if (!start || !end) return null
      return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [start, end] },
        properties: { id: edge.id || `${edge.source}-${edge.target}` }
      }
    })
    .filter(Boolean)
}

export default function MapVisualization({ mapFlow }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.2,
      projection: 'globe'
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }))

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapFlow) return

    const nodes = mapFlow.nodes || []
    const edges = mapFlow.edges || []

    const pointFeatures = nodes
      .map((node) => {
        const coords = getCoord(node)
        if (!coords) return null
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: { id: node.id, label: node.name || node.id || 'Node', role: node.type }
        }
      })
      .filter(Boolean)

    const lineFeatures = buildLineFeatures(nodes, edges)

    if (map.getSource('flows')) {
      map.getSource('flows').setData({ type: 'FeatureCollection', features: lineFeatures })
    } else {
      map.addSource('flows', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: lineFeatures }
      })
      map.addLayer({
        id: 'flows-line',
        type: 'line',
        source: 'flows',
        paint: {
          'line-color': '#0E5CAD',
          'line-width': 2,
          'line-opacity': 0.8
        }
      })
    }

    if (map.getSource('nodes')) {
      map.getSource('nodes').setData({ type: 'FeatureCollection', features: pointFeatures })
    } else {
      map.addSource('nodes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: pointFeatures }
      })
      map.addLayer({
        id: 'nodes-circle',
        type: 'circle',
        source: 'nodes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#E26B2B',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      })
    }

    if (pointFeatures.length > 0) {
      const bounds = pointFeatures.reduce((b, feature) => {
        const [lng, lat] = feature.geometry.coordinates
        return b.extend([lng, lat])
      }, new mapboxgl.LngLatBounds(pointFeatures[0].geometry.coordinates, pointFeatures[0].geometry.coordinates))
      map.fitBounds(bounds, { padding: 80, duration: 800 })
    }
  }, [mapFlow])

  const tokenMissing = !import.meta.env.VITE_MAPBOX_TOKEN

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <h3 className="section-title">Global Sourcing Flow</h3>
        {tokenMissing && <span className="text-xs text-ember">Mapbox token missing</span>}
      </div>
      <div className="mt-4 h-[320px] overflow-hidden rounded-2xl border border-white/10">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      {!mapFlow && (
        <p className="mt-3 text-sm text-white/60">No map data available yet.</p>
      )}
    </div>
  )
}
