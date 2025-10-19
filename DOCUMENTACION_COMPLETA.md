# 📱 Goveling - Documentación Completa de la Aplicación

## 📋 Tabla de Contenidos

### Introducción
1. [Descripción General](#descripción-general)
2. [Resumen Ejecutivo](#resumen-ejecutivo)
3. [Métricas del Proyecto](#métricas-del-proyecto)

### Tecnología y Arquitectura
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
   - Frontend (React, TypeScript, Redux)
   - Backend (Supabase, Edge Functions)
   - Mobile (Capacitor)
   - APIs Externas
   - UI/UX y Animaciones
5. [Arquitectura del Proyecto](#arquitectura-del-proyecto)

### Funcionalidades
6. [Funcionalidades Principales](#funcionalidades-principales)
   - 26 categorías de funcionalidades detalladas
   - Autenticación y Perfiles
   - Gestión de Viajes
   - Mapas Interactivos
   - Colaboración en Grupo
   - Exploración y Recomendaciones con IA
   - Itinerarios Inteligentes
   - Reservas Integradas
   - Gamificación
   - InstaTrip
   - Y mucho más...

### Estructura y Código
7. [Estructura de Carpetas](#estructura-de-carpetas)
8. [Backend y Base de Datos](#backend-y-base-de-datos)
   - Esquema de base de datos
   - Edge Functions
   - Row Level Security

### Configuración y Deployment
9. [Configuración de Capacitor](#configuración-de-capacitor)
10. [Seguridad](#seguridad)
11. [Internacionalización](#internacionalización)
12. [Instalación y Configuración](#instalación-y-configuración)
13. [Despliegue](#despliegue)

### Desarrollo
14. [Desarrollo](#desarrollo)
   - Convenciones de código
   - Git workflow
   - Scripts disponibles
15. [Estado del Proyecto](#estado-del-proyecto)
16. [Contribución](#contribución)
17. [Contacto y Soporte](#contacto-y-soporte)

---

## 📖 Descripción General

**Goveling** (anteriormente Go Travel Connect) es una aplicación móvil y web progresiva (PWA) diseñada para facilitar la planificación, organización y gestión de viajes de manera colaborativa. La aplicación permite a los usuarios crear viajes, invitar amigos, gestionar itinerarios, explorar destinos, y compartir experiencias de viaje.

### 🎯 Objetivo Principal
Ofrecer una plataforma integral que centralice todas las necesidades de un viajero, desde la planificación inicial hasta el registro de memorias, con funcionalidades de gamificación y colaboración en grupo.

### 👥 Público Objetivo
- Viajeros individuales que buscan organizar sus aventuras
- Grupos de amigos o familias planificando viajes conjuntos
- Viajeros frecuentes que quieren trackear sus experiencias
- Personas interesadas en explorar nuevos destinos

---

## 🎯 Resumen Ejecutivo

**Goveling** es una **plataforma completa de gestión de viajes** que combina:

✨ **Planificación Inteligente**: Itinerarios generados con IA, mapas interactivos, y recomendaciones personalizadas con Google Gemini.

👥 **Colaboración en Grupo**: Sistema completo de invitaciones, gastos compartidos, votaciones democráticas y gestión de equipos.

🎮 **Gamificación Avanzada**: 20 niveles progresivos, 30+ insignias desbloqueables, y sistema de experiencia que motiva a los usuarios.

🔒 **Seguridad de Nivel Enterprise**: Encriptación AES-256, Row Level Security, Edge Functions seguras, y monitoreo de privacidad.

📱 **Experiencia Multi-Plataforma**: PWA moderna, aplicaciones nativas para Android e iOS con Capacitor 7.

🤖 **Inteligencia Artificial**: Recomendaciones de lugares, optimización de rutas, sugerencias de fechas, y análisis contextual.

🌍 **Alcance Global**: 6 idiomas, mapas mundiales, datos de millones de lugares, y comunidad internacional de viajeros.

---

## 📈 Métricas del Proyecto

### Código Base
- **Líneas de Código**: ~50,000+ líneas
- **Componentes React**: 240+ componentes
- **Custom Hooks**: 67+ hooks especializados
- **Modales**: 158+ modales
- **Páginas**: 5 páginas principales
- **Secciones**: 6 secciones navegables
- **Contextos**: 2 contextos globales (Language, TravelMode)
- **Redux Slices**: 4 slices (auth, user, weather, api)

### Base de Datos
- **Tablas**: 15+ tablas principales
- **Edge Functions**: 17 funciones serverless
- **Storage Buckets**: 4 buckets
- **Políticas RLS**: Implementadas en todas las tablas
- **Migraciones**: 122+ archivos de migración

### Internacionalización
- **Idiomas**: 6 idiomas soportados
- **Archivos de traducción**: 78+ archivos JSON
- **Keys de traducción**: 500+ keys

### Funcionalidades
- **Funcionalidades principales**: 26 categorías
- **Gamificación**: 20 niveles + 30 insignias
- **Tipos de reserva**: 6 tipos (vuelos, hoteles, tours, transporte, restaurantes, eSIM)
- **Plantillas de viaje**: 4 tipos especializados
- **Modales de viaje**: 10+ modales especializados

### Tecnologías
- **Dependencias npm**: 90+ librerías
- **APIs externas**: 5+ APIs integradas
- **Frameworks**: React, Capacitor, Supabase
- **Plataformas**: Web, Android, iOS

---

## 🌟 Características Más Distintivas de Goveling

### ¿Qué Hace Única a Esta Aplicación?

Goveling no es simplemente otra app de viajes. Es una plataforma que combina múltiples conceptos innovadores en una experiencia cohesiva y gamificada. Aquí están sus características más distintivas:

---

### 1. 🎮 **Gamificación Profunda y Significativa**

**La Diferencia**: No es un sistema de puntos superficial. Es un RPG completo de la vida real.

#### Sistema de Niveles Progresivo
- **20 niveles** desde "Backpack Explorer" (0 XP) hasta "Legendary Traveler" (202,000 XP)
- Cada nivel desbloquea **características reales** y beneficios tangibles
- Progresión exponencial que mantiene el desafío interesante
- Iconos emoji únicos y gradientes de color personalizados por nivel

#### 30+ Insignias en 5 Categorías
1. **Exploración Global**: First Country, Country Collector, World Citizen, Travel Marathon, Continent Explorer
2. **Descubrimientos Locales & Cultura**: City Explorer, Museum Enthusiast, Photo Journalist, Historic Hunter, Architecture Admirer
3. **Comida & Gastronomía**: Foodie, Cuisine Master, Street Food Explorer, Local Market Visitor, Coffee Connoisseur
4. **Familia & Experiencias**: Family Traveler, Beach Lover, Route Master, Nature Enthusiast, Mountain Climber
5. **Contribuciones**: Reviewer, Itinerary Creator, Map Pioneer, Travel Photographer
6. **Especiales**: Explorer of the Day, Weekend Warrior, Early Bird, Night Explorer, Seasonal Traveler, Explorer 100%, Legendary Medal

#### Sistema de Rareza
- 🟢 **Common**: Logros accesibles que motivan a empezar (100-1,500 XP)
- 🔵 **Rare**: Requieren dedicación y exploración (1,500-3,000 XP)
- 🟣 **Epic**: Para viajeros comprometidos (3,000-5,000 XP)
- 🟠 **Legendary**: Solo para los más dedicados (10,000 XP)

#### XP por Acciones Reales
- ✅ Completar viajes
- 📍 Visitar lugares y hacer check-in
- 📸 Subir fotos geolocalizadas
- ⭐ Escribir reviews detalladas
- 🗺️ Crear itinerarios con IA
- 🎯 Alcanzar hitos de viaje
- 👥 Invitar amigos y colaborar

**Por qué es único**: Cada acción en la app tiene consecuencias en tu progreso. No es un sistema paralelo - está **integrado en todo**.

---

### 2. 🤖 **Inteligencia Artificial Verdaderamente Integrada**

**La Diferencia**: La IA no es un chatbot añadido - está tejida en el núcleo de la experiencia.

#### Google Gemini AI para Recomendaciones Contextuales
- No solo busca lugares - **entiende tu contexto**
- Analiza tu historial de viajes, preferencias y estilo
- Recomendaciones basadas en temporada, clima y eventos locales
- Información cultural y tips que un local compartiría

#### Itinerarios Inteligentes Auto-Optimizados
```
Entrada: Destinos + Fechas + Preferencias
    ↓
IA Analiza: Distancias, horarios, tiempos de traslado, aperturas
    ↓
Output: Itinerario optimizado por día con tiempo libre calculado
```
- Minimiza tiempo de traslado entre puntos
- Agrupa lugares por proximidad geográfica
- Considera horarios de apertura reales
- Calcula tiempo libre automáticamente
- Sugiere mejores momentos para cada actividad

#### Recomendaciones de Fechas Inteligentes
**Para Vuelos**:
- Analiza las fechas de tu viaje
- Identifica el timing óptimo para reservar
- Alertas si las fechas tienen problemas de conexión
- Sugerencias de vuelos multi-ciudad optimizados

**Para Hoteles**:
- Analiza tu itinerario completo
- Sugiere ubicaciones estratégicas por noche
- Recomienda cambiar de hotel si optimiza desplazamientos
- Detecta cuando quedarte en el mismo lugar es mejor

#### IA en Análisis de Viaje
- Detecta patrones en tus viajes anteriores
- Predice qué lugares te gustarán más
- Sugiere destinos basados en tus preferencias reveladas
- Aprende de tus ratings y reviews

**Por qué es único**: La IA no es opcional - **mejora activamente tu experiencia** sin que lo notes.

---

### 3. 📍 **Travel Mode con Sistema de Alertas Progresivas Únicas**

**La Diferencia**: No es solo tracking GPS - es un sistema de conciencia espacial inteligente.

#### 7 Niveles de Proximidad Progresiva
```
5 km  →  Primera alerta: "Lugar guardado cerca"
2 km  →  Recordatorio: "Acercándose"
1 km  →  Preparación: "A 1km de distancia"
500m  →  Inmediato: "Muy cerca, 5 min caminando"
100m  →  Urgente: "¡A la vuelta de la esquina!"
50m   →  Crítico: "¡Llegando en segundos!"
10m   →  Llegada: "¡Has llegado! 🎉"
```

#### Sistema Inteligente de Notificaciones
- **Cooldown de 5 minutos**: No spam de notificaciones
- **Priorización automática**: Lugares más relevantes primero
- **Contexto temporal**: Solo notifica en horarios apropiados
- **Velocidad adaptativa**: Detecta si vas en auto, caminando o parado

#### Tracking GPS Continuo Optimizado
- **Actualización dinámica**: Frecuencia basada en velocidad
- **Optimización de batería**: Reduce checks cuando estás quieto
- **Indicador visual pulsante**: Siempre sabes que está activo
- **Última actualización visible**: Timestamp en tiempo real
- **Manejo de errores**: Alertas claras si GPS falla

#### Detección de Velocidad
```
0 m/s    → Check cada 60 segundos (parado)
0-2 m/s  → Check cada 30 segundos (caminando)
2-5 m/s  → Check cada 15 segundos (corriendo/bici)
5+ m/s   → Check cada 10 segundos (vehículo)
```

#### Compartir Ubicación con Privacidad
- Control granular: decide con quién y cuándo
- Solo con miembros de tu viaje actual
- Desactivación con un tap
- Sin tracking cuando Travel Mode está off

**Por qué es único**: Es como tener un **guía local en tu bolsillo** que sabe exactamente dónde estás y qué hay cerca que te interesa.

---

### 4. 📸 **InstaTrip - Historias Temporales de Viaje**

**La Diferencia**: Combina la efímera de Instagram Stories con el propósito de los viajes.

#### Concepto Único
- Fotos que **expiran en 12 horas**
- Rotación automática cada **15 segundos**
- Similar a Instagram Stories pero **exclusivo para viajes**
- Crea urgencia y autenticidad en el momento

#### Flujo de Experiencia
```
Viajas → Captura momento → Sube a InstaTrip
    ↓
Amigos/Equipo ven en tiempo real
    ↓
¿Te gusta? → Agregar a viaje permanente
    ↓
Se convierte en memoria del fotobook
```

#### Características Técnicas
- **Auto-limpieza**: Archivos se eliminan después de 12 horas
- **Navegación fluida**: Swipe entre historias
- **Contador de tiempo**: Ves cuánto queda antes de expirar
- **Metadata rica**: Ubicación, hora, viaje asociado
- **Sin edición**: Fomenta autenticidad

#### Casos de Uso
1. **Durante el viaje**: Compartir momentos sin pensar
2. **Para el equipo**: Ver qué están haciendo otros en tiempo real
3. **FOMO positivo**: Motiva a tus amigos a viajar
4. **Filtro natural**: Solo lo mejor se vuelve permanente

**Por qué es único**: Es el **Snapchat de los viajes** - efímero pero puede convertirse en eterno. Reduce la presión de "documentar todo" mientras mantiene la opción de guardar lo especial.

---

### 5. 👥 **Colaboración Grupal Verdaderamente Completa**

**La Diferencia**: No es solo "compartir un viaje" - es colaboración real con herramientas de gestión de grupo.

#### Sistema de Gastos Compartidos Avanzado
```
Alguien paga → Registra gasto → Selecciona quién divide
    ↓
Sistema calcula automáticamente
    ↓
Balance por persona en tiempo real
    ↓
"Juan debe $50 a María, $30 a Pedro"
```

**Características**:
- División personalizada (no siempre equitativa)
- Múltiples divisas con conversión
- Historial completo de transacciones
- Resumen visual de quién debe a quién
- Exportación de balances
- Categorización de gastos (comida, transporte, alojamiento)

#### Sistema de Votaciones Democráticas
**Casos de uso**:
- "¿Qué restaurante elegimos?"
- "¿Visitamos el museo o la playa?"
- "¿Salimos temprano o dormimos?"

**Características**:
- Crear votación con múltiples opciones
- Votos anónimos o públicos
- Cierre automático o manual
- Resultados en tiempo real
- Historial de decisiones
- Integración con itinerario (decision → evento)

#### Roles y Permisos Diferenciados
**Organizador** (Creador del viaje):
- ✅ Editar detalles del viaje
- ✅ Invitar/remover miembros
- ✅ Gestionar permisos
- ✅ Eliminar viaje
- ✅ Ver todos los gastos
- ✅ Cerrar votaciones

**Viajero** (Invitado):
- ✅ Ver detalles del viaje
- ✅ Agregar lugares
- ✅ Subir fotos
- ✅ Registrar gastos personales
- ✅ Votar en decisiones
- ❌ No puede eliminar el viaje

#### Sistema de Invitaciones Seguro
- Invitación por **email con token único**
- Expira después de tiempo configurado
- Link compartible: `goveling.com/join/ABC123XYZ`
- Acepta/Rechaza con confirmación
- Notificaciones a organizador
- RLS previene harvesting de emails

#### Sincronización en Tiempo Real
- **Supabase Realtime**: Cambios se propagan instantáneamente
- Editas itinerario → Todos lo ven al instante
- Alguien agrega gasto → Balance se actualiza en vivo
- Nueva votación → Notificación push a todos

**Por qué es único**: La mayoría de apps dejan la colaboración como "afterthought". Goveling fue **diseñada desde cero para grupos**, con herramientas que realmente necesitan.

---

### 6. 🔐 **Seguridad de Nivel Enterprise**

**La Diferencia**: Nivel de seguridad inusual para una app de viajes consumer.

#### Encriptación AES-256 para Documentos
```
Cliente: Documento → Encripta (AES-256) → Sube encriptado
    ↓
Supabase Storage: Almacena blob encriptado
    ↓
Recuperar: Edge Function autentica → Desencripta → Envía
```

**Documentos protegidos**:
- 🛂 Pasaportes
- 📄 Visas
- 🏥 Seguro de viaje
- ✈️ Boletos
- 🏨 Confirmaciones de hotel
- 💳 Información sensible

#### Edge Functions Seguras
**Arquitectura de seguridad**:
```typescript
// Edge Function con security definer
encrypt-document: Cliente → Edge (valida auth) → Encripta → Storage
decrypt-document: Cliente → Edge (valida permisos) → Desencripta → Envía
list-documents: Solo lista documentos del usuario autenticado
delete-document: Verifica ownership antes de eliminar
```

#### Row Level Security (RLS) Completo
**Políticas implementadas en TODAS las tablas**:
- `profiles`: Solo ves tu propio perfil (o públicos)
- `trips`: Solo tus viajes o viajes donde eres miembro
- `trip_invitations`: Prevención de email harvesting
- `trip_expenses`: Solo gastos de tus viajes
- `saved_places`: Solo tus lugares guardados
- `notifications`: Solo tus notificaciones

**Ejemplo de política**:
```sql
CREATE POLICY "Users can only see their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Trip members can see trip details"
ON trips FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM trip_members 
    WHERE trip_id = trips.id 
    AND user_id = auth.uid()
  )
);
```

#### Monitoreo de Privacidad de Ubicación
**Edge Function**: `location-privacy-monitor`
- Registra accesos a datos de ubicación
- Detecta patrones sospechosos
- Alertas si hay accesos inusuales
- Logs auditables

#### Autenticación Robusta
- **JWT Tokens** con expiración
- **Refresh tokens** seguros
- **OAuth 2.0** con Google (nativo en móvil)
- **Email verification** obligatoria
- **Password reset** con tokens de un solo uso
- **Rate limiting** en login attempts

#### Prevención de Vulnerabilidades
✅ **SQL Injection**: Prepared statements en todas las queries
✅ **XSS**: Sanitización de inputs
✅ **CSRF**: Tokens en forms
✅ **Email Harvesting**: RLS en invitations
✅ **Data Exposure**: Policies estrictas
✅ **Man-in-the-Middle**: HTTPS everywhere + SSL pinning (móvil)

**Por qué es único**: La mayoría de apps de viajes consumer tienen seguridad básica. Goveling trata la **privacidad del viajero como prioridad**, especialmente datos sensibles como pasaportes y ubicación en tiempo real.

---

### 7. 🗺️ **Mapa Mundial Interactivo - Tu Mapa Personal de Conquistas**

**La Diferencia**: No es solo visualización - es una representación visual de tu vida de viajero.

#### Concepto del "Mapa de Vida"
- **Todos tus viajes** en un solo mapa mundial
- **Memoria visual**: Ver instantáneamente dónde has estado
- **Motivación tangible**: Espacios en blanco motivan a llenar
- **Historia personal**: Tu mapa es único e irrepetible

#### Características Técnicas Avanzadas
**Tecnología**:
- Leaflet + React Leaflet
- Tiles de múltiples proveedores
- Rendering optimizado para 100+ markers
- SSR-safe para Vercel

**Estilos de Mapa**:
- 🗺️ **Street**: Vista tradicional de calles
- 🛰️ **Satellite**: Imágenes satelitales reales
- ⛰️ **Terrain**: Topografía y elevación
- Cambio en tiempo real sin recargar

#### Marcadores Inteligentes
```javascript
Cada marcador incluye:
- Emoji personalizado del viaje
- Color según estado (verde=próximo, púrpura=planning, gris=completado)
- Popup con información completa
- Click → Más detalles del viaje
```

#### Rutas Conectadas
- **Líneas visuales** conectando destinos del mismo viaje
- **Color matching** con el estado del viaje
- **Puntas de flecha** mostrando dirección
- Ver tu ruta real de viaje

#### Sistema de Filtros Avanzado
**Por Estado**:
- ✅ Próximos (confirmados)
- 📝 Planificando (en proceso)
- ✔️ Completados (terminados)

**Por Tipo**:
- 🚶 Solo (viajes individuales)
- 👥 Grupal (viajes con amigos/familia)

**Por Fechas**:
- Selector de rango
- Ver solo viajes en período específico
- Útil para ver "Mis viajes 2024"

**Por Elementos**:
- 🛣️ Mostrar/ocultar rutas
- 📍 Mostrar/ocultar lugares guardados
- 🎯 Mostrar/ocultar destinos

#### Estadísticas en Tiempo Real
```
Panel lateral muestra:
- Total de viajes visibles
- Países únicos
- Ciudades únicas
- Distancia total aproximada
```

#### Interacciones
- **Click en marcador**: Ver popup con info
- **Zoom automático**: A los marcadores visibles
- **Selector de viaje**: Dropdown para focus en uno
- **Pan y zoom**: Exploración libre
- **Mobile-optimized**: Touch gestures

#### Fallback Elegante
Si el mapa no carga:
- Vista de lista con todos los destinos
- Estadísticas igual visibles
- Links a cada viaje
- Experiencia degradada pero funcional

**Por qué es único**: Transforma datos de viajes en una **narrativa visual**. No solo ves dónde has estado - ves tu **evolución como viajero**. Es motivacional, nostálgico y práctico al mismo tiempo.

---

### 8. 🔄 **Integración Vertical Completa - El Ecosistema Cerrado**

**La Diferencia**: La mayoría de apps hace una cosa bien. Goveling hace TODO y todo está conectado.

#### El Flujo Completo del Viajero
```
FASE 1: DESCUBRIR
Google Gemini AI → Recomendaciones personalizadas
    ↓
Explorar lugares → Guardar favoritos
    ↓
        
FASE 2: PLANIFICAR
Crear viaje → Elegir plantilla (Beach/Backpacking/City/Mountain)
    ↓
Agregar lugares guardados → IA genera itinerario optimizado
    ↓
Invitar amigos → Sistema de equipo activo
    ↓
        
FASE 3: RESERVAR (Todo en la app)
Vuelos → Widget Trip.com + Registro manual + IA sugiere fechas
Hoteles → Widget Booking.com + IA optimiza ubicaciones
Tours → Catálogo integrado
Transporte → Opciones locales
Restaurantes → Búsqueda y reserva
eSIM → Comparador de planes
    ↓
        
FASE 4: VIAJAR
Activar Travel Mode → GPS continuo
    ↓
Sistema de alertas → 7 niveles de proximidad
    ↓
Llegas a lugar → Check-in automático → +XP
    ↓
Capturar momento → InstaTrip (12h) o Foto permanente
    ↓
Registrar gastos → División automática con equipo
    ↓
Decisiones → Votaciones en grupo
    ↓
        
FASE 5: RECORDAR
Fotos automáticas en fotobook
    ↓
InstaTrips importantes → Agregar a viaje permanente
    ↓
Escribir reviews → Ayudar comunidad → +XP
    ↓
Ver estadísticas → Países visitados, nivel alcanzado
    ↓
Mapa mundial → Ver tu conquista visual
    ↓
        
FASE 6: COMPARTIR Y GAMIFICAR
Subir a feed social → Comunidad de travelers
    ↓
Desbloquear insignias → "Beach Lover", "Foodie", etc.
    ↓
Subir de nivel → "City Wanderer" → "Globe Trotter"
    ↓
Inspirar a otros → Ciclo se repite
```

#### Interconexiones Inteligentes

**Todo se conecta con todo**:

1. **Lugar guardado** → Aparece en alertas (Travel Mode) → Se suma a estadísticas
2. **Foto subida** → +XP → Progreso a nivel → Desbloquea insignia
3. **Review escrita** → +XP → Ayuda a comunidad → Insignia "Reviewer"
4. **Viaje completado** → +XP masivo → Estadísticas actualizadas → Mapa actualizado
5. **Gasto registrado** → Balance de equipo → Historial → Stats de presupuesto
6. **InstaTrip** → Puede volverse foto permanente → Fotobook → Memoria
7. **IA recomienda lugar** → Lo agregas → Visitas → IA aprende → Mejores recomendaciones
8. **Invitación aceptada** → Miembro se une → Acceso a documentos → Participa en gastos → Vota en decisiones

#### Datos que Fluyen

**El sistema aprende continuamente**:
```
Tus acciones → Datos → IA analiza → Mejores sugerencias
    ↓
Más viajes → Más datos → Mejor perfil → Recomendaciones precisas
    ↓
Comunidad aporta → Data colectiva → Lugares "trending"
```

#### Sin Salir de la App

**Todo lo que necesitas está incluido**:
- ✅ No necesitas Google Maps por separado (mapa integrado)
- ✅ No necesitas app de gastos (sistema incluido)
- ✅ No necesitas bloc de notas (itinerario incluido)
- ✅ No necesitas chat grupal separado (decisiones incluidas)
- ✅ No necesitas app de fotos (fotobook incluido)
- ✅ No necesitas tracker de viajes (estadísticas incluidas)
- ✅ No necesitas múltiples sitios de reservas (todo integrado)

**Por qué es único**: Es un **ecosistema cerrado** donde cada componente fortalece a los demás. No es una colección de features - es un **sistema viviente** donde todo tiene propósito y contexto.

---

## 💎 El "Secret Sauce" - Lo Que Realmente Distingue a Goveling

### Concepto Central: **"RPG de la Vida Real para Viajeros"**

Goveling trata los viajes como un **juego de rol de mundo abierto**:

```
Tu Perfil = Tu Personaje
Nivel de Viajero = Tu Progreso (Level 1-20)
Insignias = Achievements Desbloqueables
Viajes = Quests/Misiones
Lugares = Checkpoints/Landmarks
Equipo = Tu Party/Guild
IA = NPC Guide
Mapa Mundial = World Map (con fog of war)
XP = Moneda de progreso
```

### La Filosofía de Diseño

#### 1. **"Cada Acción Importa"**
No hay acciones huecas. Todo lo que haces:
- ✅ Suma a tu progreso (XP)
- ✅ Mejora las recomendaciones (IA aprende)
- ✅ Contribuye a la comunidad
- ✅ Se refleja en tu perfil/mapa

#### 2. **"Colaboración Real, No Cosmética"**
Las features de grupo no son decorativas:
- Gastos compartidos → Problema real resuelto
- Votaciones → Decisiones reales tomadas
- Roles → Permisos reales diferenciados
- Sync en tiempo real → Colaboración real

#### 3. **"IA Como Copiloto, No Como Chatbot"**
La IA no es conversacional - es **ejecutiva**:
- No preguntas "¿qué ver?" → IA ya te lo sugirió
- No preguntas "¿cuándo reservar?" → IA ya calculó fechas óptimas
- No preguntas "¿cómo organizar?" → IA ya optimizó el itinerario
- Actúa silenciosamente en segundo plano mejorando tu experiencia

#### 4. **"Seguridad Sin Fricción"**
Máxima seguridad con mínima molestia:
- Encriptación transparente (no notas que está ahí)
- RLS invisible pero absoluto
- Privacidad por defecto, compartir por elección
- No sacrificas UX por seguridad

#### 5. **"El Viaje No Termina"**
Ciclo continuo:
```
Planificar → Viajar → Recordar → Compartir → Inspirar → Planificar
```
No es lineal - cada viaje alimenta el siguiente.

---

## 🎯 ¿Cómo Lo Describirías en Una Frase?

> **"Goveling es el Pokémon GO de los viajes - gamificación real combinada con herramientas prácticas completas, donde cada lugar es un Pokémon que capturar, cada viaje es una aventura que completar, y tu mapa personal es tu Pokédex de conquistas mundiales."**

---

## 📊 Comparación con Competencia

| Característica | TripIt | Google Trips | TravelMapper | Wanderlog | **Goveling** |
|---------------|--------|--------------|--------------|-----------|------------|
| Itinerarios con IA | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gamificación completa | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gastos compartidos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Travel Mode con alertas | ❌ | ❌ | ❌ | ❌ | ✅ |
| InstaTrip (historias) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Mapa mundial interactivo | ❌ | ❌ | ✅ | ❌ | ✅ |
| Reservas integradas | ✅ | ❌ | ❌ | ❌ | ✅ |
| Votaciones en grupo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Documentos encriptados | ❌ | ❌ | ❌ | ❌ | ✅ |
| IA contextual (Gemini) | ❌ | ✅ | ❌ | ❌ | ✅ |
| 6 idiomas | ❌ | ✅ | ❌ | ❌ | ✅ |
| App nativa móvil | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Total** | 2/12 | 3/12 | 1/12 | 2/12 | **12/12** |

---

## 🏆 El Valor Único

### Para el Usuario Individual:
- **Un juego que juega mientras viajas** - Motivación constante
- **Asistente IA que trabaja por ti** - Menos planificación manual
- **Memoria visual de tu vida** - Mapa mundial personalizado
- **Reconocimiento de progreso** - Niveles e insignias tangibles

### Para Grupos:
- **Herramientas reales de colaboración** - No solo "compartir"
- **Gestión financiera integrada** - Problema real resuelto
- **Toma de decisiones democrática** - Sin conflictos
- **Sincronización perfecta** - Todos ven lo mismo

### Para la Comunidad:
- **Red social de viajeros** - No influencers, viajeros reales
- **Contribuciones recompensadas** - Reviews y fotos suman XP
- **Inspiración continua** - Ver lo que otros exploran
- **Datos colectivos mejoran IA** - Cada usuario mejora la experiencia de todos

---

## 🌟 Conclusión: ¿Por Qué Importa?

**Goveling no es una app de viajes más. Es una nueva forma de pensar sobre viajar.**

Transforma el acto de viajar de una tarea logística en una **experiencia gamificada y socialmente conectada**, sin sacrificar ninguna funcionalidad práctica.

Es la primera app que reconoce que viajar es:
- 🎮 **Un juego** (gamificación)
- 🤝 **Social** (colaboración real)
- 🤖 **Asistido por IA** (no reemplazado)
- 🔐 **Privado** (pero compartible por elección)
- 📊 **Cuantificable** (estadísticas y progreso)
- 🎨 **Memorable** (memoria visual y fotobook)
- 🌍 **Global** (pero personal)

**En resumen**: Es el **"Super App"** de viajes que combina lo mejor de la gamificación (Duolingo), colaboración (Notion), IA (ChatGPT), mapas (Google Maps), social (Instagram), y gestión (TripIt) en una experiencia cohesiva única.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.3.1**: Biblioteca principal de UI
- **TypeScript 5.5.3**: Tipado estático y mayor seguridad en el código
- **Vite 5.4.1**: Build tool y bundler moderno
- **Tailwind CSS 3.4.11**: Framework de CSS utility-first
- **shadcn/ui**: Sistema de componentes basado en Radix UI
- **React Router DOM 6.26.2**: Enrutamiento de la aplicación
- **Redux Toolkit 2.8.2**: Gestión de estado global
  - authSlice: Estado de autenticación
  - userSlice: Datos del usuario
  - weatherSlice: Datos meteorológicos
  - apiSlice: Cache de API calls
- **React Query (TanStack Query) 5.56.2**: Server state management
- **React Hook Form 7.53.0**: Manejo de formularios
- **Zod 3.23.8**: Validación de esquemas
- **Axios 1.10.0**: Cliente HTTP

### Mapas y Geolocalización
- **Leaflet 1.9.4**: Librería de mapas interactivos
- **React Leaflet 4.2.1**: Integración de Leaflet con React
- **@capacitor/geolocation**: Plugin para geolocalización nativa

### Backend y Base de Datos
- **Supabase 2.50.0**: Backend as a Service (BaaS)
  - PostgreSQL como base de datos
  - Autenticación y autorización
  - Storage para imágenes y archivos
  - Edge Functions para lógica del servidor
  - Real-time subscriptions

### Mobile (Capacitor)
- **@capacitor/core 7.4.2**: Framework para aplicaciones móviles nativas
- **@capacitor/android 7.4.0**: Soporte para Android
- **@capacitor/ios 7.4.2**: Soporte para iOS
- **@capacitor/local-notifications**: Notificaciones locales
- **@capacitor/push-notifications**: Notificaciones push
- **@capgo/capacitor-social-login**: Autenticación social nativa

### APIs y Servicios Externos
- **Google Places API**: Búsqueda de lugares y recomendaciones
- **Google Directions API**: Cálculo de rutas
- **Google Gemini AI**: Recomendaciones inteligentes de lugares
- **Trip.com**: Widget de reservas de vuelos
- **Booking.com**: Widget de reservas de hoteles

### UI/UX y Animaciones
- **Radix UI**: Componentes accesibles y sin estilos
  - Dialog, Dropdown, Select, Tabs, Tooltip, y más
- **Lottie React 2.4.1**: Animaciones JSON de Lottie
- **Canvas Confetti 1.9.3**: Efectos de celebración
- **Embla Carousel 8.6.0**: Carousels y sliders
- **Lucide React 0.462.0**: Iconos modernos
- **Recharts 2.12.7**: Gráficos y visualizaciones
- **Sonner 1.5.0**: Sistema de toast notifications
- **Next Themes 0.3.0**: Sistema de temas claro/oscuro
- **Vaul 0.9.3**: Drawer component

### Drag and Drop
- **@dnd-kit/core 6.3.1**: Core de drag and drop
- **@dnd-kit/sortable 10.0.0**: Listas ordenables
- **@dnd-kit/utilities 3.2.2**: Utilidades DnD
- **React Beautiful DnD 13.1.1**: Drag and drop alternativo

### Formularios y Fechas
- **React Hook Form 7.53.0**: Gestión de formularios
- **@hookform/resolvers 3.9.0**: Resolvers para validación
- **React Day Picker 8.10.1**: Selector de fechas
- **@internationalized/date 3.8.2**: Manejo de fechas internacionales
- **date-fns 3.6.0**: Utilidades de fechas

### Herramientas de Desarrollo
- **ESLint 9.9.0**: Linting de código
- **Prettier 3.6.2**: Formateo de código
- **Lovable**: Plataforma de desarrollo colaborativo
- **TypeScript ESLint 8.0.1**: ESLint para TypeScript
- **Autoprefixer 10.4.20**: Post-procesador CSS

---

## 🏗️ Arquitectura del Proyecto

### Patrón de Arquitectura
La aplicación sigue una arquitectura de **componentes basada en React** con las siguientes capas:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Components, Pages, Modals)      │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│      (Hooks, Contexts, Utils)       │
├─────────────────────────────────────┤
│          Data Access Layer          │
│   (Services, API, Supabase Client)  │
├─────────────────────────────────────┤
│           State Management          │
│         (Redux, React Query)        │
└─────────────────────────────────────┘
```

### Principios de Diseño
- **Component-Based**: Componentes reutilizables y modulares
- **Custom Hooks**: Lógica de negocio encapsulada en hooks personalizados
- **Context API**: Gestión de estado global para temas transversales
- **Type Safety**: TypeScript para prevenir errores en tiempo de compilación
- **Separation of Concerns**: Separación clara entre UI, lógica y datos

---

## ⚡ Funcionalidades Principales

### 1. 🔐 Autenticación y Perfiles
- **Login/Registro**: Con email/password y Google OAuth
- **Perfil de Usuario**: 
  - Información personal editable
  - Foto de perfil
  - Nivel de viajero (gamificación)
  - Estadísticas de viaje
  - Publicaciones de viaje
- **Recuperación de Contraseña**: Flujo completo de reset
- **Welcome Flow**: Onboarding para nuevos usuarios

### 2. 🗺️ Gestión de Viajes
- **Crear Viajes**: 
  - Múltiples destinos
  - Fechas de inicio y fin
  - Información de vuelos y alojamiento
  - Presupuesto y divisas
  - Modo de viaje (individual/grupal)
  - Emoji personalizado por viaje
- **Plantillas de Viaje Específicas**:
  - 🏖️ **Beach Vacation**: Viajes de playa optimizados
  - 🎒 **Backpacking**: Aventuras mochileras
  - 🏙️ **City Break**: Escapadas urbanas
  - ⛰️ **Mountain Trip**: Viajes a la montaña
  - Configuraciones pre-optimizadas por tipo
- **Editar Viajes**: Modificación completa de todos los datos
- **Eliminar Viajes**: Con confirmación de seguridad
- **Estados de Viaje**:
  - Planificando
  - Próximo/Confirmado
  - En progreso
  - Completado
  - Cancelado
- **Detalles del Viaje**:
  - Vista completa con todos los datos
  - Miembros del equipo
  - Itinerario detallado
  - Fotos del viaje
  - Gastos y balance
  - Documentos asociados

### 3. 🗺️ Mapa Interactivo
- **Visualización de Viajes**: Todos los viajes en un mapa mundial
- **Marcadores Personalizados**: Por cada destino con emoji del viaje
- **Rutas**: Líneas conectando destinos de cada viaje
- **Filtros Avanzados**:
  - Por estado del viaje
  - Por tipo de viaje (solo/grupal)
  - Por rango de fechas
  - Mostrar/ocultar rutas
- **Estilos de Mapa**: Calle, Satélite, Terreno
- **Zoom Automático**: Ajuste inteligente a los marcadores visibles
- **Componente SSR-Safe**: Compatible con Vercel y otros servicios

### 4. 👥 Colaboración en Grupo
- **Invitar Amigos**: Por email con sistema de invitaciones
- **Roles**: 
  - Organizador (creador del viaje)
  - Viajero (miembro invitado)
- **Gestión de Equipo**: Ver y gestionar miembros del viaje
- **Sistema de Gastos**:
  - Registro de gastos compartidos
  - División de costos
  - Balance por persona
  - Historial de transacciones
- **Toma de Decisiones**:
  - Crear votaciones
  - Sistema de votación democrático
  - Ver resultados en tiempo real

### 5. 🔍 Exploración de Destinos
- **Búsqueda de Lugares**: 
  - Por nombre o tipo
  - Filtros por categoría
  - Resultados con información detallada
- **Recomendaciones con IA**: 
  - Powered by Google Gemini
  - Personalizadas según preferencias
  - Información contextual
- **Lugares Cercanos**: Descubrir atracciones alrededor
- **Guardar Lugares**: Para usar en futuros viajes
- **Agregar a Viaje**: Desde la exploración a un viaje existente

### 6. 🧳 Itinerarios Inteligentes
- **Generación Automática con IA**:
  - Rutas optimizadas
  - Consideración de tiempos de traslado
  - Sugerencias de actividades
  - Tiempo libre calculado
- **Edición Manual**: 
  - Drag & drop de actividades
  - Modificar horarios
  - Agregar notas
- **Visualización**: 
  - Vista por día
  - Vista de timeline
  - Vista en mapa
- **Exportación**: PDF y compartir

### 7. ✈️ Reservas Integradas
- **Vuelos**:
  - Búsqueda integrada con Trip.com
  - Registro de vuelos manual
  - Vuelos de ida, ida y vuelta, multi-ciudad
  - Recomendaciones de IA basadas en fechas del viaje
  - Vincular a viajes existentes
  - Notificaciones de vuelo
  - Guardado automático de información
- **Hoteles**:
  - Widget de Booking.com integrado
  - Selección por destino
  - Recomendaciones basadas en IA según fechas
  - Ofertas especiales destacadas
  - Búsqueda multi-destino
  - Integración con itinerario del viaje
- **Tours y Actividades**:
  - Catálogo de tours por destino
  - Búsqueda por categoría
  - Reserva integrada
  - Información detallada con precios
  - Ratings y reviews
- **Transporte**:
  - Opciones de transporte local
  - Renta de autos
  - Transporte público
  - Información de rutas
- **Restaurantes**:
  - Búsqueda de restaurantes locales
  - Filtros por tipo de cocina
  - Información de ubicación y horarios
  - Reservas y contacto
- **eSIM**:
  - Ofertas de eSIM para viajeros
  - Comparación de planes
  - Activación fácil
  - Cobertura por país

### 8. 📸 Memorias y Fotobook
- **Subir Fotos**: Durante o después del viaje
- **Galería por Viaje**: Organización automática
- **Fotobook Digital**: 
  - Compilación automática
  - Diseños pre-diseñados
  - Compartir con el equipo
- **Compartir Publicaciones**: En el feed social interno

### 9. 🏆 Gamificación
- **Sistema de Niveles**: 
  - Viajero Novato
  - Explorador
  - Trotamundos
  - Maestro Viajero
- **Insignias y Logros**:
  - Por cantidad de viajes
  - Por países visitados
  - Por actividades completadas
- **Puntos de Experiencia**: Por completar acciones
- **Estadísticas**:
  - Países visitados
  - Ciudades exploradas
  - Distancia recorrida
  - Días viajando

### 10. 📄 Documentos de Viaje
- **Almacenamiento Seguro**:
  - Pasaportes
  - Visas
  - Seguro de viaje
  - Boletos
- **Encriptación**: Documentos encriptados en reposo
- **Acceso Rápido**: Durante el viaje
- **Compartir con Equipo**: Opcionalmente

### 11. 🔔 Notificaciones
- **Notificaciones Locales**: 
  - Recordatorios de vuelos
  - Recordatorios de actividades
  - Alertas de viaje
- **Notificaciones Push**: 
  - Invitaciones a viajes
  - Mensajes del equipo
  - Actualizaciones de itinerario
- **Notificaciones en App**:
  - Badge con contador
  - Lista de notificaciones
  - Marcar como leídas

### 12. 🌐 Viaje en Tiempo Real (Travel Mode)
- **Activación Manual**: Al iniciar un viaje
- **Tracking de Ubicación**: Con consentimiento del usuario
- **Compartir Ubicación**: Con miembros del equipo
- **Detección de Llegadas**: Alertas al llegar a lugares planificados
- **Modo Offline**: Funcionalidades básicas sin conexión

### 13. ⚙️ Configuración y Personalización
- **Idiomas**: 
  - Español
  - Inglés
  - Francés
  - Italiano
  - Portugués
  - Chino
- **Tema**: Claro/Oscuro (próximamente)
- **Privacidad**:
  - Control de ubicación
  - Perfil público/privado
  - Compartir estadísticas
- **Notificaciones**: Configuración granular

### 14. 🌦️ Widget de Clima
- **Clima Actual**: 
  - Temperatura en tiempo real
  - Condiciones climáticas
  - Humedad y velocidad del viento
  - Ubicación automática por GPS
- **Integración Redux**: 
  - Estado global del clima
  - Cache de datos
  - Actualización periódica
- **Visualización**:
  - Widget en home con iconos
  - Información de ubicación
  - Actualización automática cada minuto

### 15. 📱 Feed Social y Comunidad (Travelers)
- **Explorar Viajeros**:
  - Lista de viajeros activos
  - Perfiles públicos
  - Estadísticas de la comunidad
- **Publicaciones de Viaje**:
  - Feed de publicaciones de amigos
  - Fotos y experiencias compartidas
  - Interacción social (próximamente)
- **Estadísticas Comunitarias**:
  - Total de viajeros
  - Países visitados globalmente
  - Actividad reciente
- **Seguir Viajeros**: 
  - Sistema de seguimiento (próximamente)
  - Ver publicaciones de seguidos

### 16. 📸 InstaTrip - Historias de Viaje
- **Historias Temporales**:
  - Fotos que expiran en 12 horas
  - Similar a Instagram Stories
  - Visualización automática cada 15 segundos
- **Compartir Momentos**:
  - Subir fotos desde la galería
  - Agregar ubicación y metadata
  - Compartir con viajeros
- **Agregar a Viaje**:
  - Vincular InstaTrip a viajes existentes
  - Convertir en memoria permanente
  - Integración con fotobook
- **Gestión Automática**:
  - Limpieza automática después de 12 horas
  - Navegación entre historias
  - Contador de tiempo restante

### 17. 🏠 Dashboard Principal (Home)
- **Vista Actual del Viaje**:
  - Próximo viaje destacado
  - Cuenta regresiva hasta la fecha
  - Vista de viaje en progreso con Travel Mode
  - Acceso rápido a detalles
- **Estadísticas Rápidas**:
  - Lugares guardados totales
  - Viajes próximos
  - Visualización en cards coloridas
- **Widget de Clima**: Clima en ubicación actual
- **Lugares Populares**:
  - Rotación de lugares trending
  - Guardados globalmente por usuarios
  - Temporizador de 5 minutos por lugar
  - Datos de Gemini AI y comunidad
- **Acciones Rápidas**:
  - Alertas de lugares cercanos
  - Acceso rápido a funciones
- **Travel Mode Quick Access**: Activar/desactivar modo viaje
- **Actividad Reciente**: Últimas acciones en la app
- **Slogan Motivacional**: Frase de viaje inspiradora

### 18. 🎮 Sistema de Gamificación Detallado
- **20 Niveles de Viajero**:
  1. Backpack Explorer (0 XP)
  2. City Wanderer (1,000 XP)
  3. Culture Seeker (2,500 XP)
  4. Adventure Guide (4,500 XP)
  5. Explorer (7,000 XP)
  6. Journey Master (10,000 XP)
  7. Wanderer (14,000 XP)
  8. Globe Trotter (19,000 XP)
  9. Travel Guru (25,000 XP)
  10. Nomad (32,000 XP)
  11. World Explorer (40,000 XP)
  12. Cultural Ambassador (50,000 XP)
  13. Adventure Legend (62,000 XP)
  14. Master Traveler (76,000 XP)
  15. Epic Voyager (92,000 XP)
  16. Cosmic Explorer (110,000 XP)
  17. Infinity Traveler (130,000 XP)
  18. Dimensional Wanderer (152,000 XP)
  19. Mythical Adventurer (176,000 XP)
  20. Legendary Traveler (202,000 XP) - Nivel Máximo

- **30+ Insignias de Logros** en 5 categorías:
  - **Exploración Global**: First Country, Country Collector, World Citizen, Travel Marathon, Continent Explorer
  - **Descubrimientos Locales**: City Explorer, Museum Enthusiast, Photo Journalist, Historic Hunter, Architecture Admirer
  - **Comida y Gastronomía**: Foodie, Cuisine Master, Street Food Explorer, Local Market Visitor, Coffee Connoisseur
  - **Familia y Experiencias**: Family Traveler, Beach Lover, Route Master, Nature Enthusiast, Mountain Climber
  - **Contribuciones**: Reviewer, Itinerary Creator, Map Pioneer, Travel Photographer
  - **Especiales**: Explorer of the Day, Weekend Warrior, Early Bird, Night Explorer, Seasonal Traveler, Explorer 100%, Legendary Medal

- **Sistema de Rareza**:
  - Común (Common)
  - Raro (Rare)
  - Épico (Epic)
  - Legendario (Legendary)

- **Puntos de Experiencia (XP)**:
  - Por completar viajes
  - Por visitar lugares
  - Por subir fotos
  - Por escribir reviews
  - Por crear itinerarios
  - Por logros especiales

### 19. 🔔 Sistema de Alertas Cercanas
- **Detección de Proximidad**:
  - Lugares guardados cerca de tu ubicación
  - Radio de detección adaptable (5km base)
  - Múltiples umbrales de notificación
- **Notificaciones Progresivas**:
  - 5km, 2km, 1km, 500m, 100m, 50m, 10m
  - Cooldown de 5 minutos entre notificaciones
  - Priorización inteligente de lugares
- **Información Contextual**:
  - Distancia al lugar
  - Categoría del lugar
  - Viaje asociado
  - Detalles de ubicación

### 20. 🔄 Tracking en Tiempo Real
- **Indicador de GPS Continuo**:
  - Estado visual de tracking activo
  - Última actualización de ubicación
  - Indicador pulsante cuando está activo
  - Alertas de errores de GPS
- **Compartir Ubicación**:
  - Con miembros del equipo de viaje
  - Control de privacidad
  - Desactivación fácil
- **Detección de Velocidad**:
  - Cálculo de velocidad actual (m/s)
  - Ajuste dinámico de frecuencia de checks
  - Optimización de batería

### 21. ⭐ Sistema de Reviews y Valoraciones
- **Escribir Reviews**:
  - Reseñas de lugares visitados
  - Sistema de calificación con estrellas
  - Comentarios detallados
  - Fotos de apoyo
- **Ver Reviews**:
  - Reviews propias en perfil
  - Modal de "Mis Reviews"
  - Historial completo
  - Edición y eliminación
- **Contribución a la Comunidad**:
  - Ayudar a otros viajeros
  - Ganar XP por escribir reviews
  - Insignia de "Reviewer" (25 reviews)

### 22. 💬 Sistema de Feedback
- **Enviar Feedback**:
  - Sugerencias de mejora
  - Reportar bugs
  - Solicitar funcionalidades
  - Comunicación directa con el equipo
- **Categorías**:
  - Sugerencia
  - Bug/Error
  - Pregunta
  - Otro
- **Seguimiento**: Respuestas del equipo de desarrollo

### 23. 🔐 Seguridad Avanzada
- **Encriptación de Documentos**:
  - AES-256 para documentos sensibles
  - Encriptación cliente-servidor
  - Edge Functions para decrypt seguro
- **Gestión de Documentos**:
  - Subir documentos (pasaporte, visas, seguros)
  - Almacenamiento encriptado
  - Acceso con autenticación
  - Compartir con equipo (opcional)
- **Edge Functions de Seguridad**:
  - `encrypt-document`: Encriptar archivos
  - `decrypt-document`: Desencriptar con autenticación
  - `delete-document`: Eliminación segura
  - `list-documents`: Listar con permisos
  - `location-privacy-monitor`: Monitoreo de privacidad

### 24. 🎯 Recomendaciones Inteligentes
- **Lugares Recomendados**:
  - Google Gemini AI para sugerencias
  - Basadas en preferencias del usuario
  - Contextuales al viaje actual
  - Información detallada y relevante
- **Hoteles con IA**:
  - Recomendaciones de fechas óptimas
  - Análisis de itinerario actual
  - Sugerencias de ubicación estratégica
- **Vuelos con IA**:
  - Mejores fechas según el viaje
  - Tiempos de conexión optimizados
  - Alertas de timing

### 25. 📊 Estadísticas y Analytics
- **Perfil de Usuario**:
  - Total de viajes completados
  - Países visitados
  - Ciudades exploradas
  - Días viajando
  - Distancia total recorrida
  - Nivel de viajero actual
- **Estadísticas de Viaje**:
  - Duración del viaje
  - Lugares visitados
  - Fotos tomadas
  - Gastos totales
  - Miembros del equipo
- **Visualizaciones**:
  - Gráficos con Recharts
  - Mapas de calor
  - Líneas de tiempo
  - Comparativas

### 26. 🌍 Exploración de Lugares
- **Búsqueda Avanzada**:
  - Por nombre, categoría, ubicación
  - Filtros múltiples
  - Ordenamiento por relevancia, distancia, rating
- **Categorías de Lugares**:
  - Atracciones turísticas
  - Restaurantes
  - Hoteles
  - Cafés
  - Museos
  - Parques
  - Playas
  - Montañas
  - Y más...
- **Detalles de Lugar**:
  - Información completa de Google Places
  - Fotos del lugar
  - Horarios de apertura
  - Contacto y website
  - Ubicación en mapa
  - Reviews de usuarios
- **Acciones**:
  - Guardar lugar
  - Agregar a viaje
  - Ver en mapa
  - Compartir
  - Ver lugares cercanos

---

## 📁 Estructura de Carpetas

```
go-travel-connect/
├── android/                          # Proyecto Android de Capacitor
│   ├── app/
│   │   ├── src/
│   │   └── build.gradle
│   └── gradle/
├── public/                           # Archivos estáticos públicos
│   ├── assets/                       # Recursos (logos, imágenes)
│   ├── data/                         # Datos estáticos (worldcities.zip)
│   └── lottie/                       # Animaciones Lottie
├── src/
│   ├── components/                   # Componentes React
│   │   ├── admin/                    # Componentes de administración
│   │   ├── ads/                      # Sistema de anuncios
│   │   ├── auth/                     # Autenticación (Login, SignUp, AuthGate)
│   │   ├── feedback/                 # Sistema de feedback
│   │   ├── gamification/             # Sistema de gamificación
│   │   ├── home/                     # Componentes de la página principal
│   │   ├── invitations/              # Sistema de invitaciones
│   │   ├── maps/                     # Componentes de mapas
│   │   │   ├── TripMapInteractive.tsx
│   │   │   ├── TripMapWrapper.tsx
│   │   │   ├── MapFilters.tsx
│   │   │   └── TripSelector.tsx
│   │   ├── modals/                   # Modales (158 archivos)
│   │   │   ├── ai-smart-route/       # Modal de rutas inteligentes con IA
│   │   │   ├── edit-trip/            # Edición de viajes
│   │   │   ├── flight-booking/       # Reserva de vuelos
│   │   │   ├── hotel-booking/        # Reserva de hoteles
│   │   │   ├── group-options/        # Opciones de grupo (gastos, decisiones)
│   │   │   ├── itinerary/            # Gestión de itinerarios
│   │   │   ├── login/                # Modal de login
│   │   │   ├── new-trip/             # Crear nuevo viaje
│   │   │   ├── photobook/            # Fotobook
│   │   │   ├── profile/              # Configuración de perfil
│   │   │   ├── saved-places/         # Lugares guardados
│   │   │   ├── tours/                # Tours y actividades
│   │   │   ├── travel-documents/     # Documentos de viaje
│   │   │   └── [más modales...]
│   │   ├── navigation/               # Navegación (BottomNavigation)
│   │   ├── places/                   # Componentes de lugares
│   │   ├── profile/                  # Componentes de perfil
│   │   ├── sections/                 # Secciones principales de la app
│   │   │   ├── HomeSection.tsx
│   │   │   ├── TripsSection.tsx
│   │   │   ├── ExploreSection.tsx
│   │   │   ├── BookingSection.tsx
│   │   │   ├── TravelersSection.tsx
│   │   │   └── ProfileSection.tsx
│   │   ├── security/                 # Componentes de seguridad
│   │   ├── teams/                    # Gestión de equipos
│   │   ├── travel/                   # Componentes de viaje
│   │   ├── travelers/                # Componentes de viajeros
│   │   ├── trips/                    # Componentes de trips
│   │   ├── ui/                       # Componentes UI de shadcn (59 archivos)
│   │   └── widgets/                  # Widgets reutilizables
│   ├── contexts/                     # Context API
│   │   ├── LanguageContext.tsx       # Contexto de idioma
│   │   ├── LanguageTypes.ts
│   │   └── TravelModeContext.tsx     # Contexto de modo viaje
│   ├── data/                         # Datos estáticos
│   │   ├── gamificationData.ts       # Datos de gamificación
│   │   └── travelers.ts              # Datos de viajeros
│   ├── hooks/                        # Custom hooks (67 archivos)
│   │   ├── useAuth.ts                # Autenticación
│   │   ├── useTrips.ts               # Gestión de viajes
│   │   ├── useInvitations.ts         # Sistema de invitaciones
│   │   ├── useMapData.ts             # Datos del mapa
│   │   ├── useLanguage.ts            # Internacionalización
│   │   └── [más hooks...]
│   ├── integrations/                 # Integraciones externas
│   │   └── supabase/                 # Cliente de Supabase
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/                          # Librerías y utilidades
│   │   └── utils.ts                  # Utilidades generales (cn, etc.)
│   ├── locales/                      # Archivos de traducción
│   │   ├── en/                       # Inglés (13 archivos)
│   │   ├── es/                       # Español (13 archivos)
│   │   ├── zh/                       # Chino (9 archivos)
│   │   ├── es.json
│   │   ├── fr.json
│   │   ├── it.json
│   │   ├── pt.json
│   │   └── loader.ts
│   ├── pages/                        # Páginas principales
│   │   ├── Index.tsx                 # Página principal
│   │   ├── TravelModePage.tsx        # Página de modo viaje
│   │   ├── AcceptInvitation.tsx      # Aceptar invitación
│   │   ├── InvitationLanding.tsx     # Landing de invitaciones
│   │   └── NotFound.tsx              # Página 404
│   ├── providers/                    # Providers de contexto
│   │   └── ReduxProvider.tsx         # Provider de Redux
│   ├── services/                     # Servicios de API
│   │   ├── aiRoutesApi.ts            # API de rutas con IA
│   │   ├── apiService.ts             # Servicio API genérico
│   │   ├── travelNotificationService.ts
│   │   ├── types.ts
│   │   └── weatherService.ts         # Servicio de clima
│   ├── store/                        # Redux store
│   │   ├── index.ts
│   │   └── slices/                   # Redux slices (4 archivos)
│   ├── types/                        # Definiciones de tipos TypeScript
│   │   ├── aiSmartRoute.ts
│   │   ├── aiSmartRouteApi.ts
│   │   ├── gamification.ts
│   │   ├── index.ts
│   │   └── profile.ts
│   ├── utils/                        # Funciones utilitarias
│   │   ├── adaptiveRadius.ts
│   │   ├── aiSmartRoute.ts
│   │   ├── capacitor.ts              # Utilidades de Capacitor
│   │   ├── dateHelpers.ts
│   │   ├── dateUtils.ts
│   │   ├── distanceCalculator.ts
│   │   ├── environment.ts            # Variables de entorno
│   │   ├── itineraryUtils.ts
│   │   ├── localEncryption.ts        # Encriptación local
│   │   ├── locationUtils.ts
│   │   ├── mockData.ts
│   │   ├── placeSuggestions.ts
│   │   ├── placeUtils.ts
│   │   ├── routeGenerator.ts
│   │   ├── securityUtils.ts
│   │   ├── tripStatusUtils.ts
│   │   └── unifiedEncryption.ts
│   ├── App.tsx                       # Componente raíz
│   ├── main.tsx                      # Punto de entrada
│   ├── index.css                     # Estilos globales
│   └── vite-env.d.ts
├── supabase/                         # Configuración de Supabase
│   ├── config.toml                   # Configuración local
│   ├── functions/                    # Edge Functions (17 funciones)
│   │   ├── accept-trip-invitation/
│   │   ├── ai-route-generator/
│   │   ├── auth-emails/
│   │   ├── cities-by-country/
│   │   ├── countries-sync/
│   │   ├── decline-trip-invitation/
│   │   ├── decrypt-document/
│   │   ├── delete-document/
│   │   ├── encrypt-document/
│   │   ├── gemini-places/
│   │   ├── google-directions/
│   │   ├── google-places/
│   │   ├── google-places-enhanced/
│   │   ├── list-documents/
│   │   ├── location-privacy-monitor/
│   │   ├── send-invitation-email/
│   │   ├── send-trip-invitation/
│   │   └── upload-country-image/
│   └── migrations/                   # Migraciones SQL (122 archivos)
├── capacitor.config.json             # Configuración de Capacitor
├── package.json                      # Dependencias npm
├── tsconfig.json                     # Configuración TypeScript
├── tailwind.config.ts                # Configuración Tailwind
├── vite.config.ts                    # Configuración Vite
├── vercel.json                       # Configuración de Vercel
├── README.md                         # Documentación básica
├── CAPACITOR_SETUP.md                # Guía de setup de Capacitor
├── GOOGLE_AUTH_SETUP.md              # Guía de Google Auth
├── SECURITY_IMPROVEMENTS.md          # Mejoras de seguridad
├── MAPA_INTERACTIVO_README.md        # Documentación del mapa
└── PRETTIER_SETUP.md                 # Configuración de Prettier
```

---

## 🗄️ Backend y Base de Datos

### Supabase como Backend

La aplicación utiliza **Supabase** como Backend as a Service (BaaS), que proporciona:

#### 1. Base de Datos PostgreSQL

**Tablas Principales:**

- **profiles**: Información de usuarios
  - `id` (uuid, PK)
  - `email`
  - `full_name`
  - `username`
  - `avatar_url`
  - `bio`
  - `country`
  - `traveler_level`
  - `total_trips`
  - `countries_visited`
  - Configuraciones de privacidad

- **trips**: Información de viajes
  - `id` (uuid, PK)
  - `user_id` (FK a profiles)
  - `title`
  - `destinations` (jsonb)
  - `start_date`
  - `end_date`
  - `status` (upcoming, planning, in_progress, completed, cancelled)
  - `trip_mode` (individual, group)
  - `budget`
  - `currency`
  - `emoji`

- **trip_members**: Miembros de viajes grupales
  - `id` (uuid, PK)
  - `trip_id` (FK a trips)
  - `user_id` (FK a profiles)
  - `role` (organizer, traveler)
  - `joined_at`

- **trip_invitations**: Invitaciones a viajes
  - `id` (uuid, PK)
  - `trip_id` (FK a trips)
  - `inviter_id` (FK a profiles)
  - `email`
  - `token` (unique)
  - `status` (pending, accepted, declined)
  - `expires_at`

- **saved_places**: Lugares guardados por usuarios
  - `id` (uuid, PK)
  - `user_id` (FK a profiles)
  - `place_data` (jsonb)
  - `notes`
  - `category`

- **trip_expenses**: Gastos de viaje
  - `id` (uuid, PK)
  - `trip_id` (FK a trips)
  - `paid_by` (FK a profiles)
  - `amount`
  - `currency`
  - `description`
  - `split_with` (array de user_ids)

- **trip_decisions**: Decisiones/votaciones del grupo
  - `id` (uuid, PK)
  - `trip_id` (FK a trips)
  - `title`
  - `description`
  - `options` (jsonb)
  - `votes` (jsonb)
  - `status` (open, closed)

- **trip_photos**: Fotos de viaje
  - `id` (uuid, PK)
  - `trip_id` (FK a trips)
  - `user_id` (FK a profiles)
  - `photo_url`
  - `caption`
  - `location` (jsonb)

- **notifications**: Notificaciones de usuario
  - `id` (uuid, PK)
  - `user_id` (FK a profiles)
  - `type`
  - `content` (jsonb)
  - `read`
  - `created_at`

#### 2. Row Level Security (RLS)

Todas las tablas tienen políticas de RLS implementadas para garantizar que:
- Los usuarios solo pueden ver sus propios datos
- Los miembros de un viaje pueden ver datos del viaje
- Los propietarios de viajes tienen permisos adicionales
- Las invitaciones están protegidas contra harvesting de emails

#### 3. Storage

**Buckets configurados:**
- `avatars`: Fotos de perfil de usuarios
- `trip-photos`: Fotos de viajes
- `travel-documents`: Documentos encriptados
- `country-images`: Imágenes de países

#### 4. Edge Functions

**Funciones implementadas:**

1. **accept-trip-invitation**: Aceptar invitación a viaje
2. **ai-route-generator**: Generar rutas con IA
3. **auth-emails**: Emails personalizados de autenticación
4. **cities-by-country**: Obtener ciudades de un país
5. **countries-sync**: Sincronizar datos de países
6. **decline-trip-invitation**: Rechazar invitación
7. **decrypt-document**: Desencriptar documento
8. **delete-document**: Eliminar documento
9. **encrypt-document**: Encriptar documento
10. **gemini-places**: Recomendaciones con Google Gemini
11. **google-directions**: Obtener direcciones de Google
12. **google-places**: Buscar lugares con Google Places API
13. **google-places-enhanced**: Búsqueda mejorada de lugares
14. **list-documents**: Listar documentos del usuario
15. **location-privacy-monitor**: Monitoreo de privacidad de ubicación
16. **send-invitation-email**: Enviar email de invitación
17. **send-trip-invitation**: Crear y enviar invitación

#### 5. Real-time Subscriptions

La aplicación usa subscripciones en tiempo real para:
- Notificaciones instantáneas
- Actualizaciones de viajes grupales
- Cambios en itinerarios
- Mensajes del equipo

---

## 📱 Configuración de Capacitor

### Plataformas Soportadas
- **Android**: ✅ Configurado
- **iOS**: ✅ Configurado
- **Web/PWA**: ✅ Activo

### Plugins Utilizados

1. **@capacitor/geolocation**: Acceso a GPS del dispositivo
2. **@capacitor/local-notifications**: Notificaciones locales
3. **@capacitor/push-notifications**: Notificaciones push
4. **@capgo/capacitor-social-login**: Login con Google nativo

### Configuración de Capacitor

**capacitor.config.json**:
```json
{
  "appId": "app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8",
  "appName": "goveling-mvp",
  "webDir": "dist",
  "plugins": {
    "Geolocation": {
      "permissions": ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    "LocalNotifications": {
      "requestPermissions": true,
      "enableBadge": true
    },
    "SocialLogin": {
      "google": {
        "webClientId": "[WEB_CLIENT_ID]",
        "androidClientId": "[ANDROID_CLIENT_ID]",
        "iosClientId": "[IOS_CLIENT_ID]"
      }
    }
  }
}
```

### Permisos Requeridos

**Android (AndroidManifest.xml)**:
- `ACCESS_FINE_LOCATION`: GPS preciso
- `ACCESS_COARSE_LOCATION`: Ubicación aproximada
- `INTERNET`: Acceso a internet
- `CAMERA`: Acceso a la cámara
- `WRITE_EXTERNAL_STORAGE`: Guardar archivos

**iOS (Info.plist)**:
- `NSLocationWhenInUseUsageDescription`: Ubicación en uso
- `NSCameraUsageDescription`: Uso de la cámara
- `NSPhotoLibraryUsageDescription`: Acceso a fotos

### Proceso de Build

```bash
# 1. Instalar dependencias
npm install

# 2. Build de la aplicación web
npm run build

# 3. Sincronizar con plataformas nativas
npx cap sync

# 4. Abrir en Android Studio
npx cap open android

# 5. Abrir en Xcode
npx cap open ios
```

---

## 🔒 Seguridad

### Medidas de Seguridad Implementadas

#### 1. Autenticación y Autorización
- **JWT Tokens**: Tokens seguros para sesiones
- **OAuth 2.0**: Login con Google
- **Password Hashing**: Contraseñas hasheadas con bcrypt
- **Email Verification**: Verificación de email obligatoria
- **Password Reset**: Flujo seguro de recuperación

#### 2. Row Level Security (RLS)
- **Políticas Estrictas**: Acceso solo a datos propios
- **Verificación de Propietario**: En viajes y recursos
- **Security Definer Functions**: Para lógica sensible
- **Prevención de Email Harvesting**: ✅ Implementado

#### 3. Encriptación
- **Documentos**: Encriptación AES-256 en reposo
- **HTTPS**: Todo el tráfico encriptado
- **SSL Pinning**: En aplicaciones móviles (recomendado)

#### 4. Validación y Sanitización
- **Zod Schema**: Validación de datos en frontend
- **SQL Prepared Statements**: Prevención de SQL injection
- **Input Sanitization**: Limpieza de inputs de usuario

#### 5. Privacidad
- **Control de Ubicación**: Usuario decide cuándo compartir
- **Perfil Privado**: Opción de perfil no público
- **Datos Mínimos**: Solo se recopila lo necesario
- **GDPR Compliant**: Cumplimiento de regulaciones

#### 6. Monitoreo
- **Location Privacy Monitor**: Edge function que monitorea accesos
- **Audit Logs**: Registro de acciones sensibles (próximo)
- **Rate Limiting**: Límites en APIs (próximo)

### Vulnerabilidades Resueltas
- ✅ **Customer Email Addresses Could Be Stolen**: Políticas RLS mejoradas
- ⚠️ **Profile Information Protection**: En progreso
- ⚠️ **Financial Data Protection**: Planeado

---

## 🌐 Internacionalización

### Idiomas Soportados
1. **Español (es)**: ✅ Completo
2. **Inglés (en)**: ✅ Completo
3. **Francés (fr)**: ✅ Completo
4. **Italiano (it)**: ✅ Completo
5. **Portugués (pt)**: ✅ Completo
6. **Chino (zh)**: 🔄 Parcial

### Arquitectura de i18n

**LanguageContext.tsx**: Contexto global de idioma

**Estructura de archivos de traducción:**
```
locales/
├── es/
│   ├── common.json           # Textos comunes
│   ├── auth.json             # Autenticación
│   ├── trips.json            # Viajes
│   ├── explore.json          # Exploración
│   ├── profile.json          # Perfil
│   ├── booking.json          # Reservas
│   ├── gamification.json     # Gamificación
│   ├── notifications.json    # Notificaciones
│   └── ... (más archivos)
├── en/
│   └── ... (misma estructura)
├── fr/
│   └── ... (misma estructura)
└── ... (más idiomas)
```

### Uso en Componentes

```typescript
import { useLanguage } from '@/hooks/useLanguage';

const MyComponent = () => {
  const { t } = useLanguage();
  
  return <h1>{t('common.welcome')}</h1>;
};
```

### Cambio de Idioma

El usuario puede cambiar el idioma desde:
- Configuración de perfil
- Selector en el footer
- Detección automática del navegador (primera vez)

---

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js 18+ y npm
- Git
- Android Studio (para Android)
- Xcode (para iOS, solo en macOS)

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/[tu-usuario]/go-travel-connect.git
cd go-travel-connect

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local con:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GOOGLE_PLACES_API_KEY=tu-google-api-key
VITE_GOOGLE_MAPS_API_KEY=tu-maps-key

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Configuración de Supabase

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Iniciar Supabase localmente
supabase start

# 3. Ejecutar migraciones
supabase db push

# 4. Deploy de Edge Functions
supabase functions deploy
```

### Configuración de Google APIs

1. **Google Cloud Console**:
   - Crear proyecto
   - Habilitar Places API
   - Habilitar Directions API
   - Habilitar Gemini API
   - Crear credenciales OAuth 2.0

2. **Configurar OAuth**:
   - Web Client ID para Supabase
   - Android Client ID para app móvil
   - iOS Client ID para app móvil

### Build para Producción

```bash
# Build web
npm run build

# Preview del build
npm run preview
```

---

## 🌍 Despliegue

### Despliegue Web (Vercel)

**Automático desde GitHub:**
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push a main

**Variables de entorno en Vercel:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_GOOGLE_MAPS_API_KEY
```

**vercel.json configurado** para SPA routing.

### Despliegue Android

```bash
# 1. Build de producción
npm run build

# 2. Sincronizar con Android
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. Generar APK/AAB firmado
# Desde Android Studio: Build > Generate Signed Bundle/APK
```

**Requisitos:**
- Keystore configurado
- Google Play Console account
- Íconos y splash screens
- Screenshots y descripción

### Despliegue iOS

```bash
# 1. Build de producción
npm run build

# 2. Sincronizar con iOS
npx cap sync ios

# 3. Abrir en Xcode
npx cap open ios

# 4. Archivar y subir a App Store Connect
# Desde Xcode: Product > Archive
```

**Requisitos:**
- Apple Developer account ($99/año)
- Certificados de distribución
- Provisioning profiles
- App Store Connect configurado

---

## 👨‍💻 Desarrollo

### Scripts de NPM

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run preview       # Preview del build
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Corregir errores de ESLint
npm run format        # Formatear código con Prettier
npm run format:check  # Verificar formato
```

### Convenciones de Código

**TypeScript:**
- Usar tipos explícitos
- Evitar `any`
- Interfaces para objetos complejos

**React:**
- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Nombres descriptivos

**Naming:**
- Componentes: PascalCase
- Funciones/variables: camelCase
- Archivos: kebab-case o PascalCase (componentes)
- Hooks: useNombreHook

**Estructura de Componentes:**
```typescript
// Imports
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

// Types
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// Component
const MyComponent = ({ title, onAction }: MyComponentProps) => {
  // Hooks
  const { t } = useLanguage();
  const [state, setState] = useState(false);
  
  // Handlers
  const handleClick = () => {
    setState(true);
    onAction();
  };
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>{t('common.action')}</button>
    </div>
  );
};

export default MyComponent;
```

### Testing (Próximamente)

```bash
# Unit tests con Vitest
npm run test

# E2E tests con Cypress
npm run test:e2e

# Coverage
npm run test:coverage
```

### Git Workflow

**Branches:**
- `main`: Producción estable
- `develop`: Desarrollo activo
- `feature/*`: Nuevas funcionalidades
- `bugfix/*`: Correcciones de bugs
- `hotfix/*`: Correcciones urgentes

**Commits:**
Seguir Conventional Commits:
```
feat: add trip sharing feature
fix: resolve map rendering issue
docs: update README
style: format code with prettier
refactor: simplify trip creation flow
perf: optimize image loading
test: add tests for auth flow
chore: update dependencies
```

---

## 📊 Estado del Proyecto

### Funcionalidades Implementadas ✅
- ✅ Autenticación completa (email, Google OAuth nativo)
- ✅ Gestión de viajes CRUD completa
- ✅ Plantillas de viaje específicas (Beach, Backpacking, City Break, Mountain)
- ✅ Mapa interactivo mundial con filtros avanzados
- ✅ Sistema de invitaciones por email con tokens
- ✅ Exploración de destinos con Google Places
- ✅ Recomendaciones con Google Gemini AI
- ✅ Reservas integradas (vuelos, hoteles, tours, transporte, restaurantes)
- ✅ Widget de eSIM
- ✅ Itinerarios inteligentes con IA
- ✅ Sistema de gastos compartidos con balance
- ✅ Sistema de votaciones para grupos
- ✅ Gamificación completa (20 niveles, 30+ insignias)
- ✅ Fotobook digital por viaje
- ✅ InstaTrip - Historias temporales de 12 horas
- ✅ Documentos encriptados (AES-256)
- ✅ Notificaciones locales y push
- ✅ Sistema de alertas de lugares cercanos
- ✅ Modo viaje con GPS continuo
- ✅ Tracking en tiempo real con indicadores
- ✅ Widget de clima en tiempo real
- ✅ Feed social y comunidad de viajeros
- ✅ Sistema de reviews y valoraciones
- ✅ Sistema de feedback
- ✅ Dashboard principal con estadísticas
- ✅ Lugares populares con rotación automática
- ✅ Internacionalización (6 idiomas completos)
- ✅ Aplicación móvil (Android/iOS con Capacitor 7)
- ✅ Redux para estado global (auth, user, weather, api)
- ✅ React Query para server state
- ✅ 67+ custom hooks
- ✅ 158+ modales especializados
- ✅ 17 Edge Functions en Supabase
- ✅ Row Level Security completo
- ✅ Drag & Drop para itinerarios
- ✅ Animaciones con Lottie
- ✅ Sistema de permisos y roles
- ✅ Monitoreo de privacidad de ubicación

### En Desarrollo 🔄
- 🔄 Sistema de mensajería interna en tiempo real
- 🔄 Integración con redes sociales (Instagram, Facebook)
- 🔄 Modo offline completo con sync
- 🔄 Tests automatizados (unit, integration, e2e)
- 🔄 Sistema de seguimiento de viajeros (follow/unfollow)
- 🔄 Interacciones sociales (likes, comentarios)
- 🔄 Tema oscuro completo
- 🔄 Notificaciones avanzadas con categorías

### Planeado 📋
- 📋 Recomendaciones de IA más avanzadas con ML
- 📋 Integración con más APIs de reservas (Skyscanner, Expedia, etc.)
- 📋 Marketplace de tours y experiencias
- 📋 Guías de viaje colaborativas
- 📋 Comparador de precios en tiempo real
- 📋 Asistente virtual con IA conversacional
- 📋 Integración con wearables (Apple Watch, Garmin)
- 📋 Sistema de recompensas y beneficios
- 📋 API pública para desarrolladores
- 📋 Web scraping para ofertas automáticas
- 📋 Reconocimiento de imágenes con IA
- 📋 Traducción automática de reviews
- 📋 Sugerencias de empaquetado por clima
- 📋 Alertas de seguridad por destino
- 📋 Integración con calendarios (Google, Apple)
- 📋 Exportación de itinerarios a formatos múltiples
- 📋 Sistema de referidos y afiliados
- 📋 Modo para agencias de viaje

---

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crea** una branch (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'feat: add nueva funcionalidad'`)
4. **Push** a la branch (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### Guías de Contribución
- Seguir las convenciones de código
- Añadir tests para nueva funcionalidad
- Actualizar documentación
- Mantener commits atómicos y descriptivos

---

## 📄 Licencia

Este proyecto es privado y está en desarrollo activo. Todos los derechos reservados.

---

## 📞 Contacto y Soporte

- **Proyecto URL**: https://lovable.dev/projects/bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8
- **Repositorio**: GitHub (privado)
- **Email**: [tu-email@ejemplo.com]

---

## 🙏 Agradecimientos

- **Lovable**: Plataforma de desarrollo
- **Supabase**: Backend as a Service
- **Vercel**: Hosting y despliegue
- **Google**: APIs de mapas y lugares
- **Comunidad Open Source**: Por las librerías utilizadas

---

**Última actualización**: Octubre 18, 2025  
**Versión**: 0.0.0 (MVP en desarrollo activo)  
**Estado**: 🚀 En desarrollo activo con funcionalidades core completadas  
**Líneas de Código**: ~50,000+  
**Tiempo de Desarrollo**: 6+ meses  
**Plataformas**: Web (Vercel), Android, iOS

