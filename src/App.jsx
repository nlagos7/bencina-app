import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Fuel, MapPin, DollarSign, Droplets, ChevronDown, Loader2, AlertCircle,
  ShieldCheck, Route, ArrowRight, Map as MapIcon, Search, Check, X,
  Clock, TrendingUp, Calculator, ChevronLeft, Ticket, Settings, ArrowUpDown,
  Car, Info, Tag, Plus, ChevronUp, FileText, ExternalLink, Mail, Menu, Calendar, ChevronRight, Home
} from "lucide-react";

// =====================================================================
// 🛑 CONFIGURACIÓN DE RUTAS Y API (Vía Proxy Local / Vercel)
// =====================================================================
const RUTA_LOGIN = "https://api.cne.cl/api/login";
const RUTA_ESTACIONES = "https://api.cne.cl/api/v4/estaciones";

const REGION_MAP = {
  arica: "XV", parinacota: "XV", tarapacá: "I", tarapaca: "I",
  antofagasta: "II", atacama: "III", coquimbo: "IV", valparaíso: "V",
  valparaiso: "V", metropolitana: "RM", santiago: "RM", higgins: "VI",
  libertador: "VI", maule: "VII", ñuble: "XVI", nuble: "XVI",
  biobío: "VIII", biobio: "VIII", concepción: "VIII", araucanía: "IX",
  araucania: "IX", "los ríos": "XIV", "los rios": "XIV", "los lagos": "X",
  aysén: "XI", aysen: "XI", magallanes: "XII",
};

const POPULAR_COMUNAS = ["Santiago Centro", "Providencia", "Las Condes", "Maipú", "Viña del Mar", "Concepción", "Antofagasta", "Temuco"];
const FUEL_OPTIONS_CARGA = ["93", "95", "97", "diesel", "parafina"];

const normalizeString = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

// =========================
// 📢 COMPONENTE PUBLICIDAD (ADSENSE)
// =========================
const AdPlaceholder = ({ className = "" }) => {
  const adRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let timeoutId;
    if (!adRef.current && containerRef.current) {
      // Retraso ligero para asegurar que el contenedor tenga dimensiones calculadas
      timeoutId = setTimeout(() => {
        try {
          if (window && typeof window !== "undefined" && containerRef.current.offsetWidth > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (e) {
          console.warn("AdSense:", e.message);
        }
      }, 500);
      adRef.current = true;
    }
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div ref={containerRef} className={`w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 p-2 shadow-sm min-h-[100px] overflow-hidden ${className}`}>
      <ins className="adsbygoogle"
           style={{ display: "block", width: "100%", minWidth: "250px", textAlign: "center" }}
           data-ad-client="ca-pub-6243319897431930"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

// =========================
// 🚧 MEGA PEAJES DB
// =========================
const PEAJES_DB = [
  { id: "p_antofagasta", nombre: "Peaje Antofagasta", lat: -23.45397, lon: -70.12523, precio: 2750, tipo: "peaje" },
  { id: "p_copiapo", nombre: "Peaje Copiapó", lat: -27.99711, lon: -70.56577, precio: 2600, tipo: "peaje" },
  { id: "p_vallenar_alg", nombre: "Peaje Vallenar", lat: -29.08675, lon: -70.91695, precio: 2700, tipo: "peaje" },
  { id: "p_lahiguera", nombre: "Peaje La Higuera", lat: -29.37109, lon: -71.07309, precio: 2700, tipo: "peaje" },
  { id: "p_losvilos", nombre: "Peaje Los Vilos", lat: -32.17496, lon: -71.52069, precio: 4200, tipo: "peaje" },
  { id: "p_lampa", nombre: "Peaje Lampa", lat: -33.262, lon: -70.825, precio: 900, tipo: "peaje" },
  { id: "p_lampa_lat", nombre: "Peaje Lampa Lateral", lat: -33.255, lon: -70.82, precio: 0, tipo: "lateral" },
  { id: "p_lasvegas", nombre: "Peaje Las Vegas", lat: -32.812, lon: -70.963, precio: 2900, tipo: "peaje" },
  { id: "p_elmelon", nombre: "Peaje El Melón", lat: -32.617, lon: -71.233, precio: 2900, tipo: "peaje" },
  { id: "p_pichidangui", nombre: "Peaje Pichidangui", lat: -32.138, lon: -71.506, precio: 2900, tipo: "peaje" },
  { id: "p_puertoscuro", nombre: "Peaje Puerto Oscuro", lat: -31.400, lon: -71.600, precio: 4000, tipo: "peaje" },
  { id: "p_tongoy", nombre: 'Peaje Troncal Norte', lat: -30.250, lon: -71.500, precio: 4250, tipo: 'peaje' },
  { id: "p_punta_colorada", nombre: 'Peaje Punta Colorada', lat: -29.330, lon: -71.050, precio: 3150, tipo: 'peaje' },
  { id: "p_cachiyuyo", nombre: 'Peaje Cachiyuyo', lat: -29.050, lon: -70.900, precio: 3150, tipo: 'peaje' },
  { id: "p_vallenar", nombre: "Peaje Vallenar", lat: -28.600, lon: -70.780, precio: 3000, tipo: "peaje" },
  { id: "p_puerto_viejo", nombre: "Peaje Puerto Viejo", lat: -27.350, lon: -70.900, precio: 3000, tipo: "peaje" },
  { id: "p_totoral", nombre: "Peaje Totoral", lat: -27.850, lon: -71.050, precio: 2900, tipo: "peaje" },
  { id: "p_cerro_blanco", nombre: "Peaje Cerro Blanco", lat: -29.100, lon: -71.150, precio: 3000, tipo: "peaje" },
  { id: "p_riomaipo", nombre: "Peaje Río Maipo", lat: -33.743, lon: -70.739, precio: 1400, tipo: "peaje" },
  { id: "p_angostura", nombre: "Peaje Angostura", lat: -33.896, lon: -70.735, precio: 3800, tipo: "peaje" },
  { id: "p_quinta", nombre: "Peaje Quinta", lat: -34.981, lon: -71.238, precio: 3800, tipo: "peaje" },
  { id: "p_rioclaro", nombre: "Peaje Río Claro", lat: -35.15, lon: -71.27, precio: 3300, tipo: "peaje" },
  { id: "p_retiro", nombre: "Peaje Retiro", lat: -35.34, lon: -71.6, precio: 3300, tipo: "peaje" },
  { id: "p_perquilauquen", nombre: "Peaje Perquilauquén", lat: -36.05, lon: -71.8, precio: 3500, tipo: "peaje" },
  { id: "p_santaclara", nombre: "Peaje Santa Clara", lat: -36.909, lon: -72.341, precio: 3400, tipo: "peaje" },
  { id: "p_coihue", nombre: "Peaje Coihue", lat: -37.557, lon: -72.58, precio: 3500, tipo: "peaje" },
  { id: "p_renaico", nombre: "Peaje Renaico", lat: -37.674, lon: -72.595, precio: 3500, tipo: "peaje" },
  { id: "p_lasmaicas", nombre: "Peaje Las Maicas", lat: -37.806, lon: -72.331, precio: 3400, tipo: "peaje" },
  { id: "p_pua", nombre: "Peaje Púa", lat: -38.362, lon: -72.386, precio: 3600, tipo: "peaje" },
  { id: "p_quepe", nombre: "Peaje Quepe", lat: -38.915, lon: -72.624, precio: 3600, tipo: "peaje" },
  { id: "p_freire", nombre: "Peaje Freire", lat: -38.95, lon: -72.6, precio: 3500, tipo: "peaje" },
  { id: "p_lanco", nombre: "Peaje Lanco", lat: -39.45, lon: -72.75, precio: 3600, tipo: "peaje" },
  { id: "p_launion", nombre: "Peaje La Unión", lat: -40.3, lon: -73.05, precio: 3600, tipo: "peaje" },
  { id: "p_cuatrovientos", nombre: "Peaje Cuatro Vientos", lat: -40.915, lon: -73.155, precio: 3600, tipo: "peaje" },
  { id: "p_purranque", nombre: "Peaje Purranque", lat: -40.85, lon: -73.15, precio: 1200, tipo: "peaje" },
  { id: "p_puertomontt", nombre: "Peaje Bypass P. Montt", lat: -41.450, lon: -73.100, precio: 1100, tipo: "peaje" },
  { id: "p_pargua", nombre: "Peaje P. Montt - Pargua", lat: -41.650, lon: -73.350, precio: 3100, tipo: "peaje" },
  { id: "p_loprado", nombre: "Peaje Lo Prado (R68)", lat: -33.434, lon: -70.938, precio: 2700, tipo: "peaje" },
  { id: "p_zapata", nombre: "Peaje Zapata (R68)", lat: -33.393, lon: -71.258, precio: 2700, tipo: "peaje" },
  { id: "p_troncalsur", nombre: "Peaje Troncal Sur (R60)", lat: -33.056, lon: -71.405, precio: 4250, tipo: "peaje" },
  { id: "p_quillota", nombre: "Peaje Quillota", lat: -32.880, lon: -71.250, precio: 5350, tipo: "peaje" },
  { id: "p_nogales", nombre: "Peaje Nogales", lat: -32.730, lon: -71.210, precio: 1950, tipo: "peaje" },
  { id: "p_melipilla", nombre: "Peaje Melipilla I", lat: -33.645, lon: -71.157, precio: 4008, tipo: "peaje" },
  { id: "p_puangue", nombre: "Peaje Puangue", lat: -33.620, lon: -71.290, precio: 3500, tipo: "peaje" },
  { id: "p_casablanca", nombre: "Peaje Casablanca", lat: -33.310, lon: -71.400, precio: 1500, tipo: "peaje" },
  { id: "p_chacabuco", nombre: "Peaje Chacabuco", lat: -33.000, lon: -70.700, precio: 3300, tipo: "peaje" },
  { id: "p_lascardas", nombre: "Peaje Las Cardas", lat: -30.290, lon: -71.265, precio: 3700, tipo: "peaje" },
  { id: "p_aguamarilla", nombre: "Peaje Agua Amarilla", lat: -36.900, lon: -72.400, precio: 4400, tipo: "peaje" },
  { id: "p_huinanco", nombre: "Peaje Huinanco", lat: -37.050, lon: -72.800, precio: 3900, tipo: "peaje" },
  { id: "p_chivilingo", nombre: "Peaje Chivilingo", lat: -37.200, lon: -73.150, precio: 2500, tipo: "peaje" },
  { id: "p_curanilahue", nombre: "Peaje Curanilahue", lat: -37.450, lon: -73.350, precio: 2500, tipo: "peaje" },
  { id: "p_pilpilco", nombre: "Peaje Pilpilco", lat: -37.600, lon: -73.400, precio: 2500, tipo: "peaje" },
  { id: "p_colina_tag", nombre: "TAG Colina", lat: -33.27994, lon: -70.73887, precio: 474, tipo: "tag" },
  { id: "p_quilicura_tag", nombre: "TAG Quilicura", lat: -33.38222, lon: -70.69557, precio: 495, tipo: "tag" },
  { id: "t_costanera_oriente", nombre: "TAG Costanera", lat: -33.400, lon: -70.550, precio: 1500, tipo: "tag" },
  { id: "p_est_central_tag", nombre: "TAG Estación Central", lat: -33.4473, lon: -70.69227, precio: 408, tipo: "tag" },
  { id: "t_central_norte", nombre: "TAG Autopista Central", lat: -33.360, lon: -70.700, precio: 1800, tipo: "tag" },
  { id: "t_vespucio_sur", nombre: "TAG Vespucio Sur", lat: -33.535, lon: -70.620, precio: 1800, tipo: "tag" },
  { id: "p_buin_tag", nombre: "TAG Buin", lat: -33.69552, lon: -70.72364, precio: 840, tipo: "tag" },
  { id: "t_vespucio_norte", nombre: "TAG Vespucio Norte", lat: -33.370, lon: -70.680, precio: 1800, tipo: "tag" },
  { id: "t_nororiente", nombre: "TAG Nororiente", lat: -33.320, lon: -70.600, precio: 3000, tipo: "tag" }
];

const BLOG_POSTS = [
  { 
    id: 1, 
    title: "Ruta de los 7 Lagos: Una maravilla oculta en el sur", 
    category: "Rutas", 
    date: "12 May 2026", 
    excerpt: "Prepárate para un recorrido espectacular. Te contamos cuánta bencina necesitas, dónde cargar y los peajes clave.", 
    image: "https://picsum.photos/id/1018/800/400",
    content: [
      "La Ruta de los Siete Lagos en la Región de Los Ríos es uno de los destinos más hermosos que ofrece el sur de Chile. Este recorrido te lleva a través de paisajes cordilleranos, bosques milenarios y, por supuesto, lagos de aguas cristalinas como el Panguipulli, Calafquén, Riñihue, Pirihueico, Pellaifa, Neltume y Pullinque.",
      "Para realizar esta ruta con tranquilidad, te recomendamos planificar bien tus recargas de combustible. Si viajas desde el norte, llenar el estanque en Temuco o Lanco suele ser la mejor opción, ya que las estaciones ubicadas más hacia la cordillera tienden a incrementar su valor en unos $40 a $50 pesos por litro debido al costo logístico de transporte.",
      "Recuerda también revisar la presión de tus neumáticos. Gran parte de esta ruta cuenta con tramos de ripio que requieren una tracción óptima. Un neumático bien calibrado no solo te da mayor seguridad, sino que también mejora el rendimiento de tu combustible en hasta un 3%."
    ]
  },
  { 
    id: 2, 
    title: "¿Por qué rinde menos tu estanque en invierno?", 
    category: "Consejos", 
    date: "05 May 2026", 
    excerpt: "Las bajas temperaturas afectan la eficiencia de tu motor. Aquí te dejamos 5 consejos clave para optimizar cada gota.", 
    image: "https://picsum.photos/id/1036/800/400",
    content: [
      "Es un fenómeno que muchos conductores chilenos notan entre junio y agosto: llenan el estanque, pero los kilómetros recorridos parecen disminuir. Esto no es tu imaginación, es física y termodinámica pura aplicada a tu motor.",
      "En invierno, el aceite del motor es más denso y espeso debido a las bajas temperaturas, lo que genera una mayor fricción interna durante los primeros minutos de marcha. Además, el aire frío es más denso, por lo que la computadora de tu auto inyecta más combustible para mantener la mezcla correcta.",
      "¿Cómo evitar perder dinero? Primero, evita calentar el auto estacionado por más de 30 segundos; la mejor forma de calentar un motor moderno es conduciendo suavemente. Segundo, el uso excesivo del desempañador y la calefacción requiere energía eléctrica que, en última instancia, proviene de la quema de gasolina."
    ]
  },
  { 
    id: 3, 
    title: "Actualización MEPCO: ¿Qué esperar este jueves?", 
    category: "Noticias", 
    date: "28 Abr 2026", 
    excerpt: "Analizamos las proyecciones del precio internacional y te decimos si conviene cargar el estanque hoy o esperar.", 
    image: "https://picsum.photos/id/1073/800/400",
    content: [
      "El Mecanismo de Estabilización de Precios de los Combustibles (MEPCO) es el sistema que regula las bruscas fluctuaciones del mercado internacional para que no golpeen de un día para otro a los consumidores chilenos.",
      "De acuerdo a la legislación vigente, los precios de los combustibles en Chile se actualizan cada tres semanas. Este jueves corresponde una nueva fijación tarifaria por parte de ENAP. Observando el valor del dólar en las últimas semanas y el barril de Brent, los expertos proyectan una tendencia al alza.",
      "Nuestra recomendación en Andes Ruta: Si tu estanque está por debajo de la mitad, te aconsejamos llenarlo antes del miércoles por la noche. Las proyecciones sugieren un aumento tope de $32 pesos por litro en las gasolinas de 93 y 97 octanos."
    ]
  },
  { 
    id: 4, 
    title: "Nuevas estaciones de servicio con descuentos directos", 
    category: "Ahorro", 
    date: "20 Abr 2026", 
    excerpt: "Varias comunas han inaugurado nuevas sucursales que traen promociones agresivas. Revisa el listado completo.", 
    image: "https://picsum.photos/id/1043/800/400",
    content: [
      "La competencia en el mercado minorista de combustibles en Chile se está intensificando con la llegada de nuevas marcas y la modernización de las ya existentes, lo cual es una excelente noticia para tu bolsillo.",
      "Empresas como Aramco (que recientemente adquirió la licencia de Petrobras en el país) están lanzando fuertes campañas de fidelización. Pagar a través de billeteras digitales como Tenpo, Mach, o utilizando tarjetas específicas en ciertos días de la semana, puede representar un descuento real de hasta $150 pesos por litro.",
      "Además, la modalidad de 'Autoservicio' (donde el cliente realiza la carga) se está expandiendo rápidamente. Utilizar Andes Ruta te permite filtrar estas estaciones, ya que suelen tener un precio base de tótem entre $10 y $20 más barato que el precio asistido tradicional."
    ]
  },
  { 
    id: 5, 
    title: "Viaje a la costa: Comparativa de precios por Ruta 68", 
    category: "Viajes", 
    date: "15 Abr 2026", 
    excerpt: "Si vas de Santiago a Viña del Mar, te mostramos exactamente dónde cargar para que el viaje te salga más barato.", 
    image: "https://picsum.photos/id/1044/800/400",
    content: [
      "El trayecto a través de la Ruta 68 es uno de los más transitados del país. Ya sea por trabajo o por una escapada de fin de semana, saber dónde cargar combustible puede marcar una diferencia en tu presupuesto.",
      "Históricamente, las bencineras ubicadas en las grandes autopistas urbanas de salida (como Costanera Norte o Vespucio) y los mega-centros de servicio en la carretera (sector Casablanca) presentan tarifas considerablemente más altas por su exclusividad.",
      "El truco es llenar tu vehículo en comunas aledañas antes de tomar la ruta. Por ejemplo, estaciones en Maipú o Pudahuel suelen registrar valores hasta $40 pesos más baratos por litro en comparación con la primera gran estación de servicio saliendo de Santiago."
    ]
  },
  { 
    id: 6, 
    title: "Guía definitiva: ¿Qué octanaje realmente necesitas?", 
    category: "Mecánica", 
    date: "02 Abr 2026", 
    excerpt: "Mito vs Realidad. Descubre si de verdad vale la pena pagar de más por la bencina de 97 octanos.", 
    image: "https://picsum.photos/id/1071/800/400",
    content: [
      "Uno de los mitos más extendidos entre los conductores es creer que poner gasolina de 97 octanos hará que un auto diseñado para 93 corra más rápido, tenga más potencia o limpie el motor. Esto es completamente falso.",
      "El octanaje no es una medida de 'energía' o 'calidad', sino de la capacidad del combustible para soportar la compresión dentro de los cilindros del motor sin detonar antes de tiempo. Vehículos deportivos o con turbo de alta compresión necesitan 97 octanos para funcionar correctamente. Sin embargo, un vehículo familiar estándar (City car, Sedán) suele requerir solo 93 o 95.",
      "El mejor consejo es revisar el manual del fabricante de tu automóvil o la etiqueta interior de la tapa del estanque. Si el fabricante exige un mínimo de 93 octanos, pagar por 97 es literalmente botar tu dinero, ya que el motor no tiene la capacidad técnica de aprovechar ese extra."
    ]
  }
];

function extractRegionId(displayName) {
  const lower = (displayName || "").toLowerCase();
  for (const [key, id] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return id;
  }
  return "RM";
}

// =========================
// UTILIDADES MATEMÁTICAS / GEO
// =========================
function getStraightLineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) { return Math.round(getStraightLineDistance(lat1, lon1, lat2, lon2) * 1.3); }

function decodePolyline(encoded, precision = 5) {
  const factor = Math.pow(10, precision); let index = 0, lat = 0, lng = 0, coordinates = [];
  while (index < encoded.length) {
    let byte, shift = 0, result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; shift += 5; result |= (byte & 0x1f) << shift; } while (byte >= 0x20);
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1)); shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; shift += 5; result |= (byte & 0x1f) << shift; } while (byte >= 0x20);
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1)); coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}

