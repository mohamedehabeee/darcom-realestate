import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Maximize2, BedDouble, Layers } from 'lucide-react';

const CITY_COORDS = {
  'New Cairo': [30.017, 31.491],
  'Sheikh Zayed': [30.044, 30.985],
  'New Capital': [30.015, 31.745],
  Maadi: [29.96, 31.267],
  'North Coast': [30.975, 28.775],
  'Ain Sokhna': [29.455, 32.455],
};

const TILE_LAYERS = {
  street: {
    label: 'Street',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  dark: {
    label: 'Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
};

function formatShortPrice(price, purpose) {
  if (purpose === 'Rent') return `${Math.round(price / 1000)}K/mo`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  return `${Math.round(price / 1000)}K`;
}

function hashUnitId(id) {
  const str = String(id || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function PropertyMap({ units, onSelectUnit }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerByIdRef = useRef({});

  const [tileStyle, setTileStyle] = useState('street');
  const [activeUnitId, setActiveUnitId] = useState(null);

  const unitsWithCoords = useMemo(() => {
    return units.map((unit) => {
      const base = CITY_COORDS[unit.city] || [30.044, 31.235];
      const h = hashUnitId(unit.id);
      const offsetLat = ((h % 7) - 3) * 0.009;
      const offsetLng = (((h >> 3) % 7) - 3) * 0.012;
      return {
        ...unit,
        lat: base[0] + offsetLat,
        lng: base[1] + offsetLng,
      };
    });
  }, [units]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [30.04, 31.24],
      zoom: 10,
      scrollWheelZoom: true,
    });

    tileLayerRef.current = L.tileLayer(TILE_LAYERS.street.url, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[tileStyle].url, {
      attribution: '&copy; OpenStreetMap &amp; Esri',
    }).addTo(map);
  }, [tileStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerByIdRef.current = {};
    if (unitsWithCoords.length === 0) return;

    const bounds = [];

    unitsWithCoords.forEach((unit) => {
      bounds.push([unit.lat, unit.lng]);
      const isSelected = unit.id === activeUnitId;
      const label = formatShortPrice(unit.price, unit.purpose);

      const icon = L.divIcon({
        className: 'darcom-map-pin',
        html: `<div style="background:${isSelected ? '#C59B27' : '#111111'};color:${isSelected ? '#111111' : '#C59B27'};border:1.5px solid #C59B27;padding:4px 9px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,0.4);">${label}</div>`,
        iconSize: [72, 28],
        iconAnchor: [36, 14],
      });

      const marker = L.marker([unit.lat, unit.lng], { icon }).addTo(layer);

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <img src="${unit.image}" alt="" style="width:100%;height:115px;object-fit:cover;margin-bottom:8px;" />
        <div style="font-size:11px;color:#C59B27;font-weight:700;text-transform:uppercase;">${unit.status} • ${unit.compound}</div>
        <div style="font-size:14px;font-weight:700;color:#111111;margin:3px 0;">${unit.title}</div>
        <div style="font-size:11px;color:#555555;margin-bottom:6px;">${unit.area} m² • ${unit.bedrooms || 'Office'} Beds • ${unit.bathrooms} Baths</div>
        <div style="font-size:14px;font-weight:700;color:#111111;margin-bottom:8px;">${new Intl.NumberFormat('en-EG').format(unit.price)} EGP</div>
      `;

      const btn = document.createElement('button');
      btn.textContent = 'View Full Details →';
      btn.style.cssText =
        'width:100%;padding:8px 10px;background:#111111;color:#C59B27;font-size:11px;font-weight:700;border:none;cursor:pointer;';
      btn.onclick = () => onSelectUnit(unit);
      popupContent.appendChild(btn);

      marker.bindPopup(popupContent);
      marker.on('click', () => setActiveUnitId(unit.id));
      markerByIdRef.current[unit.id] = marker;
    });

    if (!activeUnitId && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
    }
  }, [unitsWithCoords, activeUnitId, onSelectUnit]);

  const focusUnit = (unit) => {
    setActiveUnitId(unit.id);
    const map = mapInstanceRef.current;
    const marker = markerByIdRef.current[unit.id];
    if (map) {
      map.flyTo([unit.lat, unit.lng], 13, { duration: 0.8 });
    }
    if (marker) {
      setTimeout(() => marker.openPopup(), 350);
    }
  };

  const flyToCity = (cityName) => {
    setActiveUnitId(null);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (cityName === 'All') {
      const bounds = unitsWithCoords.map((u) => [u.lat, u.lng]);
      if (bounds.length) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
      return;
    }
    const coords = CITY_COORDS[cityName];
    if (coords) {
      map.flyTo(coords, 12, { duration: 0.9 });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-black/15 dark:border-white/15 bg-white dark:bg-[#161616] overflow-hidden">
      {/* Left Interactive List */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 max-h-[300px] lg:max-h-[600px] overflow-y-auto divide-y divide-black/10 dark:divide-white/10">
        {unitsWithCoords.map((unit) => {
          const selected = unit.id === activeUnitId;
          return (
            <div
              key={unit.id}
              onClick={() => focusUnit(unit)}
              className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                selected
                  ? 'bg-[#C59B27]/15 border-l-4 border-l-[#C59B27]'
                  : 'hover:bg-[#FAF8F5] dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <img
                src={unit.image}
                alt={unit.title}
                className="w-20 h-20 object-cover shrink-0 bg-neutral-200"
              />
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-[#C59B27] font-semibold flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {unit.compound} • {unit.city}
                  </p>
                  <h4 className="text-sm font-semibold text-[#111111] dark:text-white truncate mt-0.5">
                    {unit.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <span className="text-xs font-bold text-[#111111] dark:text-white">
                    {new Intl.NumberFormat('en-EG').format(unit.price)} EGP
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-[#111111]/60 dark:text-white/60">
                    <span className="inline-flex items-center gap-0.5">
                      <Maximize2 className="w-3 h-3 text-[#C59B27]" />
                      {unit.area}m²
                    </span>
                    {unit.bedrooms > 0 && (
                      <span className="inline-flex items-center gap-0.5">
                        <BedDouble className="w-3 h-3 text-[#C59B27]" />
                        {unit.bedrooms}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Map Canvas */}
      <div className="lg:col-span-8 relative h-[420px] sm:h-[520px] lg:h-[600px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Style Switcher */}
        <div className="absolute top-3 right-3 z-20 flex items-center bg-[#111111]/90 border border-white/15 p-1 gap-1">
          <Layers className="w-3.5 h-3.5 text-[#C59B27] mx-1.5" />
          {Object.entries(TILE_LAYERS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTileStyle(key)}
              className={`px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                tileStyle === key
                  ? 'bg-[#C59B27] text-[#111111]'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Quick City Jump Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap gap-1.5 pointer-events-none">
          {['All', ...Object.keys(CITY_COORDS)].map((city) => (
            <button
              key={city}
              onClick={() => flyToCity(city)}
              className="pointer-events-auto px-2.5 py-1 bg-[#111111]/90 border border-white/15 text-[11px] font-medium text-white hover:border-[#C59B27] hover:text-[#C59B27] transition-colors cursor-pointer"
            >
              {city === 'All' ? 'All Egypt' : city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}