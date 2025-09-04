# 🧠 Integración Goveling ML API

## 📋 Descripción

Esta integración conecta tu aplicación de Go Travel Connect con la API de Goveling ML para generar itinerarios optimizados usando inteligencia artificial y machine learning.

## 🚀 Características Implementadas

### ✅ Funcionalidades Core
- ✅ **Conexión con API Goveling ML**: Integración completa con la API desplegada en Render
- ✅ **Sistema Híbrido de Optimización**: Detección automática de hoteles vs clustering geográfico  
- ✅ **Recomendaciones de Transporte**: Sugerencias inteligentes de modo de transporte
- ✅ **Integración con Google Maps**: Cálculos de tiempo real de viaje
- ✅ **Analytics ML**: Métricas de eficiencia y optimización

### ✅ Interfaz de Usuario
- ✅ **Modal AI Smart Route**: Interfaz completa para generación de rutas
- ✅ **Estados de Carga**: Feedback visual durante la generación
- ✅ **Manejo de Errores**: Fallback automático cuando la API no está disponible
- ✅ **Panel de Debug**: Herramientas para troubleshooting y configuración
- ✅ **Badges de Estado**: Indicadores visuales del estado de la API

### ✅ Servicios y Hooks
- ✅ **GovelingMLService**: Servicio principal para interactuar con la API
- ✅ **useGovelingML**: Hook personalizado con manejo de estado
- ✅ **Transformación de Datos**: Conversión entre formatos internos y API
- ✅ **Validación de Datos**: Verificación antes del envío

## 🛠️ Configuración

### 1. Variables de Entorno

Crea o actualiza tu archivo `.env` con:

```bash
# Goveling ML API Configuration
VITE_GOVELING_ML_API_URL=https://tu-servicio.onrender.com
```

### 2. Configuración de la API

La configuración se encuentra en `src/config/govelingML.ts`:

```typescript
export const govelingMLConfig = {
  baseUrl: "https://tu-servicio.onrender.com",
  apiVersion: "v2",
  timeout: 30000, // 30 segundos
  defaultPreferences: {
    start_time: "09:00",
    end_time: "18:00",
    max_daily_activities: 6,
    preferred_transport: "walking",
  },
};
```

## 📡 Endpoints Utilizados

### Health Check
- **URL**: `GET /health`
- **Propósito**: Verificar estado de la API
- **Respuesta**: `{ status: string, timestamp: string }`

### Generar Itinerario
- **URL**: `POST /api/v2/itinerary/generate-hybrid`
- **Propósito**: Generar itinerario optimizado con ML
- **Timeout**: 30 segundos
- **Cuerpo**: Ver estructura detallada abajo

## 📝 Estructura de Datos

### Request (Enviado a la API)

```typescript
interface GovelingMLRequest {
  activities: GovelingMLActivity[];
  preferences?: GovelingMLPreferences;
  user_location?: GovelingMLUserLocation;
}

interface GovelingMLActivity {
  name: string;
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
  priority: number; // 1-10
  estimated_duration?: number; // horas
  opening_hours?: string;
  is_hotel?: boolean;
  check_in?: string; // YYYY-MM-DD
  check_out?: string; // YYYY-MM-DD
}
```

### Response (Recibido de la API)

```typescript
interface GovelingMLResponse {
  itinerary: GovelingMLDayItinerary[];
  analytics: GovelingMLAnalytics;
  metadata: GovelingMLMetadata;
}

interface GovelingMLAnalytics {
  total_activities: number;
  total_days: number;
  optimization_efficiency: number;
  optimization_mode: string;
  transport_recommendations: {
    walking: number;
    driving: number;
    transit: number;
  };
}
```

## 🎯 Uso

### 1. En el Componente Modal

```typescript
import { useGovelingML } from "@/hooks/useGovelingML";

const {
  isLoading,
  generateItinerary,
  checkApiHealth,
  lastResponse,
  lastError
} = useGovelingML({
  onSuccess: (response) => {
    console.log("¡Itinerario generado!", response);
  },
  onError: (error) => {
    console.error("Error:", error);
  }
});

// Generar itinerario
await generateItinerary(trip, preferences, userLocation);

// Verificar salud de la API
await checkApiHealth();
```