function detectTollsInRoute(geometry) {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length < 2) return { total: 0, list: [] };
  const detected = new Set(); let total = 0; const tolls = []; const densePoints = [];
  for (let i = 0; i < geometry.coordinates.length - 1; i++) {
    const [lon1, lat1] = geometry.coordinates[i], [lon2, lat2] = geometry.coordinates[i+1];
    densePoints.push([lon1, lat1]);
    if (getStraightLineDistance(lat1, lon1, lat2, lon2) > 0.2) { 
      const steps = Math.floor(getStraightLineDistance(lat1, lon1, lat2, lon2) / 0.2);
      for (let j = 1; j <= steps; j++) densePoints.push([lon1 + (lon2 - lon1) * (j / (steps + 1)), lat1 + (lat2 - lat1) * (j / (steps + 1))]);
    }
  }
  densePoints.push(geometry.coordinates[geometry.coordinates.length - 1]);
  densePoints.forEach((coord) => {
    PEAJES_DB.forEach((p) => {
      if (p.tipo !== "lateral" && !detected.has(p.id) && getStraightLineDistance(coord[1], coord[0], p.lat, p.lon) <= 0.4) { detected.add(p.id); total += p.precio || 0; tolls.push(p); }
    });
  });
  return { total, list: tolls };
}

function getBestPrice(pObj) {
  if (!pObj) return 0;
  const asis = pObj.asistido || 0, auto = pObj.autoservicio || 0;
  if (asis > 0 && auto > 0) return Math.min(asis, auto); return asis > 0 ? asis : auto;
}

// =========================
// GENERADORES HTML PARA MAPAS (IFRAME)
// =========================
function generateMapHtml(origin, dest, geometry, isRoundTrip, tolls = [], waypoints = []) {
  if (!origin || !dest) return "";
  const tollsJs = tolls.map(t => `L.marker([${t.lat}, ${t.lon}], {icon: L.divIcon({className: 'custom-leaflet-icon', iconSize: [20, 20], html: '<div style="background:#f59e0b;width:20px;height:20px;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);"><span style="color:white;font-size:11px;font-weight:900;">$</span></div>'})}).addTo(map).bindPopup("<b>${t.nombre}</b><br>$${t.precio}");`).join('\n');
  const waypointsJs = waypoints.map(wp => `L.marker([${wp.lat}, ${wp.lon}], {icon: L.divIcon({className: 'custom-leaflet-icon', iconSize: [12, 12], html: '<div style="background:#f59e0b;width:12px;height:12px;border:2px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>'})}).addTo(map).bindPopup("<b>${wp.mainName}</b>");`).join('\n');
  
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body{margin:0;padding:0;background:#e2e8f0;width:100%;height:100%;}#map{width:100%;height:100vh;}.leaflet-control-attribution{display:none!important;} .custom-leaflet-icon { background: transparent; border: none; }</style></head><body><div id="map"></div><script>var map = L.map('map', { zoomControl: false }); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map); var originCoord=[${origin.lat}, ${origin.lon}]; var destCoord=[${dest.lat}, ${dest.lon}]; L.marker(originCoord, {icon: L.divIcon({className:'custom-leaflet-icon', iconSize:[16,16], html:'<div style="background:#3b82f6;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>'})}).addTo(map); L.marker(destCoord, {icon: L.divIcon({className:'custom-leaflet-icon', iconSize:[16,16], html:'<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>'})}).addTo(map); ${waypointsJs} var geom = ${geometry ? JSON.stringify(geometry) : 'null'}; 
  setTimeout(function() {
      if(geom && geom.coordinates && geom.coordinates.length > 1){ 
         var coords = geom.coordinates.map(function(c){return [c[1], c[0]];}); 
         var poly = L.polyline(coords, {color: '#3b82f6', weight: 4, opacity: 0.9}).addTo(map); 
         if (poly.getBounds().isValid()) {
            map.fitBounds(poly.getBounds(), {padding: [50, 50]});
         }
      } else { 
         var b = L.latLngBounds([originCoord, destCoord]);
         if (b.isValid()) {
            map.fitBounds(b, {padding: [50, 50]});
         }
      } 
  }, 100);
  ${tollsJs}</script></body></html>`;
}

function generateStationsMapHtml(stations, selectedStation, userLoc, showRouteLine, fuelType) {
  if (!stations || stations.length === 0) return "";
  const selectedId = selectedStation?.id;
  
  const stationsToRender = (showRouteLine && selectedStation && userLoc) 
      ? stations.filter(s => s.id === selectedId) 
      : stations;

  const markersJs = stationsToRender.map((s) => {
      const isSelected = selectedStation && s.id === selectedId;
      const baseColor = s.isOutdated ? "#94a3b8" : "#0f172a";
      const color = isSelected ? "#3b82f6" : baseColor;
      
      const pObj = s.precios[fuelType];
      const asis = pObj?.asistido || 0, auto = pObj?.autoservicio || 0;
      const price = (asis > 0 && auto > 0) ? Math.min(asis, auto) : (asis > 0 ? asis : auto);
      
      let htmlStr = '';
      if (isSelected) {
          const logoStr = s.logo ? `<img src="${s.logo}" style="width:100%;height:100%;object-fit:contain;padding:4px;border-radius:50%;background:white;box-sizing:border-box;"/>` : `<span style="font-size:12px;font-weight:900;color:#334155;">${s.distribuidor.substring(0,1)}</span>`;
          htmlStr = `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);"><div style="background:${color};width:36px;height:36px;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.3);animation: pulse 1.5s infinite;">${logoStr}</div><div style="background:#2563eb;color:white;font-size:12px;font-weight:900;padding:2px 8px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.2);margin-top:4px;white-space:nowrap;width:max-content;">$${price}</div></div>`;
      } else {
          htmlStr = `<div style="background:white;border:1.5px solid ${color};color:${color};font-size:11px;font-weight:900;padding:2px 6px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.15);text-align:center;white-space:nowrap;transform:translate(-50%, -50%);width:max-content;">$${price}</div>`;
      }

      return `var m_${s.id.replace(/\W/g,"")} = L.marker([${s.lat}, ${s.lon}], {icon: L.divIcon({className: '', html: \`${htmlStr}\`, iconSize: [0, 0]}), zIndexOffset:${isSelected?1000:1}}).addTo(map); m_${s.id.replace(/\W/g,"")}.on('click', function(){ window.parent.postMessage({type:'STATION_CLICKED', id:'${s.id}'}, '*'); });`;
  }).join("\n");
  
  let userMarkerJs = userLoc ? `L.marker([${userLoc.lat}, ${userLoc.lon}], {icon: L.divIcon({className: 'custom-leaflet-icon', html: '<div style="background:#2563eb;width:100%;height:100%;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.4)"></div>', iconSize:[16,16]}), zIndexOffset: 2000}).addTo(map).bindPopup("<b>Tu ubicación</b>");` : "";
  
  let mapViewJs = "";
  if (showRouteLine && selectedStation && userLoc) {
     mapViewJs = `
       var r = L.polyline([[${userLoc.lat}, ${userLoc.lon}], [${selectedStation.lat}, ${selectedStation.lon}]], {color:'#3b82f6', weight:3, dashArray:'6,8'}).addTo(map); 
       map.fitBounds(r.getBounds(), {padding: [50, 50]});
     `;
  } else if (selectedStation) {
     mapViewJs = `
       var target = L.latLng(${selectedStation.lat}, ${selectedStation.lon});
       map.setView(target, 14);
     `;
  } else {
     mapViewJs = `
       setTimeout(function() {
          var b = L.latLngBounds([${stations.map(s=>`[${s.lat},${s.lon}]`).join(",")}]);
          if(b.isValid()) {
              map.fitBounds(b, {padding: [50, 50]});
          }
       }, 100);
     `;
  }

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body{margin:0;padding:0;background:#e2e8f0;width:100%;height:100%;}#map{width:100%;height:100vh;}.leaflet-control-attribution{display:none!important;} .custom-leaflet-icon { background: transparent; border: none; } @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }</style></head><body><div id="map"></div><script>var map = L.map('map', { zoomControl: false }); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map); ${markersJs} ${userMarkerJs} ${mapViewJs}</script></body></html>`;
}

