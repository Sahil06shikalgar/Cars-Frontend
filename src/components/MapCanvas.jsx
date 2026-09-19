import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LocationLayer } from './LocationLayer.jsx'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'

export function MapCanvas({ center, markers, tracking, recenterSignal = 0, onStatus }) {
  return (
    <div className="map-canvas">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        minZoom={1}
        maxZoom={19}
        scrollWheelZoom
        zoomControl={false}
        className="map-canvas__leaf"
        worldCopyJump
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {markers}
        <LocationLayer enabled={tracking} recenterSignal={recenterSignal} onStatus={onStatus} />
      </MapContainer>
      <div className="map-canvas__vignette" aria-hidden="true" />
    </div>
  )
}