### 2. Transformación de Datos

```typescript
import { GovelingMLService } from "@/services/govelingML";

// Convertir Trip a formato API
const request = GovelingMLService.transformTripToGovelingML(
  trip,
  preferences,
  userLocation
);

// Convertir respuesta API a formato interno
const transformed = GovelingMLService.transformGovelingMLResponse(
  response,
  trip
);
```

## 🔧 Componentes Principales

### 1. AISmartRouteModal
- **Ubicación**: `src/components/modals/AISmartRouteModal.tsx`
- **Propósito**: Modal principal para generación de rutas
- **Características**: Estados de carga, manejo de errores, fallback automático

### 2. GovelingMLDebugPanel  
- **Ubicación**: `src/components/debug/GovelingMLDebugPanel.tsx`
- **Propósito**: Panel de debug y configuración
- **Características**: Test de conexión, información de configuración, errores

### 3. useGovelingML Hook
- **Ubicación**: `src/hooks/useGovelingML.ts`
- **Propósito**: Hook personalizado para integración ML
- **Características**: Estado, acciones, utilidades

### 4. GovelingMLService
- **Ubicación**: `src/services/govelingML.ts`
- **Propósito**: Servicio principal de la API
- **Características**: Llamadas HTTP, transformación de datos, manejo de errores

## 🚨 Manejo de Errores

### Sistema de Fallback
1. **Primero**: Intenta usar la API de Goveling ML
2. **Segundo**: Si falla, usa función Supabase existente  
3. **Tercero**: Si todo falla, usa generación estática

### Tipos de Errores
- **400**: Datos de request inválidos
- **500+**: Errores de servidor
- **Timeout**: API tarda más de 30 segundos
- **Network**: Problemas de conectividad

## 🧪 Testing y Debug

### Panel de Debug
- Disponible en modo desarrollo o cuando hay errores
- Incluye test de conexión, configuración, y información de respuestas
- Accesible desde el modal principal

### Logs de Consola
```javascript
// Habilitar logs detallados
console.log("Goveling ML Request:", request);
console.log("Goveling ML Response:", response);
```

## 📊 Métricas y Analytics

La API retorna métricas detalladas:
- **Eficiencia de optimización**: Porcentaje de mejora
- **Modo de optimización**: hotel_based o geographic_clustering  
- **Recomendaciones de transporte**: Distribución por tipo
- **Tiempo de generación**: Duración del procesamiento ML

## 🔄 Estados de la UI

### Estados Principales
- **Inicial**: Mostrar opciones de generación
- **Cargando**: Feedback visual durante generación
- **Éxito**: Mostrar itinerario optimizado
- **Error**: Mostrar error y opciones de retry

### Badges de Estado
- 🟢 **ML Optimized**: API funcionó correctamente
- 🟡 **Ready for ML**: API configurada, lista para usar
- 🔴 **API Unavailable**: API no responde
- ⚪ **Fallback Mode**: Usando método alternativo

## 🌟 Funcionalidades Avanzadas

### 1. Detección Automática de Hoteles
La API detecta automáticamente lugares de alojamiento y optimiza rutas usando hoteles como centroides.

### 2. Recomendaciones de Transporte
Incluye sugerencias inteligentes de modo de transporte por segmento de viaje.

### 3. Integración con Google Maps
Calcula tiempos reales de viaje usando la API de Google Maps.

### 4. Machine Learning
Utiliza modelos ML para estimar duraciones de actividades con precisión.

## 🚀 Próximas Mejoras

- [ ] **Cache de Respuestas**: Guardar itinerarios generados
- [ ] **Preferencias Personalizadas**: Más opciones de configuración
- [ ] **Optimización por Día**: Control granular por día
- [ ] **Integración con Mapas**: Visualización de rutas optimizadas
- [ ] **Métricas de Usuario**: Analytics de uso de la feature

## 📞 Soporte

Si encuentras problemas:

1. **Verifica la configuración** usando el Panel de Debug
2. **Revisa los logs** en la consola del navegador  
3. **Prueba la conexión** con el botón "Test API"
4. **Consulta la documentación** de la API en `/docs`

---

¡La integración está lista para usar! 🎉
