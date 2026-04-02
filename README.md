# ⛽ BencinaApp 🇨🇱

BencinaApp es una aplicación web moderna, rápida y *responsive* diseñada para ayudar a los conductores en Chile a encontrar los combustibles más baratos en su ciudad y calcular con precisión el costo de sus viajes.

## ✨ Características Principales

La aplicación está dividida en dos módulos principales:

### 1. 📍 Precio por Ciudad (Modo Carga)
* **Datos en Tiempo Real:** Se conecta a la API oficial de la Comisión Nacional de Energía (CNE v4) para obtener los precios de todos los combustibles (93, 95, 97, Diesel y Parafina).
* **Ranking de Precios:** Ordena automáticamente las bencineras de la más barata a la más cara, destacando la mejor opción con una insignia verde ("Top 1").
* **Filtro Inteligente de Caducidad:** Detecta si una estación lleva más de 7 días sin actualizar sus precios, marcándola visualmente y enviándola al final de la lista para no alterar el ranking.
* **Deduplicación:** Motor interno que limpia los datos de la CNE, fusionando estaciones repetidas o clonadas.
* **Mapa Interactivo Multiestación:** Muestra un mapa (Leaflet) con todas las estaciones de la comuna seleccionada. Los pines son interactivos y sincronizan la lista paginada al hacerles clic.
* **Paginación:** Sistema de navegación ordenado para comunas con alta densidad de bencineras.

### 2. 🗺️ Calculadora de Viaje (Modo Ruta)
* **Buscador Geográfico Híbrido:** Utiliza la base de datos de comunas de la CNE combinada con la API de Nominatim (OpenStreetMap) para encontrar el centro exacto de cualquier localidad.
* **Trazado de Rutas Reales:** Se conecta a OSRM (Open Source Routing Machine) para calcular la distancia exacta de manejo por carreteras y calles, no solo líneas rectas.
* **Cálculo de Ida y Vuelta:** Opción rápida para duplicar la distancia y el costo proyectado.
* **Fallback Automático:** Si el servidor de rutas externo falla, el sistema aplica automáticamente la Fórmula de Haversine para calcular la distancia en línea recta y no dejar al usuario sin respuesta.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React.js (Vite)
* **Estilos:** Tailwind CSS (Diseño UI moderno tipo "App móvil")
* **Iconografía:** Lucide React
* **Mapas:** Leaflet.js con *tiles* de CartoDB (estilo claro/minimalista)
* **Geocoding & Routing:** Nominatim API & OSRM API
* **Despliegue:** Vercel (con configuración de Proxy local)

## 🚀 Instalación y Desarrollo Local

Sigue estos pasos para correr el proyecto en tu máquina local:

1. **Clona el repositorio o crea un proyecto Vite:**
```bash
npm create vite@latest bencina-app -- --template react
cd bencina-app
```

2. **Instala las dependencias necesarias:**
```bash
npm install
npm install lucide-react
```

3. **Copia el código principal:**
Reemplaza el contenido de `src/App.jsx` con el código proporcionado para BencinaApp.

4. **Configura el Proxy (Muy Importante):**
Para evitar errores de CORS al consultar la API de la CNE en modo desarrollo, abre tu archivo `vite.config.js` y añade el proxy:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-cne': {
        target: '[https://api.bencinaenlinea.cl](https://api.bencinaenlinea.cl)',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cne/, '')
      }
    }
  }
})
```

5. **Inicia el servidor:**
```bash
npm run dev
```

## 🌐 Despliegue a Producción (Vercel)

Si vas a subir este proyecto a Vercel, asegúrate de crear un archivo `vercel.json` en la raíz del proyecto para que las peticiones a la API funcionen correctamente en producción:

```json
{
  "rewrites": [
    {
      "source": "/api-cne/:path*",
      "destination": "[https://api.bencinaenlinea.cl/:path](https://api.bencinaenlinea.cl/:path)*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---
*Desarrollado con ❤️ para ayudar a los conductores a tomar mejores decisiones.*