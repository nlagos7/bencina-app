import React, { useState, useEffect, useRef } from 'react';
import { Fuel, MapPin, DollarSign, Droplets, Gauge, ChevronDown, Loader2, AlertCircle, ShieldCheck, Route, ArrowRight, Map, Search, RefreshCw, Check, X, Clock, TrendingUp, Store, Calculator, ChevronLeft, ChevronRight, Sparkles, BrainCircuit } from 'lucide-react';

// =====================================================================
// 🛑 CONFIGURACIÓN DE RUTAS Y API
// =====================================================================
const RUTA_ESTACIONES = "/api-cne/api/v4/estaciones"; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const apiKey = ""; // La clave se provee en el entorno de ejecución
// =====================================================================

const REGION_MAP = {
  'arica': 'XV', 'parinacota': 'XV',
  'tarapacá': 'I', 'tarapaca': 'I',
  'antofagasta': 'II', 
  'atacama': 'III',
  'coquimbo': 'IV', 
  'valparaíso': 'V', 'valparaiso': 'V',
  'metropolitana': 'RM', 'santiago': 'RM',
  'higgins': 'VI', 'libertador': 'VI', 
  'maule': 'VII', 
  'ñuble': 'XVI', 'nuble': 'XVI',
  'biobío': 'VIII', 'biobio': 'VIII', 'concepción': 'VIII',
  'araucanía': 'IX', 'araucania': 'IX',
  'los ríos': 'XIV', 'los rios': 'XIV',
  'los lagos': 'X',
  'aysén': 'XI', 'aysen': 'XI',
  'magallanes': 'XII'
};

// --- FUNCIÓN HELPER PARA GEMINI CON EXPONENTIAL BACKOFF ---
async function callGemini(prompt, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    }
  };

  return fetchWithRetry();
}

function extractRegionId(displayName) {
  const lower = displayName.toLowerCase();
  for (const [key, id] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return id;
  }
  return 'RM'; 
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 1.3); 
}

