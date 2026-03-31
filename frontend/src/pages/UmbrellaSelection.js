import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const colorConfig = [
  { key: 'red',    hex: '#EF4444', label: 'Red' },
  { key: 'blue',   hex: '#3B82F6', label: 'Blue' },
  { key: 'yellow', hex: '#EAB308', label: 'Yellow' },
  { key: 'black',  hex: '#374151', label: 'Black' },
  { key: 'green',  hex: '#10B981', label: 'Green' },
];

const UmbrellaSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [umbrellas, setUmbrellas] = useState([]);
  const [selectedUmbrellas, setSelectedUmbrellas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterColor, setFilterColor] = useState('');

  const fetchUmbrellas = useCallback(async () => {
    try {
      const response = await api.get('/umbrellas');
      setUmbrellas(response.data);
    } catch {
      // Failed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUmbrellas();
  }, [fetchUmbrellas]);

  const available = useMemo(() => umbrellas.filter(u => u.isAvailable), [umbrellas]);

  // Build location → color → umbrella[] map
  const locationMap = useMemo(() => {
    const map = {};
    available.forEach(u => {
      const loc = u.location?.address?.split(',')[0]?.trim() || 'Unknown';
      if (!map[loc]) {
        map[loc] = { total: 0, colors: {} };
        colorConfig.forEach(c => { map[loc].colors[c.key] = []; });
      }
      map[loc].total++;
      if (map[loc].colors[u.color]) map[loc].colors[u.color].push(u);
    });
    return map;
  }, [available]);

  // Filtered rows
  const rows = useMemo(() => {
    let entries = Object.entries(locationMap).sort((a, b) => b[1].total - a[1].total);
    if (filterLocation) entries = entries.filter(([loc]) => loc.includes(filterLocation));
    return entries;
  }, [locationMap, filterLocation]);

  const allLocations = useMemo(() =>
    Object.keys(locationMap).sort(),
  [locationMap]);

  // Add N umbrellas of a color from a location
  const addFromCell = (locationName, colorKey, count) => {
    const cellUmbrellas = locationMap[locationName]?.colors[colorKey] || [];
    // Get IDs not already selected
    const unselected = cellUmbrellas.filter(u => !selectedUmbrellas.includes(u._id));
    const toAdd = unselected.slice(0, count).map(u => u._id);
    if (toAdd.length > 0) {
      setSelectedUmbrellas(prev => [...prev, ...toAdd]);
    }
  };

  // Remove one umbrella of a color from a location
  const removeFromCell = (locationName, colorKey) => {
    const cellIds = (locationMap[locationName]?.colors[colorKey] || []).map(u => u._id);
    const selectedInCell = selectedUmbrellas.filter(id => cellIds.includes(id));
    if (selectedInCell.length > 0) {
      const idToRemove = selectedInCell[selectedInCell.length - 1];
      setSelectedUmbrellas(prev => prev.filter(id => id !== idToRemove));
    }
  };

  // Count selected in a cell
  const selectedInCell = (locationName, colorKey) => {
    const cellIds = (locationMap[locationName]?.colors[colorKey] || []).map(u => u._id);
    return selectedUmbrellas.filter(id => cellIds.includes(id)).length;
  };

  const handleRent = async () => {
    if (selectedUmbrellas.length === 0) return;
    // Removal: if (!user?.depositMade) { navigate('/wallet'); return; }
    try {
      await api.post('/rentals/start-multiple', { umbrellaIds: selectedUmbrellas });
      navigate('/tracking');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start rental');
    }
  };

  const clearSelection = () => setSelectedUmbrellas([]);
  // Removal: const needsDeposit = !user?.depositMade;

  const totalSelected = selectedUmbrellas.length;

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content flex items-center justify-center py-20">
          <div className="spinner mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">Umbrellas</h1>
            <p className="page-subtitle">
              {available.length} available · {rows.length} location{rows.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-100 rounded-lg p-0.5">
              {['table', 'map'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-surface-900 shadow-soft'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Removal: needsDeposit banner */}

        {/* Selection Bar */}
        {totalSelected > 0 && (
          <div className="card mb-4 border-brand-200 bg-brand-50 animate-fade-in">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-brand-700">{totalSelected}</span>
                <span className="text-sm text-brand-700 font-medium">umbrella{totalSelected !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearSelection} className="btn-ghost text-sm">Clear All</button>
                <button onClick={handleRent} className="btn-success">Rent Selected</button>
              </div>
            </div>
            {/* Individual chips — one per selected umbrella */}
            <div className="flex flex-wrap gap-2">
              {selectedUmbrellas.map((id) => {
                const umb = umbrellas.find((u) => u._id === id);
                if (!umb) return null;
                const colorHex = colorConfig.find((c) => c.key === umb.color)?.hex || '#6366f1';
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-white border border-brand-200 text-brand-800 shadow-sm"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    {umb.umbrellaId}
                    <button
                      onClick={() => setSelectedUmbrellas((prev) => prev.filter((i) => i !== id))}
                      className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-brand-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={`Remove ${umb.umbrellaId}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'map' ? (
          <MapView
            umbrellas={available}
            selectedUmbrellas={selectedUmbrellas}
            onUmbrellaSelect={(id) =>
              setSelectedUmbrellas(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
          />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="input-field sm:max-w-xs"
              >
                <option value="">All Locations</option>
                {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <select
                value={filterColor}
                onChange={e => setFilterColor(e.target.value)}
                className="input-field sm:max-w-[180px]"
              >
                <option value="">All Colors</option>
                {colorConfig.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                      <th className="text-left px-4 py-3 font-semibold text-surface-600 whitespace-nowrap">
                        Location
                      </th>
                      {colorConfig
                        .filter(c => !filterColor || c.key === filterColor)
                        .map(c => (
                        <th key={c.key} className="text-center px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="font-semibold text-surface-600">{c.label}</span>
                          </div>
                        </th>
                      ))}
                      <th className="text-center px-4 py-3 font-semibold text-surface-600 whitespace-nowrap">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(([locationName, data]) => {
                      const visibleColors = colorConfig.filter(c => !filterColor || c.key === filterColor);
                      return (
                        <tr
                          key={locationName}
                          className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition-colors"
                        >
                          {/* Location */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs flex-shrink-0">
                                📍
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-surface-900 truncate">{locationName}</p>
                              </div>
                            </div>
                          </td>

                          {/* Color cells */}
                          {visibleColors.map(c => {
                            const cellItems = data.colors[c.key] || [];
                            const count = cellItems.length;
                            const selected = selectedInCell(locationName, c.key);
                            const canAdd = count - selected > 0;

                            if (count === 0) {
                              return (
                                <td key={c.key} className="text-center px-3 py-3">
                                  <span className="text-surface-300">—</span>
                                </td>
                              );
                            }

                            return (
                              <td key={c.key} className="text-center px-3 py-3">
                                <div className="inline-flex items-center gap-1 rounded-lg border border-surface-200 bg-white">
                                  {/* Minus button */}
                                  <button
                                    onClick={() => removeFromCell(locationName, c.key)}
                                    disabled={selected === 0}
                                    className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 
                                               rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:text-surface-400 disabled:hover:bg-transparent"
                                    title="Remove one"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" d="M5 12h14" />
                                    </svg>
                                  </button>

                                  {/* Count display */}
                                  <div className="min-w-[40px] px-1 py-1 text-center">
                                    {selected > 0 ? (
                                      <span className="font-mono font-bold text-brand-600">{selected}</span>
                                    ) : (
                                      <span className="font-mono text-surface-500">{count}</span>
                                    )}
                                    {selected > 0 && (
                                      <span className="text-[10px] text-surface-400 font-normal">/{count}</span>
                                    )}
                                  </div>

                                  {/* Plus button */}
                                  <button
                                    onClick={() => addFromCell(locationName, c.key, 1)}
                                    disabled={!canAdd}
                                    className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-brand-600 hover:bg-brand-50 
                                               rounded-r-lg transition-colors disabled:opacity-30 disabled:hover:text-surface-400 disabled:hover:bg-transparent"
                                    title="Add one"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            );
                          })}

                          {/* Total */}
                          <td className="text-center px-4 py-3">
                            <span className="font-mono font-semibold text-surface-700">{data.total}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {rows.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-surface-400 text-sm">No umbrellas match your filters.</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-surface-400 px-1">
              <span>Tap <strong>+</strong> to add an umbrella · <strong>−</strong> to remove</span>
              <span>Numbers show <strong className="text-brand-600">selected</strong> / available</span>
              <span>₹7/hr · ₹70/day cap</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UmbrellaSelection;
