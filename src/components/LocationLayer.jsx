import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { Circle, Marker, useMap } from 'react-leaflet'

const SELF_ICON = L.divIcon({
  className: '',
  html: '<span class="loc-dot"></span>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
})

const ACCURACY = {
  color: '#2e9fff',
  weight: 1.5,
  opacity: 0.7,
  fillColor: '#1f9fff',
  fillOpacity: 0.14,
  interactive: false,
}

export function LocationLayer({ enabled, recenterSignal = 0, onStatus }) {
  const map = useMap()
  const [pos, setPos] = useState(null)
  const watchRef = useRef(null)
  const firstRef = useRef(true)

  useEffect(() => {
    if (!enabled) {
      if (watchRef.current != null) {
        navigator.geolocation?.clearWatch(watchRef.current)
        watchRef.current = null
      }
      firstRef.current = true
      return
    }

    if (!('geolocation' in navigator)) {
      onStatus?.('error', null, 'Geolocation is not supported in this browser.')
      return
    }

    firstRef.current = true
    onStatus?.('locating')

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.max(5, position.coords.accuracy || 20),
        }
        setPos(next)
        if (firstRef.current) {
          firstRef.current = false
          map.setView([next.lat, next.lng], Math.max(15, map.getZoom()), { animate: true })
        }
        onStatus?.('tracking', next)
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — allow location for this site, then try again.'
            : err.code === err.TIMEOUT
              ? 'Location timed out — check your GPS signal and try again.'
              : 'Location unavailable right now — try again in a moment.'
        onStatus?.('error', null, msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )

    watchRef.current = watchId
    return () => {
      navigator.geolocation.clearWatch(watchId)
      watchRef.current = null
    }
  }, [enabled, map, onStatus])

  useEffect(() => {
    if (recenterSignal > 0 && enabled && pos) {
      map.setView([pos.lat, pos.lng], Math.max(15, map.getZoom()), { animate: true })
    }
  }, [recenterSignal, enabled, pos, map])

  if (!pos) return null

  return (
    <>
      <Circle center={[pos.lat, pos.lng]} radius={pos.accuracy} pathOptions={ACCURACY} />
      <Marker position={[pos.lat, pos.lng]} icon={SELF_ICON} zIndexOffset={1000} />
    </>
  )
}