// =====================================================================
// COMPONENTES AUTOCOMPLETE
// =====================================================================
const RouteCityAutocomplete = ({ placeholder, value, onSelect, comunasData, hideClear }) => {
  const [query, setQuery] = useState(value ? value.mainName : "");
  const [localResults, setLocalResults] = useState([]);
  const [externalResults, setExternalResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => { setQuery(value ? value.mainName : ""); }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) { setLocalResults([]); setExternalResults([]); return; }
    const safeQuery = normalizeString(query);
    if (!safeQuery || (value && normalizeString(value.mainName) === safeQuery)) {
      setLocalResults(comunasData.slice(0, 15)); setExternalResults([]); return;
    }
    const filtered = comunasData.filter(c => normalizeString(c.mainName).includes(safeQuery)).slice(0, 5);
    setLocalResults(filtered);
    if (safeQuery.length >= 3) {
      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&q=${encodeURIComponent(query)}&limit=5`);
          const data = await res.json();
          setExternalResults(data.map(d => ({ mainName: d.name || d.display_name.split(',')[0], regionName: d.display_name.split(',').slice(1,3).join(','), lat: parseFloat(d.lat), lon: parseFloat(d.lon), isExternal: true })).filter(ex => !filtered.some(loc => normalizeString(loc.mainName) === normalizeString(ex.mainName))));
        } catch (err) { console.warn("Nominatim API warn:", err); } finally { setIsSearching(false); }
      }, 800);
      return () => clearTimeout(timeoutId);
    } else { setExternalResults([]); setIsSearching(false); }
  }, [query, isOpen, comunasData, value]);

  const handleSelectItem = (item) => {
    setQuery(item.mainName);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative w-full flex-1">
      <input type="text" value={query || ""} onFocus={() => setIsOpen(true)} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); if (value && value.mainName !== e.target.value) onSelect(null); }} placeholder={placeholder} className="w-full py-2 pr-10 text-[16px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400" />
      {isSearching ? <Loader2 className="absolute right-2 top-2.5 w-4 h-4 text-blue-500 animate-spin" /> : value && value.mainName === query && !hideClear ? <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(null); setIsOpen(true); }} className="absolute right-2 top-2.5 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button> : !hideClear ? <Search className="absolute right-2 top-2.5 w-4 h-4 text-slate-300" /> : null}
      {isOpen && (localResults.length > 0 || externalResults.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
          {localResults.length > 0 && <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase sticky top-0">Comunas</div>}
          {localResults.map((r, i) => (<div key={`loc-${i}`} onMouseDown={(e) => { e.preventDefault(); handleSelectItem(r); }} className="p-3 px-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 flex items-baseline justify-between"><span className="text-sm font-bold text-slate-800">{r.mainName}</span> <span className="text-[10px] text-slate-400 font-medium">{r.regionName}</span></div>))}
          {externalResults.length > 0 && <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase sticky top-0 border-t">Lugares</div>}
          {externalResults.map((r, i) => (<div key={`ext-${i}`} onMouseDown={(e) => { e.preventDefault(); handleSelectItem(r); }} className="p-3 px-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 flex items-baseline justify-between"><span className="text-[13px] font-bold text-slate-800">{r.mainName}</span> <span className="text-[10px] text-slate-400 font-medium">{r.regionName}</span></div>))}
        </div>
      )}
    </div>
  );
};

const ComunaAutocomplete = ({ placeholder, value, onSelect, comunas }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) { setResults([]); return; }
    const safeQuery = normalizeString(query);
    setResults(safeQuery ? comunas.filter(c => normalizeString(c.comuna).includes(safeQuery)).slice(0, 50) : comunas.slice(0, 50));
  }, [query, isOpen, comunas, value]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input type="text" value={query || ""} onFocus={() => setIsOpen(true)} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); if (value && value !== e.target.value) onSelect(""); }} placeholder={placeholder} className="w-full py-4 pl-4 pr-10 text-[16px] font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400" />
      {value === query && value !== "" ? <button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(""); onSelect(""); setIsOpen(true); }} className="absolute right-4 top-4 text-blue-500"><X className="w-5 h-5" /></button> : <Search className="absolute right-4 top-4 w-5 h-5 text-slate-300" />}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
          {results.map((c) => (<li key={c.comuna} onMouseDown={(e) => { e.preventDefault(); onSelect(c.comuna); setIsOpen(false); }} className="p-3 px-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 flex items-baseline justify-between"><span className="text-sm font-bold text-slate-800">{c.comuna}</span> <span className="text-[10px] text-slate-400 font-medium">{c.regionName}</span></li>))}
        </ul>
      )}
    </div>
  );
};

// =====================================================================
// APP PRINCIPAL
// =====================================================================
export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'app', 'blog', 'post', 'about', 'privacy', 'terms'
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [calcMode, setCalcMode] = useState("carga");
  const [fuelType, setFuelType] = useState(() => localStorage.getItem('andesruta_fuel') || "93");
  const [efficiencyKml, setEfficiencyKml] = useState(() => localStorage.getItem('andesruta_eff') || "12");
  const [includeTolls, setIncludeTolls] = useState(() => localStorage.getItem('andesruta_tolls') !== "false");
  const [recentComunas, setRecentComunas] = useState(() => JSON.parse(localStorage.getItem('andesruta_recent_comunas') || '[]'));

  const [mobileStep, setMobileStep] = useState(1);
  const cargaListRef = useRef(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempEff, setTempEff] = useState(efficiencyKml || "12");
  const [tempFuel, setTempFuel] = useState(fuelType);
  const [tempTolls, setTempTolls] = useState(includeTolls);
  
  const [showStationModal, setShowStationModal] = useState(false);
  const [legalView, setLegalView] = useState(null);
  
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcVal, setCalcVal] = useState("");
  const [calcUnit, setCalcUnit] = useState("money");
  const [calcFuelType, setCalcFuelType] = useState(fuelType);

  const [urlParsed, setUrlParsed] = useState(false);
  const [distanceKm, setDistanceKm] = useState("0");
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const [originCity, setOriginCity] = useState(null);
  const [destCity, setDestCity] = useState(null);
  const [waypoints, setWaypoints] = useState([]); 

  const [routeGeometry, setRouteGeometry] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [stationsMapUrl, setStationsMapUrl] = useState("");

  const [cneStations, setCneStations] = useState([]);
  const [cargaComuna, setCargaComuna] = useState("");
  const [currentStation, setCurrentStation] = useState(null);
  
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [isLocating, setIsLocating] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [authStatus, setAuthStatus] = useState("pending");
  const [routeError, setRouteError] = useState(false);

  const [detectedTolls, setDetectedTolls] = useState({ total: 0, list: [] });
  const [showTollsModal, setShowTollsModal] = useState(false);

  // Evitar doble scroll en vista de mapa en móviles mediante fixed layout del contenedor padre,
  // y también bloquear el body overflow en caso de emergencias por barras de navegación safari.
  useEffect(() => {
    if (window.innerWidth < 1024) {
      if (mobileStep === 2 && currentView === 'app') {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileStep, currentView]);

  const availableComunas = React.useMemo(() => {
    const map = new globalThis.Map();
    cneStations.forEach(s => { if (s.comuna && !map.has(s.comuna)) map.set(s.comuna, s.regionName); });
    return Array.from(map.entries()).map(([comuna, regionName]) => ({ comuna, regionName })).sort((a, b) => a.comuna.localeCompare(b.comuna));
  }, [cneStations]);

  const comunasDataForRouting = React.useMemo(() => {
    const comunasObj = {};
    cneStations.forEach((s) => {
      if (s.lat !== 0 && s.lon !== 0) {
        if (!comunasObj[s.comuna]) {
          comunasObj[s.comuna] = { mainName: s.comuna, name: s.comuna, regionId: s.regionId, regionName: s.regionName, latSum: 0, lonSum: 0, count: 0 };
        }
        comunasObj[s.comuna].latSum += s.lat;
        comunasObj[s.comuna].lonSum += s.lon;
        comunasObj[s.comuna].count += 1;
      }
    });

    return Object.values(comunasObj).map((c) => ({
        mainName: c.mainName, name: c.name, regionId: c.regionId, regionName: c.regionName, lat: c.latSum / c.count, lon: c.lonSum / c.count,
    })).sort((a, b) => a.mainName.localeCompare(b.mainName));
  }, [cneStations]);

  // Inyección del Script de AdSense
  useEffect(() => {
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6243319897431930";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  // URL Sync
  useEffect(() => {
    if (cneStations.length > 0 && !urlParsed) {
      const params = new URLSearchParams(window.location.search);
      let setAppView = false;
      
      if (params.get('origen') || params.get('destino')) {
        setCalcMode('viaje');
        setAppView = true;
        const oParam = params.get('origen');
        const dParam = params.get('destino');

        if (oParam) {
          const normO = normalizeString(oParam);
          const foundO = comunasDataForRouting.find(c => normalizeString(c.mainName) === normO || normalizeString(c.mainName).includes(normO));
          if (foundO) setOriginCity(foundO);
          else setOriginCity({ mainName: oParam, name: oParam, isExternal: true });
        }
        
        if (dParam) {
          const normD = normalizeString(dParam);
          const foundD = comunasDataForRouting.find(c => normalizeString(c.mainName) === normD || normalizeString(c.mainName).includes(normD));
          if (foundD) setDestCity(foundD);
          else setDestCity({ mainName: dParam, name: dParam, isExternal: true });
        }
      } else if (params.get('comuna')) {
        setCalcMode('carga');
        setAppView = true;
        const queryComuna = normalizeString(params.get('comuna'));
        let foundComuna = availableComunas.find(c => normalizeString(c.comuna) === queryComuna);
        if (!foundComuna) {
           foundComuna = availableComunas.find(c => normalizeString(c.comuna).includes(queryComuna) || queryComuna.includes(normalizeString(c.comuna)));
        }
        setCargaComuna(foundComuna ? foundComuna.comuna : decodeURIComponent(params.get('comuna')).toUpperCase());
      } else {
        setCalcMode('carga');
        setCargaComuna(''); 
      }
      
      if (setAppView) {
        setCurrentView('app');
      }
      setUrlParsed(true);
    }
  }, [cneStations, urlParsed, availableComunas, comunasDataForRouting]);

  useEffect(() => {
    if (!urlParsed) return;
    const params = new URLSearchParams();
    if (calcMode === 'carga' && cargaComuna) params.set('comuna', cargaComuna.toLowerCase());
    else if (calcMode === 'viaje') {
      if (originCity?.mainName) params.set('origen', originCity.mainName.toLowerCase());
      if (destCity?.mainName) params.set('destino', destCity.mainName.toLowerCase());
    }
    const q = params.toString();
    try { window.history.replaceState({}, '', `${window.location.pathname}${q ? '?'+q : ''}`); } catch(e) { console.warn("History API bloqueada", e); }
  }, [calcMode, cargaComuna, originCity, destCity, urlParsed]);

  const addWaypoint = () => { if (waypoints.length < 3) setWaypoints([...waypoints, null]); };
  const updateWaypoint = (index, value) => { const newWps = [...waypoints]; newWps[index] = value; setWaypoints(newWps); };
  const removeWaypoint = (index) => { const newWps = [...waypoints]; newWps.splice(index, 1); setWaypoints(newWps); };
  const moveWaypoint = (index, dir) => {
    const newWps = [...waypoints]; const tIdx = index + dir;
    if (tIdx >= 0 && tIdx < newWps.length) { const temp = newWps[index]; newWps[index] = newWps[tIdx]; newWps[tIdx] = temp; setWaypoints(newWps); }
  };

  const handleSeoLinkClick = (e, comuna) => { e.preventDefault(); setCalcMode('carga'); setCargaComuna(comuna.toUpperCase()); setMobileStep(1); setCurrentView('app'); window.scrollTo(0,0); };

  useEffect(() => { setCurrentStation(null); setShowStationModal(false); if (cargaListRef.current) cargaListRef.current.scrollTop = 0; }, [cargaComuna, fuelType, sortBy]);

  const handleSelectComuna = (c) => {
    setCargaComuna(c); setSortBy('price'); 
    if (c) {
      const up = [c, ...recentComunas.filter(rc => rc !== c)].slice(0, 3);
      setRecentComunas(up); localStorage.setItem('andesruta_recent_comunas', JSON.stringify(up));
      if (window.innerWidth < 1024) setMobileStep(1);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          setUserLocation({ lat, lon });
          let closest = "", minD = Infinity;
          cneStations.forEach(s => { const d = getStraightLineDistance(lat, lon, s.lat, s.lon); if(d < minD) { minD = d; closest = s.comuna; } });
          if (closest) handleSelectComuna(closest);
          setIsLocating(false);
        },
        () => setIsLocating(false), { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else setIsLocating(false);
  };

  const filteredStationsCarga = React.useMemo(() => {
    if (!cargaComuna) return [];
    const now = Date.now();
    const query = normalizeString(cargaComuna);

    let list = cneStations.filter((s) => {
      const sCom = normalizeString(s.comuna);
      // Coincidencia exacta o parcial
      const isMatch = sCom === query || sCom.includes(query) || query.includes(sCom);
      return isMatch && getBestPrice(s.precios[fuelType]) > 0;
    }).map((s) => ({ ...s, isOutdated: s.timestampAct === 0 || now - s.timestampAct > 604800000, distToUser: userLocation ? getStraightLineDistance(userLocation.lat, userLocation.lon, s.lat, s.lon) : null, hasAuto: ["93", "95", "97", "diesel", "parafina"].some(t => s.precios[t]?.autoservicio > 0) }));
    
    list.sort((a, b) => { if (a.isOutdated !== b.isOutdated) return a.isOutdated ? 1 : -1; if (sortBy === 'distance' && a.distToUser !== null && b.distToUser !== null) return a.distToUser - b.distToUser; return getBestPrice(a.precios[fuelType]) - getBestPrice(b.precios[fuelType]); });
    return list;
  }, [cneStations, cargaComuna, fuelType, sortBy, userLocation]);

  const isUserNearCurrentComuna = React.useMemo(() => userLocation && filteredStationsCarga.some(s => s.distToUser !== null && s.distToUser <= 50), [userLocation, filteredStationsCarga]);

  useEffect(() => { if (showSettingsModal) { setTempEff(efficiencyKml || "12"); setTempFuel(fuelType); setTempTolls(includeTolls); } }, [showSettingsModal, efficiencyKml, fuelType, includeTolls]);
  const handleSaveSettings = () => { setEfficiencyKml(tempEff); setFuelType(tempFuel); setIncludeTolls(tempTolls); localStorage.setItem('andesruta_eff', tempEff); localStorage.setItem('andesruta_fuel', tempFuel); localStorage.setItem('andesruta_tolls', tempTolls); setShowSettingsModal(false); };

  // Listener para clics en los pines del mapa
  useEffect(() => {
    const handleMsg = (e) => { 
       if (e.data?.type === "STATION_CLICKED") { 
          const c = filteredStationsCarga.find(s => s.id === e.data.id); 
          if (c) { 
             setCurrentStation(c); 
             if (window.innerWidth < 1024) setMobileStep(2);
          } 
       } 
    };
    window.addEventListener("message", handleMsg); return () => window.removeEventListener("message", handleMsg);
  }, [filteredStationsCarga]);

  useEffect(() => { if (currentStation && calcMode === 'carga' && window.innerWidth >= 1024) setTimeout(() => document.getElementById(`station-card-${currentStation.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }, [currentStation, calcMode]);

  useEffect(() => {
    if (calcMode === "carga" && cargaComuna && filteredStationsCarga.length > 0) {
      const url = URL.createObjectURL(new Blob([generateStationsMapHtml(filteredStationsCarga, currentStation, userLocation, userLocation && currentStation?.distToUser <= 50, fuelType)], { type: "text/html" }));
      setStationsMapUrl(url); return () => URL.revokeObjectURL(url);
    } else setStationsMapUrl("");
  }, [cargaComuna, fuelType, currentStation, filteredStationsCarga, calcMode, userLocation]);

  useEffect(() => {
    if (calcMode === "viaje" && originCity && destCity && parseFloat(distanceKm) >= 0) {
      const url = URL.createObjectURL(new Blob([generateMapHtml(originCity, destCity, routeGeometry, isRoundTrip, detectedTolls.list, waypoints.filter(w => w !== null))], { type: "text/html" }));
      setMapUrl(url); return () => URL.revokeObjectURL(url);
    }
  }, [originCity, destCity, waypoints, routeGeometry, distanceKm, calcMode, isRoundTrip, detectedTolls.list]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (calcMode !== "viaje") return;
      
      const validWaypoints = waypoints.filter(w => w !== null && w.lat !== undefined);
      
      if (!originCity || !destCity || originCity.lat === undefined || destCity.lat === undefined) { 
          setDistanceKm("0"); 
          setRouteGeometry(null); 
          setDetectedTolls({ total: 0, list: [] }); 
          setRouteError(false); 
          return; 
      }
      
      setIsCalculatingRoute(true); setRouteError(false);
      const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const getRouteData = async (points) => {
        const coordsOSRM = points.map(p => `${p.lon},${p.lat}`).join(';');
        console.log("🛣️ Consultando API de rutas con puntos:", coordsOSRM);
        
        // Petición exclusiva y estricta a formato GeoJSON en dos servidores OSRM estables.
        const urls = [
          `https://router.project-osrm.org/route/v1/driving/${coordsOSRM}?overview=full&geometries=geojson`,
          `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsOSRM}?overview=full&geometries=geojson`
        ];

        for (const url of urls) {
           try {
             const res = await fetch(url, { signal: controller.signal });
             if (!res.ok) continue;
             const data = await res.json();
             if (data && data.routes && data.routes.length > 0) {
                return { geo: data.routes[0].geometry, dist: data.routes[0].distance / 1000 };
             }
           } catch(e) { console.warn("Ruta falló para URL:", url); }
        }
        throw new Error("Ambas APIs de ruta fallaron.");
      };

      try {
        const outboundPoints = [originCity, ...validWaypoints, destCity];
        const outboundResult = await getRouteData(outboundPoints);

        let finalDist = outboundResult.dist, finalGeo = outboundResult.geo;
        let tollsOut = detectTollsInRoute(finalGeo);
        let finalTollsTotal = tollsOut.total, finalTollsList = tollsOut.list;

        if (isRoundTrip) {
            const retRes = await getRouteData([destCity, originCity]);
            finalDist += retRes.dist;
            finalGeo = { type: "LineString", coordinates: [...outboundResult.geo.coordinates, ...retRes.geo.coordinates] };
            let tollsRet = detectTollsInRoute(retRes.geo);
            finalTollsTotal += tollsRet.total;
            finalTollsList = [...finalTollsList, ...tollsRet.list.map(t => ({ ...t, id: t.id + '_vuelta', nombre: t.nombre + " (Vuelta)" }))];
        }
        setDistanceKm(finalDist.toFixed(1)); setRouteGeometry(finalGeo); setDetectedTolls({ total: finalTollsTotal, list: finalTollsList });
      } catch (err) {
        console.error("🔥 Error crítico en cálculo de ruta:", err);
        const pts = [originCity, ...validWaypoints, destCity];
        let fallbackDist = 0; for(let i=0; i<pts.length-1; i++) fallbackDist += calculateHaversineDistance(pts[i].lat, pts[i].lon, pts[i+1].lat, pts[i+1].lon);
        let fakeGeoOut = { coordinates: pts.map(p => [p.lon, p.lat]) }, tollsOut = detectTollsInRoute(fakeGeoOut);
        let finalDist = fallbackDist, finalGeo = fakeGeoOut, finalTollsTotal = tollsOut.total, finalTollsList = tollsOut.list;

        if (isRoundTrip) {
            finalDist += calculateHaversineDistance(destCity.lat, destCity.lon, originCity.lat, originCity.lon);
            let fakeGeoRet = { coordinates: [[destCity.lon, destCity.lat], [originCity.lon, originCity.lat]] };
            finalGeo = { type: "LineString", coordinates: [...fakeGeoOut.coordinates, ...fakeGeoRet.coordinates] };
            let tollsRet = detectTollsInRoute(fakeGeoRet);
            finalTollsTotal += tollsRet.total;
            finalTollsList = [...finalTollsList, ...tollsRet.list.map(t => ({ ...t, id: t.id + '_vuelta', nombre: t.nombre + " (Vuelta)" }))];
        }
        setDistanceKm(finalDist.toFixed(1)); setRouteGeometry(finalGeo); setDetectedTolls({ total: finalTollsTotal, list: finalTollsList }); setRouteError(true);
      } finally { clearTimeout(timeoutId); setIsCalculatingRoute(false); }
    };
    fetchRoute();
  }, [originCity, destCity, waypoints, calcMode, isRoundTrip]);

  useEffect(() => {
    const fetchPrecios = async () => {
      setIsLoading(true);
      try {
        console.log("🚀 Iniciando conexión con CNE (Login)... RUTA:", RUTA_LOGIN);
        
        // Uso de URL absoluta genérica para evitar errores de parseo en entornos sin origen definido
        const loginUrl = new URL(RUTA_LOGIN, window.location.origin === "null" ? "https://api.cne.cl" : window.location.origin).href;
        const estUrl = new URL(RUTA_ESTACIONES, window.location.origin === "null" ? "https://api.cne.cl" : window.location.origin).href;
        
        const loginRes = await fetch(loginUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "email=nicolas0645@gmail.com&password=12qwaszxL" });
        console.log("✅ Status Login CNE:", loginRes.status);
        
        if (!loginRes.ok) throw new Error(`Error en Login.`);
        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token;
        if (token) {
          console.log("🔑 Token obtenido correctamente. Consultando Estaciones...");
          setAuthStatus("success");
          const stRes = await fetch(estUrl, { headers: { Token: token, Authorization: `Bearer ${token}`, Accept: "application/json" } });
          console.log("✅ Status Estaciones CNE:", stRes.status);
          const stData = await stRes.json();
          const raw = Array.isArray(stData) ? stData : stData.data || stData.estaciones || [];
          console.log(`📊 Se recibieron ${raw.length} estaciones crudas desde la API.`);
          
          const seen = new Set(), cleanList = [];
          raw.forEach((s) => {
            let distribuidorStr = s.distribuidor?.marca || s.distribuidor?.nombre || s.distribuidor || s.razon_social || "Independiente";
            if (distribuidorStr.toLowerCase().includes("petrobras")) distribuidorStr = "Aramco";
            const direccionStr = s.ubicacion?.direccion || s.direccion || s.calle || "";
            const key = `${distribuidorStr}-${direccionStr}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              let p = { 93: { asistido: 0, autoservicio: 0 }, 95: { asistido: 0, autoservicio: 0 }, 97: { asistido: 0, autoservicio: 0 }, diesel: { asistido: 0, autoservicio: 0 }, parafina: { asistido: 0, autoservicio: 0 } };
              let ts = 0, act = "";
              const objPrecios = s.precios || s.combustibles || s.precios_combustibles || s;
              if (objPrecios && typeof objPrecios === "object") {
                Object.entries(objPrecios).forEach(([k, v]) => {
                  if (!v) return;
                  let val = parseFloat(String(typeof v === "object" ? v.precio || v.valor || v.monto || 0 : v).replace(",", "."));
                  if (isNaN(val)) val = 0;
                  if (val > 0 && val < 10) val = Math.round(val * 1000); else val = Math.round(val);
                  if (val < 500 || val > 3000) return;
                  const n = k.toUpperCase();
                  let matchedKey = n.includes("93") ? "93" : n.includes("95") ? "95" : n.includes("97") ? "97" : (n === "DI" || n === "ADI" || n.includes("DIESEL") || n.includes("PETRO")) ? "diesel" : (n === "KE" || n.includes("KERO") || n.includes("PARAFINA")) ? "parafina" : null;
                  if (matchedKey && val > 0) {
                    let isAuto = (typeof v === "object" && v.tipo_atencion) ? v.tipo_atencion.toLowerCase().includes("auto") : n.startsWith("A");
                    if (isAuto) p[matchedKey].autoservicio = val; else p[matchedKey].asistido = val;
                    if (typeof v === "object" && v.fecha_actualizacion) {
                      let f = v.fecha_actualizacion, h = v.hora_actualizacion || "00:00:00";
                      if (f.includes("-")) { const d = f.split("-"); if (d[0].length === 2 && d.length === 3) f = `${d[2]}-${d[1]}-${d[0]}`; }
                      const dt = new Date(`${f}T${h}`);
                      if (!isNaN(dt.getTime()) && dt.getTime() > ts) { ts = dt.getTime(); act = `${v.fecha_actualizacion} ${h}`.trim(); }
                    }
                  }
                });
              }
              let comunaStr = s.ubicacion?.nombre_comuna || s.nombre_comuna || s.comuna || s.comuna_nombre || "Desconocida";
              
              // Estandarización automática de Santiago a Santiago Centro
              if (normalizeString(comunaStr) === "santiago") {
                 comunaStr = "Santiago Centro";
              }

              const regionNameStr = s.ubicacion?.nombre_region || s.nombre_region || s.region || "";
              const latVal = parseFloat(String(s.ubicacion?.latitud || s.latitud || s.ubicacion?.lat || "0").replace(",", ".")), lonVal = parseFloat(String(s.ubicacion?.longitud || s.longitud || s.ubicacion?.lng || "0").replace(",", "."));
              if (p["93"].asistido > 0 || p["93"].autoservicio > 0 || p["diesel"].asistido > 0 || p["diesel"].autoservicio > 0 || p["95"].asistido > 0 || p["95"].autoservicio > 0) {
                cleanList.push({ id: s.codigo || s.id || Math.random().toString(), comuna: comunaStr, distribuidor: distribuidorStr, direccion: direccionStr, lat: isNaN(latVal) ? 0 : latVal, lon: isNaN(lonVal) ? 0 : lonVal, precios: p, timestampAct: ts, actualizacion: act, regionId: extractRegionId(regionNameStr), regionName: regionNameStr, logo: s.distribuidor?.logo });
              }
            }
          });
          setCneStations(cleanList.filter((s) => s.lat !== 0 && s.lon !== 0 && s.comuna !== "Desconocida"));
        } else {
           console.error("🔥 Error: El login de la CNE respondió pero NO entregó el Token.");
           setAuthStatus("error");
        }
      } catch (e) {
        console.error("🔥 Error Crítico conectando a la API:", e);
        console.warn("⚠️ Cargando datos DEMO / MOCK de respaldo...");
        setAuthStatus("demo");
        const MOCK_STATIONS = [
          { id: "m1", comuna: "Santiago Centro", distribuidor: "Copec", direccion: "Av. Providencia 123", lat: -33.4489, lon: -70.6693, precios: { 93: { asistido: 1320, autoservicio: 1300 }, 95: { asistido: 1360 }, 97: { asistido: 1400 }, diesel: { asistido: 1050 }, parafina: { asistido: 950 } }, actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now() },
          { id: "m2", comuna: "Providencia", distribuidor: "Shell", direccion: "Los Leones 456", lat: -33.424, lon: -70.601, precios: { 93: { asistido: 1315, autoservicio: 1290 }, 95: { asistido: 1355 }, 97: { asistido: 1395 }, diesel: { asistido: 1045 } }, actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now() },
          { id: "m3", comuna: "Las Condes", distribuidor: "Aramco", direccion: "Apoquindo 789", lat: -33.414, lon: -70.570, precios: { 93: { asistido: 1330, autoservicio: 1310 }, 95: { asistido: 1370 }, 97: { asistido: 1410 }, diesel: { asistido: 1060 } }, actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now() },
          { id: "m4", comuna: "Maipú", distribuidor: "Copec", direccion: "Pajaritos 100", lat: -33.510, lon: -70.758, precios: { 93: { asistido: 1300, autoservicio: 1280 }, 95: { asistido: 1340 }, 97: { asistido: 1380 }, diesel: { asistido: 1030 } }, actualizacion: "Hoy", regionId: "RM", regionName: "Región Metropolitana", timestampAct: Date.now() },
          { id: "m5", comuna: "Viña del Mar", distribuidor: "Shell", direccion: "Av. Libertad 456", lat: -33.0153, lon: -71.5505, precios: { 93: { asistido: 1310 }, 95: { asistido: 1350 }, 97: { asistido: 1390 }, diesel: { asistido: 1040 }, parafina: { asistido: 940 } }, actualizacion: "Hoy", regionId: "V", regionName: "Valparaíso", timestampAct: Date.now() },
          { id: "m6", comuna: "Concepción", distribuidor: "Aramco", direccion: "O'Higgins 200", lat: -36.826, lon: -73.049, precios: { 93: { asistido: 1325 }, 95: { asistido: 1365 }, 97: { asistido: 1405 }, diesel: { asistido: 1055 } }, actualizacion: "Hoy", regionId: "VIII", regionName: "Biobío", timestampAct: Date.now() },
          { id: "m7", comuna: "Antofagasta", distribuidor: "Copec", direccion: "Av. Brasil 300", lat: -23.650, lon: -70.400, precios: { 93: { asistido: 1340 }, 95: { asistido: 1380 }, 97: { asistido: 1420 }, diesel: { asistido: 1070 } }, actualizacion: "Hoy", regionId: "II", regionName: "Antofagasta", timestampAct: Date.now() },
          { id: "m8", comuna: "Temuco", distribuidor: "Shell", direccion: "Caupolicán 1010", lat: -38.7359, lon: -72.5904, precios: { 93: { asistido: 1340 }, 95: { asistido: 1380 }, diesel: { asistido: 1070 } }, actualizacion: "Hoy", regionId: "IX", regionName: "Araucanía", timestampAct: Date.now() }
        ];
        setCneStations(MOCK_STATIONS);
      } finally { setIsLoading(false); }
    };
    fetchPrecios();
  }, []);

  let pricePerLiter = 0;
  if (calcMode === "viaje" && originCity && destCity) {
    const regionStations = cneStations.filter((s) => s.regionId === originCity.regionId && getBestPrice(s.precios[fuelType]) > 0);
    if (regionStations.length > 0) pricePerLiter = Math.round(regionStations.reduce((acc, s) => acc + getBestPrice(s.precios[fuelType]), 0) / regionStations.length);
  }

  const baseDist = parseFloat(distanceKm) || 0;
  const displayDistanceKm = baseDist.toFixed(1);
  const eff = parseFloat(efficiencyKml) || 1;
  const litersNeeded = eff > 0 ? parseFloat(displayDistanceKm) / eff : 0;
  const bencinaTotal = litersNeeded * pricePerLiter;
  const peajeTotal = includeTolls ? detectedTolls.total : 0;
  const resultValue = bencinaTotal + peajeTotal;

  function formatCLP(value) { return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(isNaN(value) || !isFinite(value) ? 0 : value); }
  const handleSwapCities = () => { const temp = originCity; setOriginCity(destCity); setDestCity(temp); setWaypoints([...waypoints].reverse()); };

  // =====================================================================
  // COMPONENTES DE RENDERIZADO INTERNOS
  // =====================================================================
  
  const renderStationCard = (station, idx) => {
    const isCheapest = idx === 0 && !station.isOutdated && sortBy === 'price';
    const bestPrice = getBestPrice(station.precios[fuelType]);
    
    const pObjList = station.precios[fuelType];
    const autoPriceList = pObjList?.autoservicio || 0;
    const asisPriceList = pObjList?.asistido || 0;
    let autoLabelList = "Autoservicio";
    if (autoPriceList > 0 && asisPriceList > 0 && autoPriceList < asisPriceList) {
      autoLabelList = `Auto -$${asisPriceList - autoPriceList}`;
    }

    return (
      <React.Fragment key={station.id}>
        <div id={`station-card-${station.id}`} 
             onClick={() => { 
                setCurrentStation(station); 
                setShowCalcModal(false); 
                if (window.innerWidth < 1024) setMobileStep(2);
             }} 
             className={`w-full shrink-0 flex flex-col p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 bg-white border ${currentStation?.id === station.id ? 'border-blue-400 shadow-md ring-2 ring-blue-400/20 scale-[1.02] z-10' : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md hover:scale-[1.01] transform-gpu'}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col flex-1 overflow-hidden pr-2">
              <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1.5">
                {station.logo ? (<img src={station.logo} alt={station.distribuidor} className="h-6 w-6 object-contain rounded-full bg-white p-0.5 border border-slate-100" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />) : null}
                <Fuel className="w-5 h-5 text-slate-400" style={{ display: station.logo ? "none" : "block" }} />
                <span className="font-black text-[13px] truncate text-slate-800">{station.distribuidor}</span>
                {isCheapest && <span className="text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0 flex items-center transition-colors text-emerald-800 bg-emerald-100 border border-emerald-200"><TrendingUp className="w-2.5 h-2.5 mr-0.5" /> TOP 1</span>}
                {station.hasAuto && <span className="text-[8px] font-black rounded-full px-1.5 py-0.5 shrink-0 uppercase transition-colors text-blue-700 bg-blue-50 border border-blue-100">{autoLabelList}</span>}
              </div>
              <span className="text-[11px] truncate font-bold text-slate-500" title={station.direccion}>{station.direccion}</span>
              <div className="flex items-center mt-2.5">
                <span className={`text-[9px] flex items-center font-bold ${station.isOutdated ? "text-red-400" : "text-slate-400"}`}>
                  {station.isOutdated ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {station.isOutdated ? "Desactualizado" : station.actualizacion ? station.actualizacion.split(" ")[0] : "--"}
                </span>
                {station.distToUser !== null && sortBy === 'distance' && <span className="text-[9px] font-black rounded-full px-1.5 py-0.5 ml-2 transition-colors text-blue-600 bg-blue-50 border border-blue-100">A {station.distToUser.toFixed(1)} km</span>}
              </div>
            </div>
            <div className="flex flex-col items-end justify-center shrink-0 pl-3 border-l border-slate-100 min-w-[80px]">
              <span className="text-2xl font-black tracking-tight text-slate-900">{formatCLP(bestPrice)}</span>
              <span className="text-[8px] font-black mt-1 uppercase text-slate-400 tracking-widest">{fuelType === "diesel" ? "Diesel" : fuelType === "parafina" ? "Parafina" : `${fuelType} Oct`}</span>
            </div>
          </div>
        </div>
        {idx > 0 && idx % 4 === 0 && <AdPlaceholder className="my-2" />}
      </React.Fragment>
    );
  };

  const renderCargaLeftPanel = () => (
    <div className="w-full flex flex-col items-center pt-4 lg:pt-0 px-4 sm:px-6 lg:px-0">
      {/* TARJETA: COMBUSTIBLE */}
      <div className="w-full space-y-3 shrink-0">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de combustible</h3>
        <div className="flex flex-wrap gap-2 pb-2">
          {FUEL_OPTIONS_CARGA.map((type) => {
            const isSelected = fuelType === type;
            return (
              <button key={type} onClick={() => { setFuelType(type); localStorage.setItem('andesruta_fuel', type); }} className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex-grow sm:flex-grow-0 text-center cursor-pointer ${isSelected ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-slate-50 border border-slate-200/60"}`}>
                {type === "diesel" ? "Diesel" : type === "parafina" ? "Parafina" : type + " Oct"}
              </button>
            )
          })}
        </div>
      </div>

      {/* TARJETA: UBICACIÓN */}
      <div className="mt-4 w-full space-y-3 shrink-0">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación</h3>
        <div className="bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <RouteCityAutocomplete placeholder="¿En qué comuna buscas?" value={{ mainName: cargaComuna }} onSelect={(val) => handleSelectComuna(val ? val.mainName : "")} comunasData={comunasDataForRouting} />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pl-2 pt-1">
           <button onClick={handleGetLocation} className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center transition-colors cursor-pointer shadow-sm">
              {isLocating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MapPin className="w-3 h-3 mr-1" />} Cerca de mí
           </button>
           {recentComunas.map(c => (
             <button key={c} onClick={() => handleSelectComuna(c)} className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer">{c}</button>
           ))}
        </div>

        {!cargaComuna && (
          <div className="mt-6 pt-4 border-t border-slate-200/60">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Búsquedas Populares</h4>
            <div className="flex flex-wrap gap-1.5">
               {POPULAR_COMUNAS.map(c => (
                 <a key={c} href={`?comuna=${encodeURIComponent(c.toLowerCase())}`} onClick={(e) => handleSeoLinkClick(e, c)} className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors cursor-pointer">{c}</a>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE ESTACIONES EN EL FLUJO WEB (DESKTOP) Y MÓVIL (BÚSQUEDA) */}
      {cargaComuna && filteredStationsCarga.length > 0 && (
        <div className="flex flex-col flex-1 mt-8 w-full animate-in fade-in duration-500">
          <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-4 shrink-0">
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{filteredStationsCarga.length} Resultados en {cargaComuna}</span>
             {isUserNearCurrentComuna && (
                  <div className="flex bg-white shadow-sm border border-slate-200 p-1 rounded-xl">
                    <button onClick={() => setSortBy('price')} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${sortBy === 'price' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Precio</button>
                    <button onClick={() => setSortBy('distance')} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${sortBy === 'distance' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cercanía</button>
                  </div>
             )}
          </div>
          <div className="flex-1 flex flex-col gap-4 pb-24 lg:pb-8 w-full" ref={cargaListRef}>
             {filteredStationsCarga.map((station, idx) => renderStationCard(station, idx))}
          </div>
        </div>
      )}

    </div>
  );

  const renderViajeLeftPanel = () => (
    <div className="space-y-6 pt-4 lg:pt-0 pb-6 lg:pb-0 w-full flex flex-col items-center px-4 sm:px-6 lg:px-0">
      <div className="bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative w-full">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
          <button onClick={handleSwapCities} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors active:scale-95 cursor-pointer border border-slate-200/50"><ArrowUpDown className="w-4 h-4" /></button>
        </div>
        <div className="flex relative pr-12">
           <div className="absolute top-5 bottom-5 left-5 w-[2px] border-l-2 border-dashed border-slate-200 z-0 -translate-x-1/2"></div>
           <div className="flex-1 flex flex-col w-full z-10">
              <div className="flex items-center w-full">
                 <div className="w-10 flex justify-center shrink-0"><div className="w-[14px] h-[14px] rounded-full border-[3px] border-blue-500 bg-white"></div></div>
                 <div className="flex-1 border-b border-slate-100 pb-2"><RouteCityAutocomplete placeholder="¿Desde dónde viajas?" value={originCity} onSelect={setOriginCity} comunasData={comunasDataForRouting} /></div>
              </div>
              {waypoints.map((wp, index) => (
                 <div key={index} className="flex items-center w-full py-2">
                    <div className="w-10 flex justify-center shrink-0"><div className="w-[12px] h-[12px] rounded-full border-[3px] border-amber-500 bg-white"></div></div>
                    <div className="flex-1 border-b border-slate-100 flex items-center pr-2 bg-amber-50/30 rounded-xl">
                       <div className="flex-1"><RouteCityAutocomplete hideClear placeholder={`Parada ${index + 1}...`} value={wp} onSelect={(val) => updateWaypoint(index, val)} comunasData={comunasDataForRouting} /></div>
                       <div className="flex items-center ml-1">
                          {waypoints.length > 1 && (
                            <div className="flex flex-col mx-1">
                              <button onClick={() => moveWaypoint(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-0.5 transition-colors cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
                              <button onClick={() => moveWaypoint(index, 1)} disabled={index === waypoints.length - 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 p-0.5 transition-colors cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                          <button onClick={() => removeWaypoint(index)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer shrink-0 ml-1"><X className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>
              ))}
              <div className="flex items-center w-full pt-2">
                 <div className="w-10 flex justify-center shrink-0"><MapPin className="w-[18px] h-[18px] text-red-500 fill-red-100" /></div>
                 <div className="flex-1"><RouteCityAutocomplete placeholder="¿Hacia dónde vas?" value={destCity} onSelect={setDestCity} comunasData={comunasDataForRouting} /></div>
              </div>
           </div>
        </div>
        {waypoints.length < 3 && (<button onClick={addWaypoint} className="mt-4 mb-1 text-xs font-bold text-blue-600 bg-blue-50 py-2.5 px-3 rounded-xl w-full flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100/50 shadow-sm"><Plus className="w-4 h-4" /> Añadir parada</button>)}
      </div>

      <div className="space-y-3 w-full">
         <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehículo</h3>
         <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
               <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Car className="w-5 h-5"/></div><span className="font-bold text-slate-700">Rendimiento</span></div>
               <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <input type="number" step="0.1" min="1" className="w-10 bg-transparent outline-none font-black text-right text-slate-900" value={efficiencyKml || ""} onChange={(e) => { setEfficiencyKml(e.target.value); localStorage.setItem('andesruta_eff', e.target.value); }} />
                  <span className="text-sm font-semibold text-slate-500">Km/L</span>
               </div>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
               <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500"><Fuel className="w-5 h-5"/></div><span className="font-bold text-slate-700">Combustible</span></div>
               <div className="relative">
                 <select className="bg-slate-50 pl-3 pr-8 py-2 rounded-xl border border-slate-200 font-black text-slate-900 outline-none cursor-pointer appearance-none" value={fuelType} onChange={(e) => { setFuelType(e.target.value); localStorage.setItem('andesruta_fuel', e.target.value); }}>
                    <option value="93">93 oct</option><option value="95">95 oct</option><option value="97">97 oct</option><option value="diesel">Diesel</option>
                 </select>
                 <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
               </div>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
               <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${includeTolls ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Ticket className="w-5 h-5"/></div><span className={`font-bold transition-colors ${includeTolls ? 'text-slate-700' : 'text-slate-400'}`}>Peajes y TAG</span></div>
               <div className="flex items-center gap-2 cursor-pointer" onClick={() => { const newVal = !includeTolls; setIncludeTolls(newVal); localStorage.setItem('andesruta_tolls', newVal); }}>
                 <span className={`text-xs font-bold transition-colors ${includeTolls ? 'text-emerald-600' : 'text-slate-400'}`}>{includeTolls ? 'Automático' : 'Omitir'}</span>
                 <div className={`w-10 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 ${includeTolls ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 ${includeTolls ? 'translate-x-4' : 'translate-x-0'}`}></div></div>
               </div>
            </div>
         </div>
      </div>

      <div className="hidden lg:block w-full"><AdPlaceholder /></div>
      
      {/* Botón de Calcular Viaje Fijo al final del formulario en Móvil */}
      <div className="lg:hidden w-full mt-4 shrink-0 pb-6">
         <button onClick={() => setMobileStep(2)} disabled={!originCity || !destCity} className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50">
            Calcular Viaje <ArrowRight className="w-5 h-5" />
         </button>
      </div>

    </div>
  );

  const renderFooterContentViaje = () => (
    <React.Fragment>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 gap-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Costo Total Viaje</span>
          <span className="text-[2.5rem] font-black text-slate-900 tracking-tight leading-none">{formatCLP(resultValue)}</span>
          {parseFloat(distanceKm) > 0 && (
             <div className="flex items-center gap-1 mt-3 text-blue-600 bg-blue-50 w-fit px-2.5 py-1.5 rounded-lg border border-blue-100">
                 <Route className="w-3.5 h-3.5" />
                 <span className="text-[11px] font-bold">{displayDistanceKm} km total {isRoundTrip ? '(Ida y vuelta)' : ''}</span>
             </div>
          )}
        </div>
        {resultValue > 0 && (
          <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
             <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-fit md:min-w-[280px]">
                 <div className="flex items-center gap-2">
                     <div className="bg-blue-100 p-1.5 rounded-lg"><Droplets className="w-4 h-4 text-blue-600" /></div>
                     <span className="text-[12px] font-bold text-slate-600">Combustible ({fuelType === "diesel" ? "Diésel" : fuelType === "parafina" ? "Paraf" : `${fuelType} Oct`})</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                     <span className="text-[13px] font-black text-slate-900">{formatCLP(bencinaTotal)}</span>
                     <span className="text-[9px] text-slate-400 font-semibold">({formatCLP(pricePerLiter)}/L)</span>
                 </div>
             </div>
             <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-fit md:min-w-[280px]">
                 <div className="flex items-center gap-2">
                     <div className="bg-amber-100 p-1.5 rounded-lg"><Ticket className="w-4 h-4 text-amber-600" /></div>
                     <span className="text-[12px] font-bold text-slate-600">Peajes y Autopistas</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                     <span className="text-[13px] font-black text-slate-900">{includeTolls ? formatCLP(peajeTotal) : 'Omitidos'}</span>
                 </div>
             </div>
          </div>
        )}
      </div>
      <button onClick={() => { if(detectedTolls.list.length > 0 && includeTolls) setShowTollsModal(true) }} disabled={detectedTolls.list.length === 0 || !includeTolls} className="w-full bg-slate-900 text-white rounded-[1.25rem] py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer">
        <Ticket className="w-5 h-5" /> {detectedTolls.list.length > 0 ? (includeTolls ? 'Ver desglose de peajes' : 'Peajes omitidos') : 'Sin peajes en la ruta'}
      </button>
    </React.Fragment>
  );

  const renderCargaRightPanel = () => {
    if (!cargaComuna || filteredStationsCarga.length === 0) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60 bg-slate-100 p-6 text-center lg:rounded-[2.5rem] lg:shadow-xl lg:border-[8px] lg:border-white">
           <MapPin className="w-16 h-16 mb-4" />
           <p className="text-lg font-bold max-w-xs">Selecciona una comuna para ver las estaciones cercanas en el mapa</p>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full h-full flex flex-col relative lg:rounded-[2.5rem] lg:shadow-xl lg:border-[8px] lg:border-white overflow-hidden bg-slate-200 lg:h-[calc(100vh-140px)] lg:sticky lg:top-[100px]">
        
        {/* Botón volver Mobile (Aparece en modo mapa) */}
        <div className="lg:hidden absolute top-4 left-4 z-40">
            <button onClick={() => {
                setMobileStep(1);
                setCurrentStation(null);
            }} className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-slate-100 text-slate-800 flex items-center justify-center cursor-pointer">
              <ChevronLeft className="w-6 h-6"/>
            </button>
        </div>

        {/* MAPA PRINCIPAL */}
        <div className="flex-1 w-full relative z-0 min-h-0">
           {stationsMapUrl ? <iframe key={`map-${stationsMapUrl}-${mobileStep}`} src={stationsMapUrl} title="Mapa Estaciones" className="absolute inset-0 w-full h-full" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" /> : <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>}
        </div>
        
        {/* PANEL DETALLE ESTACION (ADAPTABLE AL CONTENIDO) */}
        {currentStation && !showCalcModal && (
           <div className="w-full bg-white/95 backdrop-blur-xl p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.12)] pb-8 lg:pb-6 border-t border-slate-200 shrink-0 z-30 transition-all duration-300">

              <div className="flex flex-col overflow-hidden max-w-3xl mx-auto w-full">
                 <div className="flex justify-between items-start mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                       {currentStation.logo ? <img src={currentStation.logo} className="w-10 h-10 object-contain rounded-full border border-slate-100 p-1 bg-white" /> : <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Fuel className="w-6 h-6 text-slate-400" /></div>}
                       <div>
                          <h3 className="font-black text-slate-900 text-[16px] leading-tight">{currentStation.distribuidor}</h3>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5">{currentStation.direccion}</p>
                       </div>
                    </div>
                    <button onClick={(e) => { 
                        e.stopPropagation(); 
                        setCurrentStation(null); 
                        if (window.innerWidth < 1024) setMobileStep(1);
                    }} className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 transition-colors shrink-0 ml-2"><X className="w-4 h-4 text-slate-600"/></button>
                 </div>
                 
                 <div className="overflow-y-auto no-scrollbar pb-2 px-1">
                    
                    {/* Alerta de precios diferenciados */}
                    {["93", "95", "97", "diesel", "parafina"].some(t => {
                       const pBase = currentStation.precios[t];
                       return pBase && pBase.autoservicio > 0 && pBase.asistido > 0 && pBase.autoservicio < pBase.asistido;
                    }) && (
                      <div className="mb-4 mt-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-2.5 shadow-sm">
                          <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                          <span className="text-[11px] text-slate-700 leading-snug">
                            Esta estación tiene precios diferenciados. <b>Auto:</b> Autoservicio (tú cargas, más barato). <b>Asis:</b> Asistido (un atendedor realiza la carga).
                          </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4 mt-2">
                       {["93", "95", "97", "diesel", "parafina"].map((t) => {
                          const p = currentStation.precios[t];
                          if (!p || (p.asistido === 0 && p.autoservicio === 0)) return null;
                          const isThisFuelSelected = t === fuelType;
                          
                          const hasAuto = p.autoservicio > 0;
                          const hasAsis = p.asistido > 0;
                          const isAutoCheaper = hasAuto && hasAsis && p.autoservicio < p.asistido;
                          
                          return (
                            <div key={t} className={`rounded-xl p-2.5 flex justify-between items-center border ${isThisFuelSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-200'}`}>
                              <span className={`text-[10px] font-bold uppercase ${isThisFuelSelected ? 'text-blue-800' : 'text-slate-600'}`}>{t === "diesel" ? "Diesel" : t === "parafina" ? "Parafina" : `${t} Oct`}</span>
                              
                              <div className="flex flex-col items-end text-right">
                                 {isAutoCheaper ? (
                                    <>
                                       <span className={`text-[14px] font-black ${isThisFuelSelected ? 'text-blue-700' : 'text-slate-900'} leading-none`}>
                                          {formatCLP(p.autoservicio)} <span className="text-[9px] font-bold text-blue-500 uppercase ml-0.5">Auto</span>
                                       </span>
                                       <span className="text-[10px] font-semibold text-slate-400 mt-1">
                                          {formatCLP(p.asistido)} <span className="text-[8px] uppercase">Asis</span>
                                       </span>
                                    </>
                                 ) : (
                                    <span className={`text-[14px] font-black ${isThisFuelSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                                       {formatCLP(hasAsis ? p.asistido : p.autoservicio)}
                                    </span>
                                 )}
                              </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 <div className="flex gap-2 pt-3 border-t border-slate-100 mt-1 shrink-0">
                    <button onClick={() => { setCalcFuelType(fuelType); setShowCalcModal(true); }} className="flex-1 bg-slate-900 text-white rounded-xl py-3.5 text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"><Calculator className="w-4 h-4" /> Calcular</button>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${currentStation.lat},${currentStation.lon}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"><MapPin className="w-3.5 h-3.5" /> Llegar</a>
                 </div>
              </div>
           </div>
        )}

        {currentStation && showCalcModal && (
           <div className="w-full bg-white/95 backdrop-blur-xl p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.12)] pb-8 lg:pb-6 border-t border-slate-200 shrink-0 z-30 transition-all duration-300">
              
              <div className="flex flex-col overflow-hidden max-w-2xl mx-auto w-full">
                 <div className="flex justify-between items-center mb-3 shrink-0 px-1">
                    <h3 className="font-black text-slate-900 flex items-center text-lg"><Calculator className="w-5 h-5 mr-2 text-slate-900"/> Calculadora</h3>
                    <button onClick={() => {setShowCalcModal(false); setCalcVal("");}} className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-600"/></button>
                 </div>
                 <div className="overflow-y-auto no-scrollbar pb-2 px-1 space-y-4">
                    <div className="flex bg-slate-200/60 p-1.5 rounded-[1rem]">
                       <button onClick={() => { setCalcUnit("money"); setCalcVal(""); }} className={`flex-1 text-[12px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${calcUnit === 'money' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>💵 Pesos ($)</button>
                       <button onClick={() => { setCalcUnit("liters"); setCalcVal(""); }} className={`flex-1 text-[12px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${calcUnit === 'liters' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>⛽ Litros (L)</button>
                    </div>
                    <div className="relative">
                      <input type="number" min="0" step={calcUnit === "liters" ? "0.1" : "1000"} value={calcVal || ""} onChange={(e) => setCalcVal(e.target.value)} className="w-full p-3 text-center text-xl border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-900 bg-white shadow-sm" placeholder={calcUnit === "money" ? "Monto en $" : "Cantidad en Lts"} />
                    </div>
                    <div className="bg-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center mt-4">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{calcUnit === "money" ? "Recibirás aprox." : "Costo estimado"}</span>
                       <span className="text-2xl font-black text-slate-900">
                         {(() => {
                            const p = getBestPrice(currentStation.precios[calcFuelType]);
                            const v = parseFloat(calcVal) || 0;
                            if (!p || p === 0) return "---";
                            return calcUnit === "money" ? `${(v / p).toFixed(1)} Lts` : formatCLP(v * p);
                         })()}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    );
  };

  const renderViajeRightPanel = () => {
    if (!originCity || !destCity) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-60 bg-slate-100 p-6 text-center lg:rounded-[2.5rem] lg:shadow-xl lg:border-[8px] lg:border-white">
           <Route className="w-16 h-16 mb-4" />
           <p className="text-lg font-bold max-w-xs">Ingresa tu punto de origen y destino para trazar la ruta en el mapa</p>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full h-full flex flex-col relative lg:rounded-[2.5rem] lg:shadow-xl lg:border-[8px] lg:border-white overflow-hidden bg-slate-200 lg:h-[calc(100vh-140px)] lg:sticky lg:top-[100px]">
        
        <div className="lg:hidden absolute top-4 left-4 z-40">
            <button onClick={() => setMobileStep(1)} className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-slate-100 text-slate-800 flex items-center justify-center cursor-pointer">
              <ChevronLeft className="w-6 h-6"/>
            </button>
        </div>

        {isCalculatingRoute ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100 z-10 w-full min-h-0">
            <MapIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-semibold">Trazando ruta...</span>
          </div>
        ) : (
          <>
            {/* MAPA */}
            <div className="flex-1 w-full relative z-0 min-h-0">
               <iframe key={`viaje-map-${mapUrl}-${mobileStep}`} src={mapUrl} title="Mapa de la ruta" className="absolute inset-0 w-full h-full" style={{ border: 0 }} sandbox="allow-scripts allow-same-origin" />
               
               {/* Toggle Ida y Vuelta Flotante sobre el mapa */}
               <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                  <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 border border-slate-100">
                     <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider select-none">Ida y vuelta</span>
                     <button onClick={() => setIsRoundTrip(!isRoundTrip)} className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer shadow-inner border border-slate-200/50 ${isRoundTrip ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${isRoundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                  </div>
               </div>
            </div>
            
            {/* CARD RESUMEN VIAJE (ADAPTABLE) */}
            <div className="w-full bg-white/95 backdrop-blur-xl p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.12)] pb-8 lg:pb-6 border-t border-slate-200 shrink-0 z-30">
               {renderFooterContentViaje()}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderHome = () => (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
       {/* Hero Section */}
       <div className="w-full bg-slate-900 text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/id/1044/2000/1000')] bg-cover bg-center"></div>
          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
             <div className="bg-blue-600/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-500/30">100% Gratis y Actualizado</div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">Encuentra la bencina más barata y planifica tu ruta en Chile</h1>
             <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">Ahorra en cada estanque. Comparamos los precios oficiales de la CNE y calculamos el costo exacto de tus viajes incluyendo peajes.</p>
             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button onClick={() => { setCurrentView('app'); setCalcMode('carga'); setMobileStep(1); window.scrollTo(0,0); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.25rem] font-black text-[15px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20"><Fuel className="w-5 h-5"/> Buscar Combustible</button>
                <button onClick={() => { setCurrentView('app'); setCalcMode('viaje'); setMobileStep(1); window.scrollTo(0,0); }} className="bg-white text-slate-900 hover:bg-slate-50 px-8 py-4 rounded-[1.25rem] font-black text-[15px] transition-all flex items-center justify-center gap-2 shadow-xl"><MapPin className="w-5 h-5 text-blue-600"/> Planificar Viaje</button>
             </div>
          </div>
       </div>

       {/* Features */}
       <div className="w-full max-w-7xl mx-auto py-20 px-4 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><DollarSign className="w-7 h-7"/></div>
             <h3 className="text-xl font-black text-slate-900 mb-3">Precios Oficiales (CNE)</h3>
             <p className="text-slate-500 leading-relaxed text-sm">Consultamos la base de datos oficial del Gobierno de Chile en tiempo real para mostrarte valores exactos de Gasolina, Diésel y Parafina.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
             <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Route className="w-7 h-7"/></div>
             <h3 className="text-xl font-black text-slate-900 mb-3">Cálculo de Peajes</h3>
             <p className="text-slate-500 leading-relaxed text-sm">Nuestra calculadora traza la ruta por GPS y detecta automáticamente los peajes y pórticos TAG para darte un presupuesto real.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
             <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><TrendingUp className="w-7 h-7"/></div>
             <h3 className="text-xl font-black text-slate-900 mb-3">Ahorro Inteligente</h3>
             <p className="text-slate-500 leading-relaxed text-sm">Te mostramos qué estaciones ofrecen descuentos por Autoservicio y ordenamos todo de menor a mayor precio para cuidar tu bolsillo.</p>
          </div>
       </div>

       {/* AdSense Placeholder here */}
       <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 pb-20">
          <AdPlaceholder />
       </div>
    </div>
  );

  const renderPost = () => {
    if (!selectedPost) return null;
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 lg:px-8 animate-in fade-in duration-500">
        <button onClick={() => { setSelectedPost(null); setCurrentView('blog'); window.scrollTo(0,0); }} className="flex items-center gap-2 text-blue-600 font-bold mb-6 hover:underline cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Volver a Noticias
        </button>
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-64 md:h-96 w-full bg-slate-100 relative">
             <img src={selectedPost.image} className="w-full h-full object-cover" alt={selectedPost.title} />
             <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-blue-600 z-10">{selectedPost.category}</div>
          </div>
          <div className="p-8 md:p-12">
             <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-4">
               <Calendar className="w-4 h-4" /> {selectedPost.date}
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{selectedPost.title}</h1>
             <div className="prose prose-slate prose-blue max-w-none text-slate-600 leading-relaxed space-y-4">
               {selectedPost.content.map((paragraph, i) => (
                 <p key={i}>{paragraph}</p>
               ))}
             </div>
          </div>
        </article>
      </div>
    );
  };

  const renderBlog = () => (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 lg:px-8 animate-in fade-in duration-500">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Noticias y Rutas</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base">Descubre los mejores destinos en Chile, consejos para ahorrar combustible y las últimas actualizaciones del mundo automotriz.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.map(post => (
          <div key={post.id} onClick={() => { setSelectedPost(post); setCurrentView('post'); window.scrollTo(0,0); }} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
             <div className="h-48 w-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-600 z-10">{post.category}</div>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
             </div>
             <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-3">
                   <Calendar className="w-3.5 h-3.5" /> {post.date}
                </div>
                <h3 className="font-black text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center text-blue-600 font-bold text-sm group">
                   Leer artículo <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPageContent = () => {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 lg:px-8 animate-in fade-in duration-500">
         <article className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-200 text-slate-600">
            {currentView === 'about' && (
               <>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">La guía definitiva para encontrar la bencina más barata en Chile</h2>
                 <p className="mb-6 text-sm md:text-base leading-relaxed">
                   En <strong>Andes Ruta</strong> sabemos que el costo de la vida y los constantes cambios en el <strong>precio de los combustibles</strong> (93, 95, 97 octanos, diésel y parafina) impactan directamente en tu bolsillo. Por eso, hemos desarrollado esta herramienta inteligente que consulta en tiempo real la base de datos de la Comisión Nacional de Energía (CNE) para mostrarte las gasolineras más económicas cerca de tu ubicación.
                 </p>
                 <div className="grid md:grid-cols-2 gap-8 mt-10">
                   <div>
                     <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-500" /> ¿Cómo ahorrar en cada carga?</h3>
                     <ul className="space-y-3 text-sm md:text-base">
                       <li><strong className="text-slate-800">Prefiere el Autoservicio:</strong> Como puedes ver en nuestro mapa, muchas estaciones ofrecen descuentos directos en el surtidor si decides cargar el combustible tú mismo.</li>
                       <li><strong className="text-slate-800">Aprovecha los descuentos por día:</strong> Revisa siempre las aplicaciones de fidelización. Pagar con ciertas tarjetas bancarias o billeteras digitales en días específicos puede ahorrarte hasta $300 por litro.</li>
                       <li><strong className="text-slate-800">Mantén tus neumáticos inflados:</strong> Una presión baja aumenta la resistencia al rodaje, haciendo que tu vehículo consuma hasta un 3% más de gasolina.</li>
                     </ul>
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><MapIcon className="w-5 h-5 text-blue-500" /> Planifica tus viajes y peajes</h3>
                     <p className="text-sm md:text-base mb-6 leading-relaxed">
                       Nuestra calculadora de rutas no solo mide la distancia exacta entre dos ciudades en Chile usando tecnología de código abierto, sino que también estima el costo en peajes y el gasto de combustible según el rendimiento real de tu vehículo en carretera.
                     </p>
                     <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> ¿Cuándo cambia el precio?</h3>
                     <p className="text-sm md:text-base leading-relaxed">
                       En Chile, gracias al Mecanismo de Estabilización de Precios de los Combustibles (MEPCO), los valores en surtidor se actualizan habitualmente los días <strong>jueves</strong>, y los precios se mantienen estables por ciclos de tres semanas.
                     </p>
                   </div>
                 </div>
               </>
            )}
            {currentView === 'privacy' && (
               <>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-emerald-500"/> Política de Privacidad</h2>
                 <p className="mb-4 text-sm md:text-base"><strong>1. Uso de la Ubicación:</strong> Para proporcionar resultados de "Estaciones cerca de mí", Andes Ruta solicita acceso temporal a la ubicación GPS de su dispositivo. Esta información se procesa exclusivamente en su navegador local y <strong>nunca es guardada, almacenada ni transmitida</strong> a nuestros servidores.</p>
                 <p className="mb-4 text-sm md:text-base"><strong>2. Datos de Almacenamiento:</strong> La aplicación utiliza almacenamiento local (Local Storage) en su navegador para guardar preferencias como el rendimiento de su vehículo y las últimas comunas buscadas, mejorando su experiencia de uso. Estos datos no son rastreables remotamente.</p>
                 <p className="mb-4 text-sm md:text-base"><strong>3. Anuncios:</strong> Utilizamos Google AdSense para mostrar publicidad relevante. Google y sus socios pueden utilizar cookies para mostrar anuncios basados en sus visitas anteriores a este y otros sitios web.</p>
               </>
            )}
            {currentView === 'terms' && (
               <>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-3"><FileText className="w-8 h-8 text-purple-500"/> Términos de Uso</h2>
                 <p className="mb-4 text-sm md:text-base">Al utilizar Andes Ruta, usted acepta los siguientes términos:</p>
                 <p className="mb-4 text-sm md:text-base"><strong>1. Precisión de Precios:</strong> Los precios son suministrados a través de la API de la CNE. Andes Ruta no se hace responsable por diferencias temporales o errores de digitación cometidos por las bencineras al reportar sus tarifas.</p>
                 <p className="mb-4 text-sm md:text-base"><strong>2. Cálculo de Peajes (Fase Beta):</strong> Las estimaciones de peajes y rutas son puramente referenciales. Factores como horarios punta, tarifas de fin de semana, o desvíos en el trayecto pueden alterar el costo final. Andes Ruta se provee "tal cual", sin garantías comerciales.</p>
                 <p className="mb-4 text-sm md:text-base"><strong>3. Promociones:</strong> Los descuentos exhibidos son recopilaciones informativas de carácter público. Las condiciones finales, topes y vigencias dependen exclusivamente de los bancos y entidades emisoras.</p>
               </>
            )}
         </article>
      </div>
    );
  }

  const renderFooter = () => (
    <footer className={`bg-white border-t border-slate-200 py-12 px-8 mt-auto w-full ${(mobileStep === 2 && currentView === 'app') ? 'hidden lg:block' : 'block'}`}>
       <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-2 mb-2 grayscale opacity-50 cursor-pointer" onClick={() => {setCurrentView('home'); window.scrollTo(0,0);}}>
                <Fuel className="w-5 h-5 text-slate-600" />
                <span className="font-black text-lg tracking-tighter text-slate-600">Andes Ruta</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">
                © 2026 Datos públicos de la CNE. Desarrollado en Chile.
             </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
             <button onClick={() => {setCurrentView('about'); window.scrollTo(0,0);}} className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors cursor-pointer">Acerca de</button>
             <button onClick={() => {setCurrentView('privacy'); window.scrollTo(0,0);}} className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors cursor-pointer">Privacidad</button>
             <button onClick={() => {setCurrentView('terms'); window.scrollTo(0,0);}} className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors cursor-pointer">Términos de uso</button>
             <a href="mailto:contacto@andesruta.com" className="text-xs font-black text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors cursor-pointer">Contacto</a>
          </div>
       </div>
    </footer>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Conectando con CNE...</h2>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      
      {/* HEADER WEB */}
      <header className={`h-[70px] shrink-0 bg-white border-b border-slate-200 sticky top-0 z-[100] px-4 lg:px-8 shadow-sm items-center justify-between w-full ${(mobileStep === 2 && currentView === 'app') ? 'hidden lg:flex' : 'flex'}`}>
         <div className="max-w-7xl mx-auto flex items-center justify-between w-full h-full relative">
           
           <div className="flex items-center gap-6 xl:gap-8">
             {/* Logo */}
             <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => { setCurrentView('home'); setMobileStep(1); window.scrollTo(0,0); }}>
                <div className="bg-blue-600 p-2 lg:p-2.5 rounded-xl shadow-md shadow-blue-200"><Fuel className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div>
                <div>
                  <h1 className="text-lg lg:text-xl font-black tracking-tight text-slate-900 leading-none">Andes Ruta</h1>
                  <div className="flex items-center gap-1 mt-1">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precios Oficiales</p>
                  </div>
                </div>
             </div>

             {/* Navegación Desktop Principal */}
             <nav className="hidden xl:flex items-center gap-6 border-l border-slate-200 pl-6 h-8">
                <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className={`text-sm font-bold transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>Inicio</button>
                <button onClick={() => { setCurrentView('app'); setCalcMode('carga'); setMobileStep(1); }} className={`text-sm font-bold transition-colors ${(currentView === 'app' && calcMode === 'carga') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>Buscar Bencina</button>
                <button onClick={() => { setCurrentView('app'); setCalcMode('viaje'); setMobileStep(1); }} className={`text-sm font-bold transition-colors ${(currentView === 'app' && calcMode === 'viaje') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>Planificar Viaje</button>
                <button onClick={() => { setCurrentView('blog'); setSelectedPost(null); }} className={`text-sm font-bold transition-colors ${(currentView === 'blog' || currentView === 'post') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>Noticias & Rutas</button>
             </nav>
           </div>

           <div className="flex items-center gap-2 lg:gap-3">
              {authStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" title="Error en API" />}
              {authStatus === 'demo' && <Info className="w-5 h-5 text-amber-500" title="Modo Demo" />}
              <button onClick={() => setShowSettingsModal(true)} className="p-2 lg:p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"><Settings className="w-5 h-5 lg:w-5 lg:h-5" /></button>
              
              {/* Botón Menú Móvil */}
              <button onClick={() => setIsMenuOpen(true)} className="xl:hidden p-2 lg:p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                 <Menu className="w-5 h-5 lg:w-5 lg:h-5" />
              </button>
           </div>
         </div>
      </header>

      {/* MENÚ MÓVIL OVERLAY */}
      {isMenuOpen && (
         <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="bg-white w-[85%] max-w-sm h-full p-6 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl">
               <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                  <span className="font-black text-xl text-slate-900 flex items-center gap-2"><MapIcon className="w-5 h-5 text-blue-600"/> Menú</span>
                  <button onClick={() => setIsMenuOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></button>
               </div>
               <nav className="flex flex-col gap-2 flex-1">
                  <button onClick={()=>{setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0,0);}} className={`p-4 text-left rounded-2xl font-bold text-[15px] flex items-center justify-between transition-colors ${currentView === 'home' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700'}`}>
                     <span className="flex items-center gap-2"><Home className="w-5 h-5"/> Inicio</span> <ChevronRight className="w-4 h-4 opacity-50"/>
                  </button>
                  <button onClick={()=>{setCurrentView('app'); setCalcMode('carga'); setIsMenuOpen(false); setMobileStep(1);}} className={`p-4 text-left rounded-2xl font-bold text-[15px] flex items-center justify-between transition-colors ${(currentView === 'app' && calcMode === 'carga') ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700'}`}>
                     <span className="flex items-center gap-2"><Fuel className="w-5 h-5"/> Buscar Bencina</span> <ChevronRight className="w-4 h-4 opacity-50"/>
                  </button>
                  <button onClick={()=>{setCurrentView('app'); setCalcMode('viaje'); setIsMenuOpen(false); setMobileStep(1);}} className={`p-4 text-left rounded-2xl font-bold text-[15px] flex items-center justify-between transition-colors ${(currentView === 'app' && calcMode === 'viaje') ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700'}`}>
                     <span className="flex items-center gap-2"><MapPin className="w-5 h-5"/> Planificar Viaje</span> <ChevronRight className="w-4 h-4 opacity-50"/>
                  </button>
                  <button onClick={()=>{setCurrentView('blog'); setSelectedPost(null); setIsMenuOpen(false);}} className={`p-4 text-left rounded-2xl font-bold text-[15px] flex items-center justify-between transition-colors ${(currentView === 'blog' || currentView === 'post') ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700'}`}>
                     <span className="flex items-center gap-2"><FileText className="w-5 h-5"/> Noticias & Rutas</span> <ChevronRight className="w-4 h-4 opacity-50"/>
                  </button>
                  
                  <div className="mt-8 mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Legal</span>
                  </div>
                  <button onClick={()=>{setCurrentView('about'); setLegalView('about'); setIsMenuOpen(false); window.scrollTo(0,0);}} className="px-4 py-3 text-left rounded-xl font-bold text-[14px] flex items-center gap-3 transition-colors text-slate-600 hover:bg-slate-50"><Info className="w-4 h-4 opacity-50"/> Acerca de</button>
                  <button onClick={()=>{setCurrentView('privacy'); setLegalView('privacy'); setIsMenuOpen(false); window.scrollTo(0,0);}} className="px-4 py-3 text-left rounded-xl font-bold text-[14px] flex items-center gap-3 transition-colors text-slate-600 hover:bg-slate-50"><ShieldCheck className="w-4 h-4 opacity-50"/> Privacidad</button>
                  <button onClick={()=>{setCurrentView('terms'); setLegalView('terms'); setIsMenuOpen(false); window.scrollTo(0,0);}} className="px-4 py-3 text-left rounded-xl font-bold text-[14px] flex items-center gap-3 transition-colors text-slate-600 hover:bg-slate-50"><FileText className="w-4 h-4 opacity-50"/> Términos de Uso</button>
               </nav>
               <div className="mt-auto pt-6 border-t border-slate-100">
                  <a href="mailto:contacto@andesruta.com" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-[1.25rem] font-bold text-sm"><Mail className="w-4 h-4"/> Contactar Soporte</a>
               </div>
            </div>
         </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 w-full flex flex-col">
        
        {currentView === 'home' && renderHome()}

        {currentView === 'app' && (
           <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-0 lg:gap-8 lg:p-8 flex-1">
              {/* PANEL IZQUIERDO (SCROLL NATURAL WEB) */}
              <div className={`flex flex-col w-full lg:w-[420px] xl:w-[450px] shrink-0 z-20 relative bg-transparent overflow-visible ${mobileStep === 2 ? 'hidden lg:flex' : 'flex'}`}>
                 {calcMode === 'carga' ? renderCargaLeftPanel() : renderViajeLeftPanel()}
              </div>
                
              {/* PANEL DERECHO (MAPA Y RESULTADOS STICKY) */}
              <div className={`flex-1 w-full ${mobileStep === 1 ? 'hidden lg:block' : 'block'}`}>
                 <div className={`w-full flex flex-col lg:sticky lg:top-[90px] lg:h-[calc(100vh-130px)] ${mobileStep === 2 ? 'fixed inset-0 z-[150] lg:relative lg:inset-auto lg:z-10' : 'relative h-[calc(100vh-70px)] z-10'}`}>
                    {calcMode === 'carga' ? renderCargaRightPanel() : renderViajeRightPanel()}
                 </div>
              </div>
           </div>
        )}

        {currentView === 'blog' && renderBlog()}
        {currentView === 'post' && renderPost()}
        {['about', 'privacy', 'terms'].includes(currentView) && renderPageContent()}

      </main>

      {/* FOOTER WEB */}
      {renderFooter()}

      {/* MODALES DE CONFIGURACIÓN Y PEAJES (Se mantienen intactos) */}
      {showTollsModal && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 flex items-center text-xl"><Ticket className="w-6 h-6 mr-2 text-slate-900"/> Peajes en ruta</h3>
                <button onClick={() => setShowTollsModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-600"/></button>
             </div>
             
             <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4">
               <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs text-amber-800 font-medium leading-relaxed"><strong>Fase Beta:</strong> El cálculo de peajes es una estimación referencial para automóviles. Puede variar por horarios, fines de semana o pórticos no mapeados.</p>
             </div>
             
             <div className="max-h-56 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                {detectedTolls.list.map((t, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{t.nombre}</span>
                      <span className="text-[15px] font-black text-slate-900">{formatCLP(t.precio)}</span>
                   </div>
                ))}
             </div>
             
             <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex justify-between items-end mb-6">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Peajes</span>
                     {isRoundTrip && <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md mt-1.5 w-fit">IDA Y VUELTA</span>}
                   </div>
                   <span className="text-3xl font-black text-slate-900 leading-none">{formatCLP(peajeTotal)}</span>
                </div>
                <button onClick={() => setShowTollsModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-transform shadow-xl shadow-slate-900/20 cursor-pointer">Cerrar</button>
             </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 flex items-center text-xl"><Settings className="w-6 h-6 mr-2 text-slate-900"/> Configuración</h3>
                <button onClick={() => setShowSettingsModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-600"/></button>
             </div>
             
             <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Car className="w-3.5 h-3.5 mr-1.5"/> Mi Vehículo (Predeterminado)</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-700">Rendimiento (Km/L)</span>
                         <input type="number" step="0.1" min="1" className="w-20 p-2 bg-white border border-slate-200 rounded-xl outline-none font-black text-center text-slate-900 shadow-sm" value={tempEff || ""} onChange={(e) => setTempEff(e.target.value)} />
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-700">Combustible</span>
                         <select className="bg-white px-3 py-2 rounded-xl border border-slate-200 font-black text-slate-900 outline-none cursor-pointer shadow-sm" value={tempFuel} onChange={(e) => setTempFuel(e.target.value)}>
                            <option value="93">93 oct</option><option value="95">95 oct</option><option value="97">97 oct</option><option value="diesel">Diesel</option><option value="parafina">Parafina</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Ticket className="w-3.5 h-3.5 mr-1.5"/> Preferencias</h4>
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-slate-700">Incluir Peajes y TAG</span>
                       <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTempTolls(!tempTolls)}>
                         <div className={`w-12 h-7 rounded-full relative flex items-center px-1 transition-colors duration-300 ${tempTolls ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                           <div className={`w-5 h-5 bg-white rounded-full absolute transition-all duration-300 ${tempTolls ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </div>
                       </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0"><Info className="w-4 h-4"/></div>
                      <div>
                         <h4 className="text-xs font-black text-blue-900 mb-1">Andes Ruta v1.1.0</h4>
                         <p className="text-[10px] font-medium text-blue-700 leading-tight">Precios obtenidos en tiempo real desde la CNE. Base de datos de tarifas de peajes actualizada al año 2026.</p>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-all shadow-xl shadow-slate-900/20 cursor-pointer">Guardar Preferencias</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL TEXTOS LEGALES (ADSENSE) */}
      {legalView && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 mb-4 sm:mb-0 max-h-[85vh] flex flex-col">
             <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="font-black text-slate-900 flex items-center text-xl">
                   {legalView === 'about' && <><Info className="w-6 h-6 mr-2 text-blue-600"/> Acerca de Andes Ruta</>}
                   {legalView === 'privacy' && <><ShieldCheck className="w-6 h-6 mr-2 text-emerald-600"/> Política de Privacidad</>}
                   {legalView === 'terms' && <><FileText className="w-6 h-6 mr-2 text-purple-600"/> Términos de Uso</>}
                </h3>
                <button onClick={() => setLegalView(null)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-600"/></button>
             </div>
             
             <div className="overflow-y-auto no-scrollbar pr-2 pb-4 text-sm text-slate-600 space-y-4">
                {legalView === 'about' && (
                  <>
                    <p><b>Andes Ruta</b> es una plataforma independiente y gratuita diseñada para ayudar a los conductores en Chile a tomar decisiones informadas sobre el consumo de combustible.</p>
                    <p>Nuestra tecnología se conecta directamente a los datos públicos proporcionados por la Comisión Nacional de Energía (CNE), garantizando que los precios mostrados son los oficiales reportados por las propias estaciones de servicio.</p>
                    <p>Además, integramos algoritmos de enrutamiento avanzados (OpenStreetMap/OSRM) y una base de datos propia de peajes para ofrecer proyecciones de costos de viaje lo más precisas posibles.</p>
                  </>
                )}
                {legalView === 'privacy' && (
                  <>
                    <p><b>1. Uso de la Ubicación:</b> Para proporcionar resultados de "Estaciones cerca de mí", Andes Ruta solicita acceso temporal a la ubicación GPS de su dispositivo. Esta información se procesa exclusivamente en su navegador local y <b>nunca es guardada, almacenada ni transmitida</b> a nuestros servidores.</p>
                    <p><b>2. Datos de Almacenamiento:</b> La aplicación utiliza almacenamiento local (Local Storage) en su navegador para guardar preferencias como el rendimiento de su vehículo y las últimas comunas buscadas, mejorando su experiencia de uso. Estos datos no son rastreables remotamente.</p>
                    <p><b>3. Anuncios:</b> Utilizamos Google AdSense para mostrar publicidad relevante. Google y sus socios pueden utilizar cookies para mostrar anuncios basados en sus visitas anteriores a este y otros sitios web.</p>
                  </>
                )}
                {legalView === 'terms' && (
                  <>
                    <p>Al utilizar Andes Ruta, usted acepta los siguientes términos:</p>
                    <p><b>1. Precisión de Precios:</b> Los precios son suministrados a través de la API de la CNE. Andes Ruta no se hace responsable por diferencias temporales o errores de digitación cometidos por las bencineras al reportar sus tarifas.</p>
                    <p><b>2. Cálculo de Peajes (Fase Beta):</b> Las estimaciones de peajes y rutas son puramente referenciales. Factores como horarios punta, tarifas de fin de semana, o desvíos en el trayecto pueden alterar el costo final. Andes Ruta se provee "tal cual", sin garantías comerciales.</p>
                    <p><b>3. Promociones:</b> Los descuentos exhibidos son recopilaciones informativas de carácter público. Las condiciones finales, topes y vigencias dependen exclusivamente de los bancos y entidades emisoras.</p>
                  </>
                )}
             </div>

             <div className="mt-4 pt-4 border-t border-slate-100 shrink-0">
                <button onClick={() => setLegalView(null)} className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-[15px] active:scale-95 transition-transform shadow-xl shadow-slate-900/20 cursor-pointer">Entendido</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}