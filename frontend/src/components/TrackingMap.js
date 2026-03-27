import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Rectangle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TrackingMap = ({ rental }) => {
  if (!rental?.umbrella?.location?.latitude || !rental?.umbrella?.location?.longitude) {
    return (
      <div className="w-full h-[280px] rounded-xl border border-surface-200 flex items-center justify-center bg-surface-50">
        <p className="text-surface-400 text-sm">No location data available</p>
      </div>
    );
  }

  const { latitude, longitude } = rental.umbrella.location;
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  return (
    <div className="w-full h-[280px] rounded-xl border border-surface-200 overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={18}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus boundary */}
        <Rectangle
          bounds={[[30.7550, 76.5630], [30.7600, 76.5690]]}
          pathOptions={{
            color: '#6366f1',
            weight: 1.5,
            opacity: 0.5,
            fillColor: '#6366f1',
            fillOpacity: 0.05,
          }}
        />

        {/* Umbrella marker */}
        <CircleMarker
          center={[lat, lng]}
          radius={14}
          pathOptions={{
            fillColor: rental.unlocked ? '#10B981' : '#f59e0b',
            fillOpacity: 0.85,
            color: '#ffffff',
            weight: 3,
          }}
        >
          <Popup>
            <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 180 }}>
              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                {rental.umbrella.umbrellaId}
              </p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                {rental.unlocked ? 'Unlocked' : 'Locked'} · {rental.umbrella.color}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                {rental.umbrella.location.address}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

export default TrackingMap;