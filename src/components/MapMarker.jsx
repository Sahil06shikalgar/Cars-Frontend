import L from 'leaflet'
import { Marker } from 'react-leaflet'

const findIcon = (label, accent, initials, hue, done) =>
  L.divIcon({
    className: '',
    html: `
      <div class="dl-pin dl-pin--${accent}${done ? ' dl-pin--done' : ''}" style="--hue:${hue}">
        <span class="dl-pin__pin">
          <span class="dl-pin__photo">${initials}</span>
        </span>
        <span class="dl-pin__label">${label}</span>
      </div>`,
    iconSize: [70, 62],
    iconAnchor: [35, 42],
  })

export function MapMarker({ geo, label = 'Find', accent = 'red', initials = '1:64', hue = 20, done = false }) {
  if (!geo) return null
  return <Marker position={[geo.lat, geo.lng]} icon={findIcon(label, accent, initials, hue, done)} />
}