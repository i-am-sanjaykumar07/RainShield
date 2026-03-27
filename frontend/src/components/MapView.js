import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const colorMap = {
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#EAB308',
  black: '#374151',
  green: '#10B981',
};

const MapView = ({ umbrellas, selectedUmbrellas = [], onUmbrellaSelect }) => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-surface-200">
      <MapContainer
        center={[30.7575, 76.5660]}
        zoom={16}
        style={{ width: '100%', height: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {umbrellas.map((umbrella) => {
          if (!umbrella.location?.latitude || !umbrella.location?.longitude) return null;

          const isSelected = selectedUmbrellas.includes(umbrella._id);
          const isAvailable = umbrella.isAvailable;
          const fillColor = isAvailable ? (colorMap[umbrella.color] || '#94a3b8') : '#94a3b8';

          return (
            <CircleMarker
              key={umbrella._id}
              center={[umbrella.location.latitude, umbrella.location.longitude]}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                fillColor,
                fillOpacity: isAvailable ? 0.85 : 0.35,
                color: isSelected ? '#1e293b' : '#ffffff',
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  if (isAvailable && onUmbrellaSelect) onUmbrellaSelect(umbrella._id);
                },
              }}
            >
              <Popup>
                <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 160 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                    {umbrella.umbrellaId}
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                    {umbrella.color} · {isAvailable ? 'Available' : 'Rented'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                    {umbrella.location.address || 'CU Campus'}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg border border-surface-200 px-3 py-2 shadow-soft">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Legend</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(colorMap).map(([color, hex]) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hex }} />
              <span className="text-xs text-surface-600 capitalize">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;