// Generador de Mapa de Ruta (Pestaña 1) con soporte para Ida y Vuelta
function generateMapHtml(origin, dest, geometry, isRoundTrip) {
  if (!origin || !dest) return '';
  const geomStr = geometry ? JSON.stringify(geometry) : 'null';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #f8fafc; }
          #map { width: 100vw; height: 100vh; }
          .marker-origin { background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
          .marker-dest { background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
          .leaflet-control-attribution { display: none !important; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            var originCoord = [${origin.lat}, ${origin.lon}];
            var destCoord = [${dest.lat}, ${dest.lon}];
            var iconOrigin = L.divIcon({ className: 'marker-origin', iconSize: [16, 16] });
            var iconDest = L.divIcon({ className: 'marker-dest', iconSize: [16, 16] });
            L.marker(originCoord, {icon: iconOrigin}).addTo(map);
            L.marker(destCoord, {icon: iconDest}).addTo(map);
            var geometry = ${geomStr};
            
            if (geometry && geometry.coordinates) {
                var coords = geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
                var polyline = L.polyline(coords, {color: '#3b82f6', weight: 5, opacity: 0.8, lineJoin: 'round'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
            } else {
                var polyline = L.polyline([originCoord, destCoord], {color: '#94a3b8', weight: 3, dashArray: '8, 12'}).addTo(map);
                map.fitBounds(polyline.getBounds(), {padding: [30, 30]});
            }

            if (${isRoundTrip ? 'true' : 'false'}) {
                var roundTripCtrl = L.control({position: 'topright'});
                roundTripCtrl.onAdd = function() {
                    var div = L.DomUtil.create('div');
                    div.innerHTML = '<div style="background-color: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; font-family: sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white; display:flex; align-items:center; letter-spacing: 0.5px;">&#8596; IDA Y VUELTA</div>';
                    return div;
                };
                roundTripCtrl.addTo(map);
            }
        </script>
    </body>
    </html>
  `;
}

// Generador de Mapa de Múltiples Estaciones Interactivo (Pestaña 2)
function generateStationsMapHtml(stations, selectedId) {
  if (!stations || stations.length === 0) return '';
  
  const markersJs = stations.map(s => {
    const isSelected = s.id === selectedId;
    const baseColor = s.isOutdated ? '#cbd5e1' : '#94a3b8'; 
    const color = isSelected ? '#3b82f6' : baseColor; 
    const zIndex = isSelected ? 1000 : 1;
    const scale = isSelected ? 'scale(1.4)' : 'scale(1)';
    const shadow = isSelected ? '0 4px 8px rgba(59,130,246,0.5)' : '0 2px 4px rgba(0,0,0,0.3)';
    const iconClass = isSelected ? 'cursor-pointer z-50 relative' : 'cursor-pointer';
    
    return `
      var icon_${s.id.replace(/\W/g, '')} = L.divIcon({ 
         className: '${iconClass}', 
         html: '<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: ${shadow}; transform: ${scale}; transition: all 0.2s ease;"></div>',
         iconSize: [20, 20]
      });
      var marker_${s.id.replace(/\W/g, '')} = L.marker([${s.lat}, ${s.lon}], {icon: icon_${s.id.replace(/\W/g, '')}, zIndexOffset: ${zIndex}})
       .bindPopup("<div style='text-align:center'><b>${s.distribuidor}</b><br/><span style='color:#64748b;font-size:10px;'>${s.direccion}</span></div>")
       .addTo(map);
       
      marker_${s.id.replace(/\W/g, '')}.on('click', function() {
         window.parent.postMessage({ type: 'STATION_CLICKED', id: '${s.id}' }, '*');
      });
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #f8fafc; }
          #map { width: 100vw; height: 100vh; }
          .leaflet-control-attribution { display: none !important; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            ${markersJs}
            var group = new L.featureGroup([
              ${stations.map(s => `L.marker([${s.lat}, ${s.lon}])`).join(',\n')}
            ]);
            map.fitBounds(group.getBounds(), {padding: [20, 20], maxZoom: 15});
        </script>
    </body>
    </html>
  `;
}

// Buscador de Ciudades Optimizada para Ruta (Paso 1 y 2)
const RouteCityAutocomplete = ({ placeholder, value, onSelect, comunasData }) => {
  const [query, setQuery] = useState(value ? value.mainName : '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);

  useEffect(() => { setQuery(value ? value.mainName : ''); }, [value]);

  useEffect(() => {
    if (!isOpen) { setResults([]); return; }
    if (!query || (value && query === value.mainName)) { setResults(comunasData.slice(0, 50)); return; }
    
    const lowerQuery = query.toLowerCase();
    const filtered = comunasData
      .filter(c => c.mainName.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const aLower = a.mainName.toLowerCase();
        const bLower = b.mainName.toLowerCase();
        const aStarts = aLower.startsWith(lowerQuery);
        const bStarts = bLower.startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aLower.localeCompare(bLower);
      }).slice(0, 50);
      
    setResults(filtered);
  }, [query, isOpen, comunasData, value]);

  const handleSelectCity = async (cityName) => {
    setQuery(cityName);
    setIsOpen(false);
    setIsLoadingCoords(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&city=${encodeURIComponent(cityName)}&limit=1`);
      let data = await res.json();

      if (!data || data.length === 0) {
          const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&q=${encodeURIComponent(cityName + ', Chile')}&limit=1`);
          data = await res2.json();
      }

      const fallbackCity = comunasData.find(c => c.mainName === cityName);

      if (data && data.length > 0) {
        onSelect({
          mainName: cityName,
          name: cityName,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          regionId: fallbackCity?.regionId || 'RM'
        });
      } else {
        onSelect(fallbackCity); 
      }
    } catch (err) {
      const fallbackCity = comunasData.find(c => c.mainName === cityName);
      onSelect(fallbackCity);
    } finally {
      setIsLoadingCoords(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => { 
          setQuery(e.target.value); setIsOpen(true); 
          if (value && value.mainName !== e.target.value) onSelect(null);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full p-3.5 pl-4 pr-10 text-[16px] font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white"
      />
      {isLoadingCoords ? (
        <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-blue-500 animate-spin" />
      ) : value && value.mainName === query ? (
        <button 
          onMouseDown={(e) => { e.preventDefault(); setQuery(''); onSelect(null); setIsOpen(true); }}
          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              onMouseDown={(e) => { e.preventDefault(); handleSelectCity(r.mainName); }}
              className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                value?.mainName === r.mainName ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
              } border-b last:border-0 border-slate-100`}
            >
              <span className="text-sm">{r.mainName}</span>
              {value?.mainName === r.mainName && <Check className="w-4 h-4 text-blue-600" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Buscador de Comunas (Paso 1 Carga)
const ComunaAutocomplete = ({ placeholder, value, onSelect, comunas }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    if (!isOpen) { setResults([]); return; }
    if (!query || query === value) { setResults(comunas.slice(0, 50)); return; }
    
    const lowerQuery = query.toLowerCase();
    const filtered = comunas
      .filter(c => c.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      }).slice(0, 50);
    setResults(filtered);
  }, [query, isOpen, comunas, value]);

  const isSelectedMatch = value === query && value !== '';

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => { 
          setQuery(e.target.value); setIsOpen(true); 
          if (value && value !== e.target.value) onSelect('');
        }}
        onFocus={() => { setIsOpen(true); if(!value) setQuery(''); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className={`w-full p-3.5 pl-10 pr-10 text-[16px] font-medium rounded-xl outline-none transition-all border ${
          isSelectedMatch ? 'bg-blue-50/50 border-blue-400 text-blue-900 focus:ring-1 focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-700'
        }`}
      />
      <MapPin className={`absolute left-3.5 top-4 w-4 h-4 ${isSelectedMatch ? 'text-blue-500' : 'text-slate-400'}`} />
      {isSelectedMatch ? (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(''); onSelect(''); setIsOpen(true); }} className="absolute right-3.5 top-4 text-blue-500 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <Search className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li
              key={c}
              onMouseDown={(e) => { e.preventDefault(); setQuery(c); setIsOpen(false); onSelect(c); }}
              className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                value === c ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
              } border-b last:border-0 border-slate-100`}
            >
              <span className="text-sm">{c}</span>
              {value === c && <Check className="w-4 h-4 text-blue-600" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function App() {
  const [calcMode, setCalcMode] = useState('viaje'); 
  const [chargeMode, setChargeMode] = useState('money');
  const [fuelType, setFuelType] = useState('93');
  
  const [inputValue, setInputValue] = useState('');
  const [distanceKm, setDistanceKm] = useState('0');
  const [efficiencyKml, setEfficiencyKml] = useState('12');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  
  const [originCity, setOriginCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapUrl, setMapUrl] = useState('');
  const [stationsMapUrl, setStationsMapUrl] = useState('');
  
  const [cneStations, setCneStations] = useState([]);
  const [cargaComuna, setCargaComuna] = useState('');
  const [currentStation, setCurrentStation] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [authStatus, setAuthStatus] = useState('pending');

  // ✨ ESTADOS PARA LA IA DE GEMINI ✨
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Filtramos las estaciones por comuna, evaluamos caducidad y ordenamos
  const filteredStationsCarga = React.useMemo(() => {
    if (!cargaComuna) return [];
    
    const now = Date.now();
    const OUTDATED_MS = 7 * 24 * 60 * 60 * 1000;

    return cneStations
      .filter(s => s.comuna === cargaComuna && s.precios[fuelType] > 0)
      .map(s => {
         const isOutdated = s.timestampAct === 0 || (now - s.timestampAct > OUTDATED_MS);
         return { ...s, isOutdated };
      })
      .sort((a, b) => {
         if (a.isOutdated && !b.isOutdated) return 1;
         if (!a.isOutdated && b.isOutdated) return -1;
         return a.precios[fuelType] - b.precios[fuelType];
      });
  }, [cneStations, cargaComuna, fuelType]);

  // Resetear página al cambiar comuna o combustible
  useEffect(() => {
    setCurrentPage(1);
  }, [cargaComuna, fuelType]);

  // Auto-seleccionar la estación más barata al cambiar comuna o combustible
  useEffect(() => {
    if (calcMode === 'carga' && cargaComuna && filteredStationsCarga.length > 0) {
       const isValid = currentStation && currentStation.comuna === cargaComuna && currentStation.precios[fuelType] > 0;
       if (!isValid) {
           setCurrentStation(filteredStationsCarga[0]);
       }
    }
  }, [cargaComuna, fuelType, calcMode, filteredStationsCarga, currentStation]);

  // Listener para clics en los pines del iframe del mapa
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'STATION_CLICKED') {
        const clickedId = event.data.id;
        const clickedStation = filteredStationsCarga.find(s => s.id === clickedId);
        if (clickedStation) {
          setCurrentStation(clickedStation);
          const stationIndex = filteredStationsCarga.findIndex(s => s.id === clickedId);
          if (stationIndex !== -1) {
            setCurrentPage(Math.floor(stationIndex / ITEMS_PER_PAGE) + 1);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [filteredStationsCarga]);

  // Generador del mapa de estaciones para el modo Carga
  useEffect(() => {
    if (calcMode === 'carga' && cargaComuna && filteredStationsCarga.length > 0) {
        const html = generateStationsMapHtml(filteredStationsCarga, currentStation?.id);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setStationsMapUrl(url);
        return () => URL.revokeObjectURL(url);
    } else {
        setStationsMapUrl('');
    }
  }, [cargaComuna, fuelType, currentStation?.id, filteredStationsCarga, calcMode]);

  // Generador del mapa de ruta para el modo Viaje
  useEffect(() => {
    if (calcMode === 'viaje' && originCity && destCity && parseFloat(distanceKm) >= 0) {
      const html = generateMapHtml(originCity, destCity, routeGeometry, isRoundTrip);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setMapUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originCity, destCity, routeGeometry, distanceKm, calcMode, isRoundTrip]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (calcMode !== 'viaje') return;
      if (!originCity || !destCity) { setDistanceKm('0'); setRouteGeometry(null); return; }
      if (originCity.lat === destCity.lat && originCity.lon === destCity.lon) { setDistanceKm('0'); setRouteGeometry(null); return; }

      setIsCalculatingRoute(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${originCity.lon},${originCity.lat};${destCity.lon},${destCity.lat}?overview=full&geometries=geojson`, { signal: controller.signal });
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const exactKm = (data.routes[0].distance / 1000).toFixed(1);
          setDistanceKm(exactKm.toString());
          setRouteGeometry(data.routes[0].geometry);
        } else {
          throw new Error('No route found');
        }
      } catch (err) {
        const fallbackDist = calculateHaversineDistance(originCity.lat, originCity.lon, destCity.lat, destCity.lon);
        setDistanceKm(fallbackDist.toString());
        setRouteGeometry(null);
      } finally {
        clearTimeout(timeoutId);
        setIsCalculatingRoute(false);
      }
    };
    fetchRoute();
  }, [originCity, destCity, calcMode]);

  useEffect(() => {
    const fetchPreciosEnVivo = async () => {
      setIsLoading(true);
      setAuthStatus('pending');
      
      const nowTimestamp = Date.now();
      const fallbackStations = [
        { id: 't1', comuna: 'Temuco', distribuidor: 'Copec', direccion: 'Av. Caupolicán 1024', lat: -38.7359, lon: -72.5904, actualizacion: '02-04-2026 09:08', timestampAct: nowTimestamp, precios: { '93': 1320, '95': 1360, '97': 1400, 'diesel': 1050, 'parafina': 950 }, logo: '' },
        { id: 's1', comuna: 'Santiago', distribuidor: 'Copec', direccion: 'Av. Providencia 1234', lat: -33.4489, lon: -70.6693, actualizacion: '02-04-2026 09:08', timestampAct: nowTimestamp, precios: { '93': 1340, '95': 1380, '97': 1420, 'diesel': 1060, 'parafina': 950 }, logo: '' }
      ];

      const fallbackRegionData = {
        lastUpdate: new Date().toISOString(),
        regions: [{ id: 'RM', name: 'Metropolitana', prices: { '93': 1340, '95': 1385, '97': 1430, 'diesel': 1050, 'parafina': 950 } }]
      };

      const parsePriceStr = (val) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          const num = parseFloat(String(val).replace(',', '.'));
          if (isNaN(num)) return 0;
          if (num > 0 && num < 10) return Math.round(num * 1000); 
          if (num > 100000) return Math.round(num / 1000); 
          return Math.round(num);
      };

      try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("email", "nicolas0645@gmail.com");
        urlencoded.append("password", "12qwaszxL");

        let token = null;
        try {
          const loginResponse = await fetch("/api-cne/api/login", {
             method: 'POST', body: urlencoded, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          if (loginResponse.ok) {
            const data = await loginResponse.json();
            token = data.data?.token || data.token || data.Token;
            setAuthStatus('success');
          } else {
            setAuthStatus('error');
          }
        } catch (authErr) {
          setAuthStatus('error');
        }

        let liveStations = [];
        
        if (token) {
           try {
              const stationsResponse = await fetch(RUTA_ESTACIONES, { 
                 method: 'GET',
                 headers: { 'Token': token, 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } 
              });
              
              if (stationsResponse.ok) {
                 const stationsData = await stationsResponse.json();
                 const rawList = stationsData.data || stationsData.estaciones || stationsData;
                 
                 if (Array.isArray(rawList) && rawList.length > 0) {
                     let mappedStations = rawList.map(s => {
                        let p93 = 0, p95 = 0, p97 = 0, pdiesel = 0, pparafina = 0;
                        let fechaAct = '';
                        let timestampAct = 0;

                        const objPrecios = s.precios || s.combustibles || s.precios_combustibles || s;

                        if (objPrecios && typeof objPrecios === 'object') {
                            for (const [k, v] of Object.entries(objPrecios)) {
                                if (!v) continue;
                                const rawPrice = typeof v === 'object' ? (v.precio || v.valor || v.monto || 0) : v;
                                const val = parsePriceStr(rawPrice);
                                
                                if (val > 500 && val < 3000) {
                                    const n = k.toLowerCase();
                                    let matched = false;
                                    if (n.includes('93')) { p93 = val; matched = true; }
                                    else if (n.includes('95')) { p95 = val; matched = true; }
                                    else if (n.includes('97')) { p97 = val; matched = true; }
                                    else if (n === 'di' || n.includes('diesel') || n.includes('diésel') || n.includes('petroleo')) { pdiesel = val; matched = true; }
                                    else if (n === 'ke' || n.includes('parafina') || n.includes('kerosene')) { pparafina = val; matched = true; }
                                    
                                    if (matched && typeof v === 'object' && v.fecha_actualizacion && !fechaAct) {
                                        let f = v.fecha_actualizacion; 
                                        let h = v.hora_actualizacion || '00:00:00';
                                        
                                        const parsedDate = new Date(`${f}T${h}`);
                                        if (!isNaN(parsedDate.getTime())) {
                                            timestampAct = parsedDate.getTime();
                                        }

                                        if (f.includes('-')) {
                                           const parts = f.split('-');
                                           if (parts.length === 3 && parts[0].length === 4) f = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                        }
                                        fechaAct = `${f} ${h}`.trim();
                                    }
                                }
                            }
                        }

                        let distName = 'Independiente';
                        let logoStr = '';
                        if (s.distribuidor && typeof s.distribuidor === 'object') {
                            distName = s.distribuidor.marca || s.distribuidor.nombre || 'Independiente';
                            logoStr = s.distribuidor.logo || '';
                        } else if (typeof s.distribuidor === 'string') {
                            distName = s.distribuidor;
                        } else if (s.razon_social) distName = s.razon_social;
                        else if (s.marca) distName = s.marca;

                        const regionNameStr = s.ubicacion?.nombre_region || s.nombre_region || s.region || '';
                        const comunaStr = s.ubicacion?.nombre_comuna || s.nombre_comuna || s.comuna || s.comuna_nombre || 'Desconocida';
                        const dirStr = s.ubicacion?.direccion || s.direccion_calle || s.direccion || s.calle || '';

                        const latStr = s.ubicacion?.latitud || s.latitud || s.ubicacion?.lat || '0';
                        const lonStr = s.ubicacion?.longitud || s.longitud || s.ubicacion?.lng || '0';
                        const lat = parseFloat(String(latStr).replace(',', '.'));
                        const lon = parseFloat(String(lonStr).replace(',', '.'));

                        return {
                           id: s.codigo || s.id || Math.random().toString(),
                           comuna: comunaStr,
                           distribuidor: distName,
                           logo: logoStr,
                           direccion: dirStr,
                           lat: isNaN(lat) ? 0 : lat,
                           lon: isNaN(lon) ? 0 : lon,
                           actualizacion: fechaAct,
                           timestampAct: timestampAct,
                           regionId: extractRegionId(regionNameStr),
                           precios: { '93': p93, '95': p95, '97': p97, 'diesel': pdiesel, 'parafina': pparafina }
                        };
                     }).filter(s => s.precios['93'] > 0 || s.precios['diesel'] > 0 || s.precios['parafina'] > 0); 
                     
                     const deduplicatedStations = [];
                     const seenStations = new Set();
                     mappedStations.forEach(s => {
                         const uniqueKey = `${s.distribuidor}-${s.direccion}-${s.comuna}`.toLowerCase().trim();
                         if (!seenStations.has(uniqueKey)) {
                             seenStations.add(uniqueKey);
                             deduplicatedStations.push(s);
                         }
                     });
                     
                     liveStations = deduplicatedStations;
                 }
              }
           } catch (fetchErr) {
              console.warn("Fallo de conexión a la ruta de estaciones:", fetchErr);
           }
        }

        if (liveStations.length > 0) {
           setCneStations(liveStations);
           
           const regionStats = {};
           liveStations.forEach(st => {
               const rId = st.regionId;
               if (!regionStats[rId]) {
                   regionStats[rId] = { c93: 0, sum93: 0, c95: 0, sum95: 0, c97: 0, sum97: 0, cdiesel: 0, sumDiesel: 0, cparafina: 0, sumParafina: 0 };
               }
               if (st.precios['93'] > 0) { regionStats[rId].c93++; regionStats[rId].sum93 += st.precios['93']; }
               if (st.precios['95'] > 0) { regionStats[rId].c95++; regionStats[rId].sum95 += st.precios['95']; }
               if (st.precios['97'] > 0) { regionStats[rId].c97++; regionStats[rId].sum97 += st.precios['97']; }
               if (st.precios['diesel'] > 0) { regionStats[rId].cdiesel++; regionStats[rId].sumDiesel += st.precios['diesel']; }
               if (st.precios['parafina'] > 0) { regionStats[rId].cparafina++; regionStats[rId].sumParafina += st.precios['parafina']; }
           });

           const dynamicRegionData = {
               lastUpdate: new Date().toISOString(),
               regions: REGION_MAP ? Object.values(REGION_MAP).filter((v, i, a) => a.indexOf(v) === i).map(id => {
                   const stats = regionStats[id];
                   return {
                       id: id,
                       name: id,
                       prices: {
                           '93': stats?.c93 > 0 ? Math.round(stats.sum93 / stats.c93) : 1300,
                           '95': stats?.c95 > 0 ? Math.round(stats.sum95 / stats.c95) : 1350,
                           '97': stats?.c97 > 0 ? Math.round(stats.sum97 / stats.c97) : 1400,
                           'diesel': stats?.cdiesel > 0 ? Math.round(stats.sumDiesel / stats.cdiesel) : 1050,
                           'parafina': stats?.cparafina > 0 ? Math.round(stats.sumParafina / stats.cparafina) : 1000
                       }
                   };
               }) : []
           };
           setApiData(dynamicRegionData);
        } else {
           setCneStations(fallbackStations);
           setApiData(fallbackRegionData);
        }
        setCurrentStation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreciosEnVivo();
  }, []);

  const comunasDataForRouting = React.useMemo(() => {
    const comunasObj = {};
    
    cneStations.forEach(s => {
      if (s.lat !== 0 && s.lon !== 0) {
        if (!comunasObj[s.comuna]) {
          comunasObj[s.comuna] = { mainName: s.comuna, name: s.comuna, regionId: s.regionId, latSum: 0, lonSum: 0, count: 0 };
        }
        comunasObj[s.comuna].latSum += s.lat;
        comunasObj[s.comuna].lonSum += s.lon;
        comunasObj[s.comuna].count += 1;
      }
    });

    return Object.values(comunasObj).map(c => ({
      mainName: c.mainName,
      name: c.name,
      regionId: c.regionId,
      lat: c.latSum / c.count,
      lon: c.lonSum / c.count
    })).sort((a, b) => a.mainName.localeCompare(b.mainName));
  }, [cneStations]);

  const availableComunas = Array.from(new Set(cneStations.map(s => s.comuna))).sort((a, b) => a.localeCompare(b));

  let pricePerLiter = 0;
  if (calcMode === 'carga') {
      if (currentStation) {
          pricePerLiter = currentStation.precios[fuelType] || 0;
          if (pricePerLiter === 0) {
              const currentRegionData = apiData?.regions.find(r => r.id === currentStation.regionId);
              pricePerLiter = currentRegionData?.prices[fuelType] || 0;
          }
      }
  } else {
      if (originCity) {
          const activeRegionId = originCity.regionId;
          const currentRegionData = apiData?.regions.find(r => r.id === activeRegionId);
          pricePerLiter = currentRegionData?.prices[fuelType] || 0;
      }
  }

  const numInput = parseFloat(inputValue) || 0;
  const baseDist = parseFloat(distanceKm) || 0;
  
  const displayDistanceKm = isRoundTrip ? (baseDist * 2).toFixed(1) : baseDist.toFixed(1);
  const eff = parseFloat(efficiencyKml) || 1; 

  let resultValue = 0;
  const litersNeeded = eff > 0 ? (parseFloat(displayDistanceKm) / eff) : 0; 

  if (calcMode === 'carga') {
    if (chargeMode === 'liters') {
      resultValue = numInput * pricePerLiter;
    } else {
      resultValue = pricePerLiter > 0 ? numInput / pricePerLiter : 0;
    }
  } else if (calcMode === 'viaje') {
    resultValue = litersNeeded * pricePerLiter;
  }

  function formatCLP(value) {
    const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safeValue);
  }

  const fuelOptionsCarga = ['93', '95', '97', 'diesel', 'parafina'];

  // Variables para la paginación
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentStationsPage = filteredStationsCarga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStationsCarga.length / ITEMS_PER_PAGE);

  // --- ✨ FUNCIÓN PARA CONSULTAR A LA IA ✨ ---
  const handleAskAI = async () => {
    setIsAiLoading(true);
    setShowAiModal(true);
    setAiAnalysis(null);

    let prompt = "";
    let sys = "Eres un experto asistente de conducción en Chile. Analiza los datos de bencina y rutas y entrega consejos breves, estratégicos y amigables. Usa modismos chilenos ligeros.";

    if (calcMode === 'carga') {
      const top3 = filteredStationsCarga.slice(0, 3).map(s => `${s.distribuidor} ($${s.precios[fuelType]})`).join(", ");
      prompt = `En la comuna de ${cargaComuna}, los precios de ${fuelType} son: ${top3}. La estación seleccionada es ${currentStation?.distribuidor} a $${currentStation?.precios[fuelType]}. ¿Es una buena decisión? Da un consejo rápido de ahorro.`;
    } else {
      prompt = `Viaje de ${originCity?.mainName} a ${destCity?.mainName} (${displayDistanceKm} km). Rendimiento de ${efficiencyKml} km/L usando ${fuelType}. El costo total es de ${formatCLP(resultValue)}. Dame 3 tips rápidos para este trayecto y dime si el gasto te parece razonable.`;
    }

    try {
      const text = await callGemini(prompt, sys);
      setAiAnalysis(text);
    } catch (e) {
      setAiAnalysis("¡Pucha! No pude conectar con el cerebro de la App. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Conectando con CNE...</h2>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 flex items-center justify-center font-sans text-slate-800 h-[100dvh] sm:h-screen sm:p-8">
      {/* Contenedor Principal Adaptable */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-2xl sm:border border-slate-100 flex flex-col h-full sm:h-[850px] overflow-hidden">
        
        {/* HEADER (Fijo arriba) */}
        <div className="shrink-0 bg-blue-600 p-5 sm:p-6 text-white relative shadow-md z-20">
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-medium border ${
              authStatus === 'success' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-50' : 
              authStatus === 'error' ? 'bg-red-500/20 border-red-400 text-red-50' : 'bg-blue-700/50 border-blue-400'
            }`}>
              {authStatus === 'success' ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{authStatus === 'success' ? 'Auth CNE OK' : 'Auth Falló'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 mb-2 mt-2">
            <Fuel className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">BencinaApp 🇨🇱</h1>
          </div>
          <p className="text-blue-100 text-sm opacity-90">Planifica tu ruta o consulta precios.</p>
        </div>

        {/* CONTENIDO SCROLLABLE (Elástico) */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6 relative z-10">
          
          {/* Pestañas (Tabs) */}
          <div className="sticky top-0 z-50 flex p-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
            <button
              onClick={() => { 
                setCalcMode('viaje'); setInputValue(''); 
                if (fuelType === 'parafina') setFuelType('93');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                calcMode === 'viaje' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Route className="w-4 h-4 inline-block mr-1.5 mb-0.5" /> Viaje
            </button>
            <button
              onClick={() => { setCalcMode('carga'); setInputValue(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                calcMode === 'carga' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 inline-block mr-1.5 mb-0.5" /> Por Ciudad
            </button>
          </div>

          {calcMode === 'carga' ? (
            <div className="space-y-6">
              {/* 1. Selector de Combustible */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-slate-700">
                  <Droplets className="w-4 h-4 mr-2 text-blue-500" /> 1. ¿Qué buscas?
                </label>
                <div className="flex flex-wrap gap-2">
                  {fuelOptionsCarga.map((type) => {
                    const isSelected = fuelType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setFuelType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {type === 'diesel' ? 'Diesel' : type === 'parafina' ? 'Parafina' : type + ' Oct'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Buscador de Comuna */}
              <div className="space-y-3 relative z-40">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" /> 2. ¿En qué comuna?
                  </label>
                  {/* Botón IA */}
                  {cargaComuna && currentStation && (
                    <button onClick={handleAskAI} className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md border border-indigo-200 shadow-sm active:scale-95 transition-transform">
                      <Sparkles className="w-3 h-3" />
                      <span>ANALIZAR PRECIOS</span>
                    </button>
                  )}
                </div>
                <ComunaAutocomplete 
                  placeholder="Escribe tu comuna..." 
                  value={cargaComuna} 
                  onSelect={(c) => { setCargaComuna(c); setCurrentStation(null); }}
                  comunas={availableComunas}
                />
              </div>

              {/* 3. Resultados de Estaciones */}
              {cargaComuna && filteredStationsCarga.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500 relative z-10">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    <Store className="w-4 h-4 mr-2 text-emerald-500" /> 3. Selecciona tu estación
                  </label>

                  {/* Mapa de Estaciones */}
                  <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm relative bg-slate-200">
                      {stationsMapUrl ? (
                         <iframe src={stationsMapUrl} title="Mapa Estaciones" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
                      ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                           <Loader2 className="w-6 h-6 animate-spin" />
                         </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-slate-600 border border-slate-200">
                         Toca un pin para verla
                      </div>
                  </div>

                  {/* Lista Paginada */}
                  <div className="flex flex-col gap-3 mt-3">
                    {currentStationsPage.map((station, idx) => {
                      const isSelected = currentStation?.id === station.id;
                      const isCheapest = currentPage === 1 && idx === 0 && !station.isOutdated;
                      const price = station.precios[fuelType];
                      
                      return (
                        <div
                          key={station.id}
                          onClick={() => setCurrentStation(station)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200' 
                              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col flex-1 overflow-hidden pr-2">
                            <div className="flex items-center space-x-2 mb-1">
                              {station.logo ? (
                                <img src={station.logo} alt={station.distribuidor} className="h-5 w-5 object-contain rounded" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                              ) : null}
                              <Fuel className="w-4 h-4 text-slate-400" style={{ display: station.logo ? 'none' : 'block' }} />
                              <span className="font-bold text-slate-700 text-sm truncate">{station.distribuidor}</span>
                              {isCheapest && (
                                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 rounded-full px-1.5 py-0.5 ml-1 border border-emerald-200 shrink-0 flex items-center">
                                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top 1
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 truncate" title={station.direccion}>
                              {station.direccion}
                            </span>
                            <div className="flex items-center mt-1.5">
                               <span className={`text-[10px] flex items-center ${station.isOutdated ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                  {station.isOutdated ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                  {station.isOutdated ? 'Desactualizado' : (station.actualizacion ? station.actualizacion.split(' ')[0] : '--')}
                               </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-center shrink-0 pl-3 border-l border-slate-100 min-w-[80px]">
                             <span className={`text-xl font-black ${station.isOutdated ? 'text-slate-400' : 'text-slate-800'}`}>
                               {formatCLP(price)}
                             </span>
                             {isSelected && <Check className="w-5 h-5 text-blue-600 mt-1" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Paginador */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                       <button 
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                         disabled={currentPage === 1}
                         className="flex items-center px-3 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-active active:scale-95"
                       >
                         <ChevronLeft className="w-4 h-4 mr-1" /> Ant
                       </button>
                       <span className="text-xs font-bold text-slate-500">Pág {currentPage} de {totalPages}</span>
                       <button 
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         disabled={currentPage === totalPages}
                         className="flex items-center px-3 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-active active:scale-95"
                       >
                         Sig <ChevronRight className="w-4 h-4 ml-1" />
                       </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative z-40">
                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /></div>
                    Punto de inicio
                  </label>
                  <RouteCityAutocomplete placeholder="¿Desde dónde viajas?" value={originCity} onSelect={setOriginCity} comunasData={comunasDataForRouting} />
                </div>

                <div>
                  <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2"><MapPin className="w-3.5 h-3.5 text-red-500" /></div>
                    Punto de destino
                  </label>
                  <RouteCityAutocomplete placeholder="¿Hacia dónde vas?" value={destCity} onSelect={setDestCity} comunasData={comunasDataForRouting} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-700 mb-2"><Gauge className="w-4 h-4 mr-1.5 text-slate-400" /> Rendimiento</label>
                    <div className="relative">
                      <input type="number" min="1" step="0.1" value={efficiencyKml} onChange={(e) => setEfficiencyKml(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[16px] font-bold text-slate-700" />
                      <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">km/L</span>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-700 mb-2"><Fuel className="w-4 h-4 mr-1.5 text-slate-400" /> Combustible</label>
                    <div className="relative">
                      <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[16px] font-bold text-slate-700 appearance-none cursor-pointer">
                        <option value="93">93 Octanos</option>
                        <option value="95">95 Octanos</option>
                        <option value="97">97 Octanos</option>
                        <option value="diesel">Diesel</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                   <div className="text-xs text-slate-500 flex items-center">
                      Ref: <strong className="text-slate-700 ml-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{pricePerLiter > 0 ? formatCLP(pricePerLiter) : '--'}</strong>/L
                   </div>
                   <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-2 rounded-lg border border-slate-200">
                      <input type="checkbox" className="rounded text-blue-500 accent-blue-500 w-4 h-4" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} />
                      <span className="text-xs font-bold text-slate-700">Ida y vuelta</span>
                   </label>
                </div>
              </div>

              {/* Botón IA Viajes */}
              {originCity && destCity && parseFloat(distanceKm) > 0 && (
                <button onClick={handleAskAI} className="w-full bg-slate-900 text-white p-3.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>ANALIZAR RUTA CON IA</span>
                </button>
              )}

              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center text-sm font-semibold text-slate-600">
                    <Route className="w-4 h-4 mr-2 text-emerald-500" /> Distancia total:
                 </div>
                 {isCalculatingRoute ? (
                   <div className="flex items-center text-emerald-600 text-sm font-bold">
                     <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> GPS...
                   </div>
                 ) : (
                   <span className="text-sm font-bold text-slate-800 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                     {displayDistanceKm} km
                   </span>
                 )}
              </div>

              {originCity && destCity && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm relative bg-slate-200">
                  {isCalculatingRoute ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-500" />
                      <span className="text-xs font-medium">Trazando ruta segura...</span>
                    </div>
                  ) : (
                    <iframe key={`map-${originCity.lat}-${destCity.lat}-${isRoundTrip}`} src={mapUrl} title="Mapa de la ruta" width="100%" height="100%" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL INFERIOR FIJO (Adaptable a teclado móvil) */}
        <div className="shrink-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-4 sm:p-6 z-30">
           
           {calcMode === 'carga' && currentStation && (
             <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500">Simulador de Carga</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                    {formatCLP(pricePerLiter)}/L
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-[2]">
                    <input 
                      type="number" min="0" step={chargeMode === 'liters' ? "0.1" : "1000"}
                      value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                      className="w-full p-2.5 pl-3 pr-2 text-[16px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                      placeholder="0"
                    />
                  </div>
                  <select 
                    value={chargeMode} onChange={e => { setChargeMode(e.target.value); setInputValue(''); }}
                    className="flex-1 p-2 text-[16px] font-bold bg-white border border-slate-300 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="money">Pesos ($)</option>
                    <option value="liters">Litros (L)</option>
                  </select>
                </div>
             </div>
           )}

           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                   {calcMode === 'carga' 
                      ? (chargeMode === 'money' ? 'Recibirás aprox.' : 'Costo total aprox.') 
                      : (isRoundTrip ? 'Costo Ida y Vuelta' : 'Costo del Viaje')}
                 </span>
                 <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-1">
                    {calcMode === 'carga' && chargeMode === 'money' 
                      ? `${resultValue.toFixed(1)} Lts`
                      : formatCLP(resultValue)}
                 </span>
                 {calcMode === 'viaje' && (
                    <span className="text-[11px] text-slate-400 font-bold mt-1 flex items-center">
                       <Droplets className="w-3 h-3 mr-1" /> Consumo: ~{litersNeeded.toFixed(1)} Lts
                    </span>
                 )}
              </div>
           </div>
        </div>

        {/* MODAL IA GEMINI */}
        {showAiModal && (
          <div className="absolute inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-xl">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">Copiloto IA ✨</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isAiLoading ? (
                <div className="py-10 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 animate-pulse uppercase">Analizando datos en tiempo real...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAiModal(false)}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    Cerrar Análisis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}