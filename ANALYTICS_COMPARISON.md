# 📊 Comparativa de Soluciones de Analytics y Medición para Goveling

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Opciones Disponibles](#opciones-disponibles)
3. [Comparativa Detallada](#comparativa-detallada)
4. [Análisis de Costos por Escala](#análisis-de-costos-por-escala)
5. [Recomendaciones por Etapa](#recomendaciones-por-etapa)
6. [⏰ Cuándo Implementar Firebase Analytics + Crashlytics](#-cuándo-implementar-firebase-analytics--crashlytics)
7. [Implementación Recomendada](#implementación-recomendada)

---

## 🎯 Resumen Ejecutivo

### ⚠️ IMPORTANTE: ¿En qué fase estás?

**Si estás en Ideación/Pre-Launch (sin usuarios reales):**
- ❌ **NO implementes analytics complejo todavía**
- ✅ Enfócate en feedback cualitativo (entrevistas, prototipos)
- ✅ Lee primero la [Fase 0](#fase-0-ideación--pre-launch-0-500-usuarios) de este documento

### Recomendación Principal para Goveling (React Native + Monetización con Ads)

**Aplica cuando:** Ya estés en stores o tengas >500 usuarios reales

**Stack Base:** Firebase Analytics (GA4) + AdMob + Consent Management + Sentry

**Razones:**
- ✅ Costo $0 en etapa inicial y early growth
- ✅ Integración nativa con Google Ads y AdMob (clave para monetización)
- ✅ Soporte completo para React Native
- ✅ Cumplimiento GDPR/CCPA con UMP SDK
- ✅ Escalabilidad demostrada hasta millones de MAU

**Agregar Después:**
- PostHog o Mixpanel cuando necesites analítica de producto avanzada (funnels, cohortes, retención)
- MMP (Adjust/AppsFlyer) solo si escalarás UA pagada multi-canal (Meta, TikTok, etc.)

**⏭️ Salta directo a:** [Fase 0 (Pre-Launch)](#fase-0-ideación--pre-launch-0-500-usuarios) si aún no estás en stores

---

## 📦 Opciones Disponibles

### 1. Firebase Analytics (Google Analytics 4)

**¿Qué es?**
Plataforma de analítica móvil de Google, integrada con GA4. Gratuita e ilimitada.

**Para qué sirve:**
- Tracking de eventos en apps móviles (iOS/Android)
- Análisis de comportamiento de usuarios
- Funnels básicos de conversión
- Integración directa con Google Ads para atribución
- Cohort analysis básico
- Crashlytics y Performance Monitoring

**Ideal para:**
- Apps que monetizan con AdMob o Google Ads
- Proyectos en etapa inicial sin presupuesto
- Equipos que priorizan simplicidad sobre funcionalidad avanzada

**Limitaciones:**
- UI menos intuitiva que competidores
- Reportes limitados vs. herramientas de producto
- Sampling en volúmenes muy altos
- Funnels y cohortes menos potentes que Mixpanel/Amplitude

---

### 2. AdMob (Google Mobile Ads)

**¿Qué es?**
Red de publicidad móvil de Google para monetizar apps con anuncios.

**Para qué sirve:**
- Mostrar anuncios (banners, intersticiales, rewarded, nativos)
- Mediar entre múltiples redes publicitarias
- Métricas de monetización (eCPM, fill rate, impresiones)
- Integración con GA4 para ver impacto en retención

**Ideal para:**
- Apps free-to-use que monetizan con publicidad
- Complemento de otros ingresos (IAPs, suscripciones, afiliados)

**Costos:**
- Gratis como plataforma
- Compartes % de ingresos publicitarios (típicamente 70/30 o 80/20 según red)

---

### 3. Sentry

**¿Qué es?**
Plataforma de monitoreo de errores y performance en tiempo real.

**Para qué sirve:**
- Captura y triage de crashes/errores
- Stack traces completos
- Performance monitoring (latencia de APIs, frames per second)
- Session replay (web)
- Release tracking y alertas

**Ideal para:**
- Equipos que necesitan visibilidad de bugs en producción
- Apps que priorizan estabilidad
- Debugging de issues reportados por usuarios

**Costos:**
- **Developer** (gratis): 5K errores/mes, 1 usuario, 1 proyecto
- **Team** ($26/mes): 50K errores/mes, performance básico, 5 usuarios
- **Business** ($80/mes): 100K errores/mes, performance completo, usuarios ilimitados
- **Enterprise** (custom): volúmenes masivos, SLAs

---

### 4. PostHog

**¿Qué es?**
Plataforma de product analytics open-source. Alternativa a Mixpanel/Amplitude con opción de self-hosting.

**Para qué sirve:**
- **Product analytics**: funnels, retención, cohortes, paths
- **Session recording**: grabaciones de sesiones de usuarios
- **Feature flags**: A/B testing y feature rollouts progresivos
- **Experimentation**: tests A/B nativos
- **Heatmaps** (web): mapas de calor de clics
- **SQL direct**: queries personalizados

**Ideal para:**
- Equipos orientados a producto que necesitan insights profundos
- Proyectos que valoran privacidad y control de datos (self-host)
- Necesidad de feature flags + analytics en un solo lugar

**Costos (Cloud):**
- **Free**: 1M eventos/mes, 5K recordings/mes, feature flags ilimitadas
- **Paid**: $0.00031/evento después de 1M (≈$31 por cada 100M eventos adicionales)
- **Enterprise**: SLAs, soporte dedicado, single tenancy

**Costos (Self-hosted):**
- Gratis el software
- Infra: $50-500+/mes según escala (Postgres, ClickHouse, Redis)

---

### 5. Mixpanel

**¿Qué es?**
Plataforma líder de product analytics. Enfoque en funnels, retención y cohortes.

**Para qué sirve:**
- **Advanced funnels**: conversión multi-step con análisis de drop-off
- **Retention analysis**: tablas de retención día/semana/mes
- **Cohort analysis**: segmentación avanzada de usuarios
- **Flow visualization**: cómo navegan los usuarios
- **A/B testing** (add-on): experimentación integrada
- **Notificaciones push/email**: engage usuarios desde Mixpanel

**Ideal para:**
- Product teams que viven en datos
- Apps con funnels de conversión complejos
- Necesidad de entender "por qué" bajan métricas

**Costos:**
- **Free**: 20M eventos/mes (sin límite de usuarios)
- **Growth** ($20/mes base): 100M eventos anuales incluidos → ~$0.20 per 1K eventos extra
- **Enterprise** (custom): volúmenes masivos, soporte, SLAs

**Nota:** Pricing puede variar; contactar ventas para estimaciones precisas.

---

### 6. Amplitude

**¿Qué es?**
Competidor directo de Mixpanel. Enfoque en behavioral analytics y predicción.

**Para qué sirve:**
- Todo lo de Mixpanel (funnels, retención, cohortes)
- **Behavioral cohorts**: segmentos predictivos con ML
- **Journeys**: mapas completos de user journeys
- **Recommend**: recomendaciones de qué métricas trackear
- **Experimentation** (add-on): A/B testing robusto

**Ideal para:**
- Equipos enterprise con necesidades analíticas complejas
- Apps con muchísimos eventos y propiedades
- Necesidad de ML/predicción en segmentación

**Costos:**
- **Starter** (gratis): 10M eventos/mes (nuevos clientes, límites)
- **Plus** ($49/mes base): 100M eventos anuales incluidos
- **Growth/Enterprise** (custom): pricing por volumen y features

**Nota:** Amplitude históricamente más caro que Mixpanel.

---

### 7. Segment / RudderStack (Customer Data Platforms)

**¿Qué son?**
CDPs que centralizan eventos y los envían a múltiples destinos (analytics, marketing, warehouses).

**Para qué sirven:**
- Single SDK → múltiples destinos (GA, Mixpanel, Amplitude, Braze, etc.)
- Transformación de eventos en tránsito
- Deduplicación y enriquecimiento
- Warehouse sync (Snowflake, BigQuery, Redshift)
- Cumplimiento de privacidad centralizado

**Ideal para:**
- Apps con stack complejo de herramientas
- Necesidad de cambiar herramientas sin redeployar
- Data engineers que quieren datos en warehouse

**Costos:**

**Segment:**
- **Free**: 1K MTUs (Monthly Tracked Users)
- **Team** ($120/mes): 10K MTUs → $0.012/MTU adicional
- **Business** (custom): volúmenes altos, features enterprise

**RudderStack (open-source + cloud):**
- **Cloud Free**: 500K eventos/mes
- **Cloud Pro** ($750/mes): 10M eventos/mes, $0.10 por 1K eventos extra
- **Self-hosted**: gratis, costos de infra

**Nota:** Los CDPs añaden complejidad y costo; solo justificables si tienes 5+ herramientas.

---

### 8. Mobile Measurement Partners (MMPs): Adjust, AppsFlyer, Branch

**¿Qué son?**
Plataformas especializadas en atribución de instalaciones y campañas de UA (User Acquisition).

**Para qué sirven:**
- **Atribución multi-touch**: qué campaña/fuente trajo cada instalación
- **Deep linking**: URLs que abren la app en contexto específico
- **Fraud prevention**: detección de installs fraudulentos
- **SKAdNetwork (iOS)**: atribución post-ATT
- **Cohort LTV**: lifetime value por campaña/cohorte
- **Integración con ad networks**: Facebook, TikTok, Google, Unity, etc.

**Ideal para:**
- Apps con presupuesto significativo de UA (>$10K/mes)
- Necesidad de optimizar ROAS por canal
- Attribution en ecosistema post-iOS 14.5 (ATT)

**Costos (estimados, varían mucho):**

**AppsFlyer:**
- **Free**: hasta 10K atribuciones orgánicas/mes (sin campañas pagadas)
- **Essentials** (~$0.06 - $0.10 per atribución non-organic)
- Mínimos típicos: $500-1,500/mes para apps pequeñas con UA modesto
- Enterprise: $3K-10K+/mes para apps con millones de installs

**Adjust:**
- Similares a AppsFlyer, con paquetes desde ~$1K/mes

**Branch:**
- Enfoque en deep linking; free tier más generoso
- Paid tiers desde ~$200-500/mes para features de atribución completos

**Nota:** MMPs solo tienen sentido si estás corriendo campañas de UA pagadas fuera del ecosistema Google Ads (que ya atribuye vía Firebase).

---

### 9. Plausible / Umami (Analytics Privacy-First)

**¿Qué son?**
Herramientas ligeras de web analytics enfocadas en privacidad (sin cookies, GDPR-friendly).

**Para qué sirven:**
- Pageviews, visitantes únicos, fuentes de tráfico
- Eventos simples
- Dashboards limpios y rápidos
- Sin cookies ni tracking invasivo

**Ideal para:**
- Sitios web (no apps móviles nativas)
- Proyectos que priorizan privacidad sobre funcionalidad
- Alternativa a GA4 sin complejidad

**Limitaciones para Goveling:**
- **No diseñados para React Native** (son para web)
- Falta de funnels, cohortes, retention
- Sin integración con ad networks

**Costos:**
- **Plausible**: desde $9/mes (10K pageviews/mes)
- **Umami**: self-hosted gratis, cloud desde $9/mes

**Veredicto:** No recomendados para tu caso (RN + ads).

---

## 📊 Comparativa Detallada

### Tabla Comparativa de Características

| Característica | Firebase Analytics | PostHog | Mixpanel | Amplitude | Segment | MMP (AppsFlyer) | Sentry |
|----------------|-------------------|---------|----------|-----------|---------|-----------------|--------|
| **Eventos ilimitados (free tier)** | ✅ Sí | ⚠️ 1M/mes | ⚠️ 20M/mes | ⚠️ 10M/mes | ⚠️ 1K MTUs | ❌ No | ⚠️ 5K errores/mes |
| **Funnels avanzados** | ⚠️ Básico | ✅ Sí | ✅ Excelente | ✅ Excelente | ➖ Delega | ⚠️ Básico | ❌ No |
| **Cohort analysis** | ⚠️ Básico | ✅ Sí | ✅ Excelente | ✅ Excelente | ➖ Delega | ✅ Sí (LTV) | ❌ No |
| **Retention curves** | ⚠️ Básico | ✅ Sí | ✅ Excelente | ✅ Excelente | ➖ Delega | ✅ Sí | ❌ No |
| **Session replay** | ❌ No | ✅ Sí | ❌ No | ❌ No | ➖ Vía integraciones | ❌ No | ✅ Sí (web) |
| **Feature flags** | ✅ Remote Config | ✅ Nativo | ❌ No | ❌ No | ➖ Vía integraciones | ❌ No | ❌ No |
| **A/B testing** | ✅ Firebase A/B | ✅ Nativo | ⚠️ Add-on | ⚠️ Add-on | ➖ Vía integraciones | ❌ No | ❌ No |
| **Integración Google Ads** | ✅ Nativa | ❌ No | ⚠️ Vía export | ⚠️ Vía export | ✅ Sí | ✅ Sí | ❌ No |
| **Integración AdMob** | ✅ Nativa | ❌ No | ❌ No | ❌ No | ❌ No | ⚠️ Parcial | ❌ No |
| **Atribución de campañas** | ✅ Básica | ⚠️ Básica | ⚠️ Básica | ⚠️ Básica | ➖ Delega | ✅ Excelente | ❌ No |
| **Deep linking** | ✅ Dynamic Links | ❌ No | ❌ No | ❌ No | ➖ Delega | ✅ Excelente | ❌ No |
| **Error tracking** | ✅ Crashlytics | ❌ No | ❌ No | ❌ No | ➖ Delega | ❌ No | ✅ Excelente |
| **Performance monitoring** | ✅ Sí | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Excelente |
| **SQL queries directo** | ⚠️ Vía BigQuery | ✅ Sí | ⚠️ Limitado | ⚠️ Limitado | ➖ Warehouse | ❌ No | ❌ No |
| **Self-hosting** | ❌ No | ✅ Sí | ❌ No | ❌ No | ⚠️ RudderStack | ❌ No | ⚠️ Limitado |
| **GDPR/Compliance** | ✅ Sí | ✅ Excelente | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **React Native SDK** | ✅ Oficial | ✅ Community | ✅ Oficial | ✅ Oficial | ✅ Oficial | ✅ Oficial | ✅ Oficial |
| **Learning curve** | ⚠️ Media | ⚠️ Media | ✅ Baja | ⚠️ Media-Alta | ⚠️ Media | ⚠️ Media-Alta | ✅ Baja |
| **Soporte** | ⚠️ Community | ✅ Bueno | ✅ Excelente | ✅ Excelente | ✅ Bueno | ✅ Excelente | ✅ Excelente |

**Leyenda:**
- ✅ Excelente/Completo
- ⚠️ Parcial/Básico/Con limitaciones
- ❌ No disponible
- ➖ No aplica directamente (delega a integraciones)

---

### Tabla Comparativa de Casos de Uso

| Necesidad | Mejor Opción | Alternativas |
|-----------|--------------|--------------|
| **Integración con AdMob/Google Ads** | Firebase Analytics | - |
| **Analytics básico gratis ilimitado** | Firebase Analytics | PostHog (1M eventos) |
| **Funnels y retención avanzados** | Mixpanel | Amplitude, PostHog |
| **A/B testing + feature flags** | PostHog | Firebase (Remote Config + A/B) |
| **Session replay** | PostHog | Sentry (web), LogRocket |
| **Error tracking y crashes** | Sentry | Firebase Crashlytics |
| **Atribución multi-canal de UA** | AppsFlyer | Adjust, Branch |
| **Deep linking avanzado** | Branch | AppsFlyer, Firebase Dynamic Links |
| **Privacy-first / self-hosting** | PostHog | RudderStack (CDP) |
| **CDP para múltiples herramientas** | Segment | RudderStack |
| **Analítica predictiva con ML** | Amplitude | - |
| **Todo en uno (budget bajo)** | Firebase + PostHog | - |

---

## 💰 Análisis de Costos por Escala

### Asunciones para Proyecciones

**Definiciones:**
- **MAU** (Monthly Active Users): usuarios únicos que abren la app al menos una vez al mes
- **Eventos/usuario/mes**: promedio de acciones trackeadas por usuario
- **Total eventos/mes**: MAU × eventos/usuario/mes

**Para Goveling (asumimos app de viajes):**
- Usuarios activos generan **40-80 eventos/mes** (viajes, lugares guardados, fotos, notificaciones, etc.)
- Usuarios muy activos pueden llegar a **200+ eventos/mes** (Travel Mode activo, muchos lugares)
- Para cálculos conservadores: **60 eventos/usuario/mes en promedio**

---

### Escenario 1: Lanzamiento / MVP (0-5K MAU)

**Perfil:**
- 1K-5K MAU
- 60K-300K eventos/mes
- Sin presupuesto significativo
- Enfoque en product-market fit

**Stack Recomendado:** Firebase Analytics + AdMob + Sentry Developer (free)

| Herramienta | Plan | Costo Mensual |
|-------------|------|---------------|
| Firebase Analytics | Free | $0 |
| AdMob | Free (revenue share) | $0 |
| Crashlytics | Incluido en Firebase | $0 |
| Sentry Developer | 5K errores/mes | $0 |
| **TOTAL** | | **$0/mes** |

**Opcional si necesitas funnels avanzados:**
- PostHog Cloud Free (1M eventos): $0 (suficiente para 5K MAU × 200 eventos = 1M)

**Alternativa si prefieres producto desde día 1:**
- Mixpanel Free (20M eventos): $0 (muy suficiente)

---

### Escenario 2: Early Growth (5K-25K MAU)

**Perfil:**
- 5K-25K MAU
- 300K-1.5M eventos/mes
- Presupuesto limitado ($100-500/mes)
- Necesitas empezar a optimizar producto

**Stack Recomendado:** Firebase + AdMob + Sentry Team + PostHog/Mixpanel

| Herramienta | Plan | Costo Mensual |
|-------------|------|---------------|
| Firebase Analytics | Free | $0 |
| AdMob | Free (revenue share) | $0 |
| Sentry Team | 50K errores/mes | $26 |
| PostHog Cloud | ~1.5M eventos | $0 (dentro de free tier) |
| **TOTAL** | | **$26/mes** |

**Alternativa con Mixpanel:**
- Mixpanel Free (20M eventos): $0 (muy suficiente)
- Total: $26/mes

**Opcional si empiezas UA pagada modesta:**
- Branch free tier para deep linking: $0
- Cuando gastes >$5K/mes en UA, considera MMP

---

### Escenario 3: Growth (25K-100K MAU)

**Perfil:**
- 25K-100K MAU
- 1.5M-6M eventos/mes
- Presupuesto mid-tier ($500-2K/mes)
- UA pagada activa (~$10-30K/mes)
- Equipo de producto dedicado

**Stack Recomendado:** Firebase + AdMob + Sentry Business + PostHog Paid + Branch/AppsFlyer Starter

| Herramienta | Plan | Costo Mensual |
|-------------|------|---------------|
| Firebase Analytics | Free (o BigQuery export ~$50) | $0-50 |
| AdMob | Revenue share | $0 |
| Sentry Business | 100K errores/mes, performance | $80 |
| PostHog Cloud | 6M eventos (~$0.31 × 5M sobre free tier) | ~$155 |
| Branch Startup | Deep linking + atribución básica | $200-500 |
| **TOTAL** | | **$435-785/mes** |

**Alternativa con Mixpanel Growth:**
- Mixpanel Growth: ~$240/mes (100M eventos anuales ≈ 8.3M/mes)
- Total sin MMP: $370/mes
- Con Branch: $570-870/mes

**Alternativa con AppsFlyer (si UA es agresiva):**
- AppsFlyer Essentials: ~$800-1,500/mes (depende de non-organic installs)
- Total: ~$1,200-2,000/mes

---

### Escenario 4: Scale (100K-500K MAU)

**Perfil:**
- 100K-500K MAU
- 6M-30M eventos/mes
- Presupuesto enterprise ($2K-10K/mes)
- UA agresiva ($50K-200K/mes)
- Múltiples canales (Google, Meta, TikTok, ASA)

**Stack Recomendado:** Firebase + AdMob + Sentry Business + Amplitude/Mixpanel + AppsFlyer

| Herramienta | Plan | Costo Mensual |
|-------------|------|---------------|
| Firebase Analytics | Free + BigQuery export | $100-300 |
| AdMob | Revenue share | $0 |
| Sentry Business+ | Volumen alto | $300-500 |
| Amplitude Growth | ~360M eventos anuales (30M/mes) | ~$800-1,500 (negociado) |
| AppsFlyer Growth | 100K-500K MAU, UA multi-canal | $2,000-5,000 |
| **TOTAL** | | **$3,200-7,300/mes** |

**Alternativa con Mixpanel Enterprise:**
- Mixpanel: $1,500-3,000/mes (negociado)
- Total: $3,900-8,800/mes

**Opcional:**
- Segment Business (si necesitas CDP): +$2K-5K/mes
- Data warehouse (Snowflake/BigQuery): +$500-2K/mes

---

### Escenario 5: Enterprise (500K+ MAU)

**Perfil:**
- 500K+ MAU
- 30M+ eventos/mes
- Presupuesto enterprise (>$10K/mes)
- UA masiva ($500K+/mes)
- Equipos de data/analytics/producto grandes

**Stack Recomendado:** Todo custom/enterprise tiers

| Herramienta | Plan | Costo Mensual (estimado) |
|-------------|------|--------------------------|
| Firebase Analytics | Enterprise + BigQuery | $500-1,000 |
| AdMob | Revenue share | $0 |
| Sentry Enterprise | SLA, soporte dedicado | $1,000-3,000 |
| Amplitude Enterprise | Volumen masivo, features completos | $5,000-15,000 |
| AppsFlyer Enterprise | Millones de atribuciones | $5,000-15,000 |
| Segment Business | CDP completo | $5,000-10,000 |
| **TOTAL** | | **$16,500-44,000/mes** |

**Nota:** A esta escala, todo es negociado directamente con vendors. Los números son orientativos.

---

### Resumen Visual de Costos

```
Fase            MAU Range     Eventos/mes    Stack Recomendado                   Costo/mes
──────────────────────────────────────────────────────────────────────────────────────────────
🔬 Pre-Launch   0-500         0-30K          Feedback cualitativo + Crashlytics   $0
🌱 MVP          500-5K        30K-300K       Firebase + Crashlytics (sin ads)     $0
🚀 Early Growth 5K-25K        300K-1.5M      + PostHog/Mixpanel Free + Sentry     $0-26
📈 Growth       25K-100K      1.5M-6M        + Sentry Biz + PostHog Paid + MMP    $435-2K
🏢 Scale        100K-500K     6M-30M         + Amplitude/Mixpanel + AppsFlyer     $3K-10K
🌍 Enterprise   500K+         30M+           Todo enterprise/custom               $15K-50K+
```

---

## 🎯 Recomendaciones por Etapa

### Fase 0: Ideación / Pre-Launch (0-500 usuarios)

**Situación:** App en desarrollo, no está en stores, beta cerrada o sin usuarios reales.

**Objetivo:** Validar concepto y construir MVP sin distracciones de analytics complejos.

#### ❌ El Error Común (Startup Death Pattern)

```
1. Implementar analytics complejo en MVP
2. Pasar 2 semanas configurando 50 eventos
3. Lanzar con dashboards vacíos
4. Obsesionarse con métricas sin significancia estadística
5. Perder foco del producto real
6. Quedarse sin runway antes de validar PMF
```

#### ✅ Lo que SÍ Debes Hacer

**1. Feedback Cualitativo (80% de tu tiempo)**
```
✅ Entrevistas 1-on-1 con 20-30 usuarios potenciales
✅ Prototipos en Figma + pruebas de usabilidad
✅ WhatsApp/Telegram group con 5-10 beta testers
✅ Google Forms para feedback estructurado
✅ Llamadas post-uso (15 min cada una)
```

**Regla de oro:** 10 conversaciones > 10,000 eventos anónimos

**2. Analytics Ultra-Básico (Solo si tienes prototipo funcional)**
```javascript
// SOLO estos 3-5 eventos, nada más:
✅ app_open          // ¿La gente vuelve?
✅ sign_up           // ¿Completan onboarding?
✅ [tu_accion_core]  // Ej: trip_created, place_saved

❌ NO implementes: Funnels, cohortes, eventos complejos, ads
```

**3. Monitoreo de Crashes (Si tienes >5 beta testers)**
```
✅ Firebase Crashlytics (gratis, incluido) 
   O
✅ Sentry Developer Free (5K errores/mes)

Razón: Necesitas saber si la app se rompe
```

#### ❌ Lo que NO Debes Hacer Todavía

```
❌ AdMob: Arruinarás UX antes de validar PMF
❌ Eventos complejos: Perderás tiempo sin datos suficientes
❌ Funnels sofisticados: Sin volumen, es solo ruido
❌ PostHog/Mixpanel: Prematuro para <500 usuarios
❌ MMPs: No hay UA pagada todavía
❌ Dashboards elaborados: Vanity metrics
```

#### Stack Recomendado para Fase 0

**Opción A: Solo Wireframes/Prototipos**
```
Analytics: ❌ NINGUNO
Enfoque: ✅ Entrevistas + Validación de concepto
```

**Opción B: Prototipo Funcional (5-50 beta testers)**
```
✅ Firebase Analytics básico (3-5 eventos)
✅ Crashlytics (incluido)
✅ WhatsApp group para feedback
❌ Skip: Todo lo demás
```

**Opción C: Beta Privada (50-500 usuarios)**
```
✅ Firebase Analytics (~10 eventos core)
✅ Crashlytics
✅ Sentry Developer Free
⚠️ (Considerar) Mixpanel Free para 1-2 funnels críticos:
   - Sign up → Primer viaje creado
   - App open → Acción core completada
❌ Skip: AdMob, MMPs, herramientas pagas
```

#### Métricas que Importan en Fase 0

**No son:**
- ❌ Total de eventos disparados
- ❌ Dashboards complejos
- ❌ Funnels con 10 steps

**Son:**
```
✅ ¿Cuántos de tus 10 amigos siguen usando la app después de 1 semana?
✅ ¿Qué dice la gente en llamadas 1-on-1?
✅ ¿Completan la acción core sin confusión?
✅ ¿Se crashea? (Crashlytics)
✅ ¿Vuelven al día siguiente? (retention básica)
```

#### Cuándo Pasar a la Siguiente Fase

**Señales para graduar a Fase 1 (MVP en Stores):**
```
✅ 20+ beta testers usando consistentemente (>3x/semana)
✅ Retention D1 >30%, D7 >15%
✅ Feedback cualitativo es mayormente positivo
✅ La acción core funciona sin bugs críticos
✅ Entiendes qué hace que la gente retenga
✅ Listo para lanzar en App Store / Play Store
```

**Costo total Fase 0:** $0/mes

---

### Fase 1: Lanzamiento Público / MVP (500-5K MAU)

**Situación:** App publicada en App Store / Play Store, primeros usuarios orgánicos llegando.

**Objetivo:** Validar product-market fit y optimizar onboarding. Costo: $0.

**Stack:**
```
✅ Firebase Analytics (setup completo, ~15-20 eventos)
✅ Firebase Crashlytics (incluido)
✅ Sentry Developer Free (5K errores/mes) - mejor UX que Crashlytics
⚠️ (Considerar) AdMob con banners MUY conservadores
   - Solo si monetización es crítica desde día 1
   - Evaluar impacto en retención después de 2 semanas
   - Mejor: Esperar hasta tener 2K+ MAU y retention D7 >20%
⏭️ Skip: PostHog/Mixpanel (añadir cuando tengas >2K MAU)
⏭️ Skip: MMPs (no hay UA pagada todavía)
```

**Eventos clave a trackear (Tier 1 - Core):**
```javascript
// Autenticación (automático en Firebase)
- sign_up, login

// Core loop
- trip_created
- place_saved
- place_visit_detected
- travel_mode_start
- ai_route_generated

// Engagement
- app_open
- screen_view (automático)

// Monetización básica
- booking_click (si tienes widgets de reserva)
```

**Métricas críticas a monitorear:**
```
✅ DAU, MAU, DAU/MAU ratio
✅ Retention D1, D7, D30
✅ Tiempo en completar onboarding
✅ % usuarios que crean primer viaje
✅ Crashes por sesión
```

**Por qué este stack:**
- Suficiente para entender adopción y retención básica
- Gratis pero robusto
- No distrae del producto
- Firebase + Sentry cubren el 90% de necesidades

---

### Fase 2: Launch / Early Traction (1K-10K MAU)

**Objetivo:** Entender comportamiento de usuarios y optimizar onboarding.

**Stack:**
```
✅ Firebase Analytics (base)
✅ AdMob (activar con banners conservadores)
✅ Sentry Developer Free (5K errores/mes)
✅ PostHog Cloud Free o Mixpanel Free (para funnels)
⏭️ Skip: MMP (aún no necesitas atribución multi-canal)
```

**Eventos adicionales:**
- Onboarding: `welcome_screen_view`, `tutorial_complete`
- Core loop: `ai_route_generated`, `place_visit_detected`, `travel_mode_start`
- Monetización: `ad_impression`, `booking_click`
- Social: `invite_sent`, `instatrip_upload`

**Funnels clave en PostHog/Mixpanel:**
1. Sign up → Primer viaje creado → Viaje completado
2. App open → Explorar lugares → Guardar lugar → Agregar a viaje
3. Travel Mode start → Place visit → Photo upload
4. Ad impression → Ad click

**Por qué:**
- Ya tienes suficiente volumen para que los funnels sean significativos
- Necesitas optimizar retención y engagement
- Aún gratis si usas PostHog (<1M eventos) o Mixpanel (<20M eventos)

---

### Fase 3: Growth / Product-Market Fit (10K-50K MAU)

**Objetivo:** Escalar con métricas sanas. Empezar UA pagada si unit economics funcionan.

**Stack:**
```
✅ Firebase Analytics (base + Google Ads conversions)
✅ AdMob (optimizar placements)
✅ Sentry Team ($26/mes - necesitas errores resueltos rápido)
✅ PostHog Paid o Mixpanel Growth (funnels avanzados, cohortes)
⚠️ Considerar: Branch free/starter (si empiezas UA)
⏭️ Skip MMP full: solo si gastas >$20K/mes en UA multi-canal
```

**Eventos de monetización:**
- `booking_started`, `booking_completed`, `booking_revenue` (con valor)
- `esim_click`, `esim_purchase` (afiliados)
- `ad_revenue` (vía AdMob → GA4 automático)
- `subscription_start` (si añades premium)

**Cohortes en PostHog/Mixpanel:**
- Usuarios que completaron onboarding
- Usuarios con >1 viaje
- Usuarios activos en Travel Mode
- Power users (>10 lugares guardados)
- Converters (hicieron booking o suscripción)

**Por qué:**
- Empiezas a tener presupuesto de ingresos (ads + posibles bookings)
- Necesitas entender qué usuarios retienen y por qué
- Cohortes para personalizar notificaciones y features

---

### Fase 4: Scale (50K-200K MAU)

**Objetivo:** Optimizar LTV/CAC. UA multi-canal agresiva. Product analytics como ventaja competitiva.

**Stack:**
```
✅ Firebase Analytics (+ BigQuery export para data warehouse)
✅ AdMob (con mediación de múltiples redes)
✅ Sentry Business ($80+/mes)
✅ Amplitude o Mixpanel Enterprise (negociar contrato anual)
✅ AppsFlyer o Adjust (UA multi-canal: Google, Meta, TikTok, ASA)
⚠️ Considerar: Segment (si integraste >5 herramientas)
```

**Features avanzadas:**
- **Predictive analytics** (Amplitude): identificar usuarios en riesgo de churn
- **Automated cohorts**: segmentos que se actualizan solos
- **Revenue analytics**: LTV por cohorte de adquisición, ARPU por segmento
- **Multi-touch attribution** (MMP): qué canales asisten vs. last-click
- **Deep linking campaigns**: ads que abren app en contexto específico

**Por qué:**
- Escalas requieren eficiencia operativa (data warehouse, BI tools)
- Equipos grandes necesitan self-serve analytics
- ROI de herramientas pagas es claro (saves tiempo, mejora métricas)

---

### Fase 5: Mature / Enterprise (200K+ MAU)

**Objetivo:** Maximizar eficiencia. Data como core competency.

**Stack:**
```
✅ Firebase Analytics (telemetría base)
✅ AdMob + otros ad networks
✅ Sentry Enterprise (SLAs, alertas avanzadas)
✅ Amplitude Enterprise (producto)
✅ AppsFlyer Enterprise (atribución)
✅ Segment Enterprise (CDP)
✅ Data warehouse (BigQuery, Snowflake, Redshift)
✅ BI tools (Looker, Tableau, Mode)
✅ ML platform (para recomendaciones, churn prediction)
```

**Equipo:**
- Data analysts (2-5)
- Analytics engineers (1-3)
- Data scientists (1-2)
- Product analysts embedded en equipos

**Por qué:**
- Data es ventaja competitiva
- Equipos grandes necesitan infraestructura robusta
- Custom solutions rentables vs. pagar por SaaS caro

---

## ⏰ Cuándo Implementar Firebase Analytics + Crashlytics

### Pregunta Clave: ¿Cuál es el momento ideal para empezar?

**Respuesta corta:**
- **Crashlytics:** Cuando tengas 5+ personas probando la app (beta testers reales)
- **Analytics:** Cuando tengas un flujo funcional completo (sign up → acción core → retención medible)

---

### 📍 Timeline Detallado por Etapa

#### 🔴 Etapa 0: NO LO HAGAS (Demasiado Temprano)

**Momento:** Wireframes, mockups, prototipos de diseño en Figma

**Situación:**
```
❌ NO implementes nada de analytics/crashlytics
✅ Enfócate en: Validar concepto, entrevistas, prototipos clickeables
```

**Por qué:** No hay código que crashee ni eventos que medir. Es distracción pura.

**Tiempo ahorrado:** 8-16 horas que puedes usar en validación de concepto.

---

#### 🟡 Etapa 1: CRASHLYTICS SOLO (Momento Óptimo)

**Momento:** Primer prototipo funcional que das a 5-10 amigos/familia

**Señales para implementar:**
- ✅ La app abre y tiene 1-2 flujos básicos funcionando
- ✅ Tienes 5-10 personas que la van a probar activamente
- ✅ Sabes que habrá bugs (¡obvio, es un prototipo!)
- ✅ Necesitas saber CUÁNDO y DÓNDE se rompe

**Setup recomendado:**
```bash
# Solo Crashlytics (5 minutos de instalación)
npm install @react-native-firebase/app
npm install @react-native-firebase/crashlytics

# Configurar Firebase project (10 min)
# - Descargar google-services.json (Android)
# - Descargar GoogleService-Info.plist (iOS)
# - Rebuild app
```

**Eventos a trackear:** NINGUNO todavía, solo crashes

**Esfuerzo:** 15-30 minutos (setup Firebase project + integración básica)

**Beneficio:** Recibes notificaciones cuando la app se rompe, con stack traces completos

**Costo:** $0/mes

---

#### 🟢 Etapa 2: CRASHLYTICS + ANALYTICS BÁSICO (Momento Óptimo)

**Momento:** Beta privada con 20-50 testers reales (no solo amigos)

**Señales para implementar:**
- ✅ Flujo completo funciona: Sign up → Acción core → Usuario puede "completar" algo
- ✅ 20+ personas usando la app activamente (>2-3 veces/semana)
- ✅ Ya no son solo amigos que te hacen el favor, son testers reales
- ✅ Necesitas responder: "¿La gente vuelve?" "¿Completan onboarding?" "¿Usan la feature core?"

**Setup recomendado:**
```bash
# Crashlytics + Analytics (mismo paquete Firebase)
npm install @react-native-firebase/app
npm install @react-native-firebase/crashlytics
npm install @react-native-firebase/analytics
```

**Eventos a trackear (SOLO 3-5):**
```javascript
// Básicos automáticos (no implementas nada)
- first_open (automático)
- session_start (automático)

// Los 3 que TÚ implementas manualmente:
✅ sign_up               // ¿Completan registro?
✅ trip_created          // ¿Usan la feature core?
✅ travel_mode_start     // ¿Activan modo viaje? (feature distintiva de Goveling)

// Ejemplo de implementación:
await analytics().logEvent('trip_created', {
  trip_type: 'beach_vacation',
  has_companions: true
});
```

**Esfuerzo:** 1-2 horas (incluye setup + implementar 3 eventos)

**Beneficio:**
- ✅ Crashes resueltos rápido
- ✅ Sabes si la gente retiene (DAU, sessions)
- ✅ Sabes si completan onboarding
- ✅ Sabes si usan la feature core

**Costo:** $0/mes

**⚠️ Lo que NO debes hacer todavía:**
- ❌ Implementar 20+ eventos (pérdida de tiempo)
- ❌ Crear dashboards complejos (sin volumen es ruido)
- ❌ Añadir PostHog/Mixpanel (prematuro)
- ❌ Activar AdMob (arruinarás UX)

---

#### 🟢 Etapa 3: ANALYTICS COMPLETO (Pre-Launch en Stores)

**Momento:** 1-2 semanas ANTES de lanzar en App Store / Play Store

**Señales para implementar:**
- ✅ App es estable (crash rate <2%)
- ✅ Retention D7 >15% en beta
- ✅ Feedback cualitativo es positivo
- ✅ Listos para lanzar público en 2-4 semanas
- ✅ Necesitas dashboards para reportar a stakeholders

**Setup recomendado:**
```bash
# Full stack fase 1
npm install @react-native-firebase/app
npm install @react-native-firebase/crashlytics
npm install @react-native-firebase/analytics
npm install @sentry/react-native  # Mejor UX que solo Crashlytics
```

**Eventos a trackear (15-20):**
```javascript
// Tier 1: Críticos (del documento principal)
- Autenticación: sign_up, login (automáticos)
- Core loop: trip_created, place_saved, place_visit_detected, travel_mode_start
- Engagement: app_open, screen_view
- Monetización: booking_click, esim_click
- Social: invite_sent, invite_accepted
- Gamificación: level_up, badge_unlocked
```

**Esfuerzo:** 4-8 horas (setup + 15-20 eventos + dashboards básicos)

**Beneficio:**
- ✅ Dashboards listos para el día del launch
- ✅ Puedes iterar basado en datos desde día 1 en stores
- ✅ Reportes para inversores/equipo
- ✅ Funnels básicos configurados

**Costo:** $0-26/mes (si añades Sentry Team)

---

### 🎯 Roadmap Específico para Goveling

#### Si estás en Ideación/Desarrollo Inicial (AHORA):
```
📍 Etapa: Desarrollo inicial, sin usuarios reales
👥 Usuarios: 0 (aún no en stores)
```

**Tu Timeline:**

**Semanas 1-4: Validación de Concepto**
```
✅ Enfoque: Entrevistas, prototipos Figma, feedback directo
❌ Analytics: NINGUNO
❌ Crashlytics: NINGUNO
⏱️ Tiempo invertido en analytics: 0 horas
```

**Semanas 5-8: Prototipo Funcional**
```
✅ Dar app a 5-10 amigos/familia
✅ Implementar: Crashlytics SOLO
❌ Eventos: NINGUNO, solo crashes
⏱️ Tiempo de setup: 30 minutos
📊 Beneficio: Sabes cuando se rompe y dónde
```

**Semanas 9-12: Beta Privada (TestFlight/Internal Testing)**
```
✅ 20-50 beta testers reales
✅ Implementar: Crashlytics + Analytics básico
✅ Eventos: sign_up, trip_created, travel_mode_start (3 eventos)
⏱️ Tiempo de setup: 1-2 horas
📊 Beneficio: Retention básica + crashes resueltos
```

**Semanas 13-14: Pre-Launch (2 semanas antes de stores)**
```
✅ Implementar: Analytics completo (15-20 eventos)
✅ Setup: Dashboards básicos en Firebase Console
✅ Añadir: Sentry para mejor error tracking
⏱️ Tiempo de setup: 4-8 horas
📊 Beneficio: Todo listo para day-1 en stores
```

**Semana 15+: Launch en App Store / Play Store**
```
✅ Todo configurado, solo monitoras dashboards
✅ Iteras basado en datos reales
📊 Dashboards activos: DAU/MAU, Retention, Funnels básicos
```

---

### ⚡ Setup Ultra-Rápido (Si necesitas empezar HOY)

Si ya tienes un prototipo funcional y quieres el mínimo absoluto:

#### Opción Express: Solo Crashlytics (30 minutos)

```bash
# 1. Instalar dependencias (5 min)
npm install @react-native-firebase/app @react-native-firebase/crashlytics

# 2. Crear proyecto Firebase (10 min)
# - Ir a https://console.firebase.google.com
# - Click "Add project" → Seguir wizard
# - Añadir app Android → Descargar google-services.json
# - Añadir app iOS → Descargar GoogleService-Info.plist

# 3. Configurar en tu app (15 min)
# Android: Copiar google-services.json a android/app/
# iOS: Copiar GoogleService-Info.plist a ios/
# Seguir docs: https://rnfirebase.io/crashlytics/usage

# 4. Rebuild app
cd android && ./gradlew clean && cd ..
cd ios && pod install && cd ..
npx react-native run-android  # o run-ios

# ¡Listo! Ya recibes notificaciones de crashes
```

**Resultado:** Empiezas a recibir reportes de crashes con stack traces completos.

**Siguiente paso:** Cuando tengas 20+ testers, añade Analytics básico (3 eventos).

---

### 💡 Reglas de Oro para Decidir

#### ¿Debo implementar Crashlytics HOY?

**Pregúntate:**
- ¿Tienes una app que abre y hace algo funcional? → **SÍ** = Hazlo
- ¿Tienes 5+ personas que la van a usar? → **SÍ** = Hazlo
- ¿Aún estás en Figma/mockups? → **NO** = Espera

#### ¿Debo implementar Analytics HOY?

**Pregúntate:**
- ¿Tienes un flujo completo (sign up → acción → posible retención)? → **SÍ** = Hazlo (básico: 3 eventos)
- ¿Tienes 20+ testers activos (>2x/semana)? → **SÍ** = Hazlo (básico: 3 eventos)
- ¿Vas a lanzar en stores en <4 semanas? → **SÍ** = Hazlo (completo: 15-20 eventos)
- ¿Tienes <10 usuarios o solo pruebas internas? → **NO** = Espera

#### ¿Debo implementar AdMob HOY?

**Pregúntate:**
- ¿Ya estás en stores con >2K MAU? → **SÍ** = Considéralo
- ¿Tu retention D7 es >20%? → **SÍ** = Considéralo
- ¿Aún estás pre-launch o con <1K usuarios? → **NO** = Espera (arruinarás UX)

---

### 📊 Tabla de Decisión Rápida

| Situación | Usuarios | Crashlytics | Analytics | Eventos | AdMob | Tiempo Setup |
|-----------|----------|-------------|-----------|---------|-------|--------------|
| Wireframes/Figma | 0 | ❌ No | ❌ No | 0 | ❌ No | 0h |
| Prototipo funcional | 5-20 (amigos) | ✅ Sí | ❌ No | 0 | ❌ No | 0.5h |
| Beta privada | 20-100 | ✅ Sí | ✅ Básico | 3-5 | ❌ No | 1-2h |
| Pre-launch (2 sem) | 100-500 | ✅ Sí | ✅ Completo | 15-20 | ⚠️ Setup (sin activar) | 4-8h |
| Launch en stores | 500+ | ✅ Sí | ✅ Completo | 15-20 | ⚠️ Considerar | - |
| Growth (>2K MAU) | 2K+ | ✅ Sí | ✅ Completo | 20-30 | ✅ Activar | - |

---

### 🚨 Errores Comunes a Evitar

#### Error #1: Implementar todo desde día 1
```
❌ "Voy a configurar los 50 eventos ahora para no hacerlo después"
✅ Correcto: 3 eventos → luego 15 → luego 30+ (según necesidad)
```

#### Error #2: Analytics sin usuarios
```
❌ "Configuré analytics perfectos pero solo yo uso la app"
✅ Correcto: Espera a tener 20+ testers antes de analytics
```

#### Error #3: Crashlytics demasiado tarde
```
❌ "La gente dice que se crashea pero no sé dónde"
✅ Correcto: Crashlytics desde que 5+ personas prueban
```

#### Error #4: AdMob demasiado temprano
```
❌ "Puse ads en la beta para probar monetización"
✅ Correcto: Espera a tener >2K MAU con retention >20%
```

#### Error #5: Dashboards prematuros
```
❌ "Creé 10 dashboards con métricas para 3 usuarios"
✅ Correcto: Dashboards cuando tengas significancia estadística (>500 MAU)
```

---

### ✅ Checklist de Implementación por Fase

#### Fase 0: Pre-Beta (0-20 usuarios)
```
[ ] ❌ NO implementar nada todavía
[ ] ✅ Enfocarse en feedback cualitativo
[ ] ✅ Validar concepto con entrevistas
```

#### Fase 1: Beta Cerrada (20-100 usuarios)
```
[ ] ✅ Setup Firebase project (Android + iOS)
[ ] ✅ Instalar Crashlytics
[ ] ✅ Verificar que reportes de crashes lleguen
[ ] ✅ Instalar Analytics (básico)
[ ] ✅ Implementar 3 eventos core (sign_up, trip_created, travel_mode_start)
[ ] ✅ Verificar eventos en Firebase Console DebugView
[ ] ❌ NO implementar más de 5 eventos todavía
```

#### Fase 2: Pre-Launch (100-500 usuarios)
```
[ ] ✅ Analytics completo: 15-20 eventos (Tier 1)
[ ] ✅ Añadir Sentry (mejor que solo Crashlytics)
[ ] ✅ Configurar dashboards básicos en Firebase
[ ] ✅ Setup AdMob (sin activar ads todavía)
[ ] ✅ Implementar UMP SDK + ATT (consent)
[ ] ✅ Probar todo en staging antes de launch
```

#### Fase 3: Launch en Stores (500+ usuarios)
```
[ ] ✅ Monitorear dashboards día 1
[ ] ✅ Tener alertas configuradas (crash rate, retention)
[ ] ⚠️ Considerar activar AdMob (después de validar retention)
[ ] ⚠️ Considerar añadir Mixpanel Free (funnels avanzados)
```

---

### 🎓 Recursos para Setup

**Documentación oficial:**
- Firebase Crashlytics RN: https://rnfirebase.io/crashlytics/usage
- Firebase Analytics RN: https://rnfirebase.io/analytics/usage
- Sentry React Native: https://docs.sentry.io/platforms/react-native/
- AdMob RN: https://docs.page/invertase/react-native-google-mobile-ads

**Tiempo estimado total:**
- Setup básico (Crashlytics): 30 minutos
- Setup intermedio (+ Analytics básico): 1-2 horas
- Setup completo (+ 15-20 eventos + Sentry): 4-8 horas

---

## 🏗️ Implementación Recomendada para Goveling

### Stack Inicial (0-10K MAU) - Costo: $0-26/mes

#### Herramientas Core

1. **Firebase Analytics** (React Native)
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/analytics
   ```

2. **AdMob** (React Native)
   ```bash
   npm install react-native-google-mobile-ads
   ```

3. **Crashlytics** (incluido en Firebase)
   ```bash
   npm install @react-native-firebase/crashlytics
   ```

4. **Sentry** (errores + performance)
   ```bash
   npm install @sentry/react-native
   ```

5. **Consent Management** (UMP SDK para Android, ATT para iOS)
   ```bash
   npm install react-native-tracking-transparency
   # UMP incluido en react-native-google-mobile-ads
   ```

#### Herramientas Opcionales (añadir cuando escales)

6. **PostHog** (funnels/cohortes)
   ```bash
   npm install posthog-react-native
   ```
   **O alternativamente:**

7. **Mixpanel** (funnels/cohortes)
   ```bash
   npm install mixpanel-react-native
   ```

---

### Eventos Clave a Implementar (Priorizado)

#### Tier 1: Críticos (implementar desde día 1)

**Autenticación:**
```javascript
// Firebase Analytics auto-trackea sign_up y login
// Sentry: setUser() para asociar errores a usuarios
```

**Core Loop:**
```javascript
analytics().logEvent('trip_created', {
  trip_type: 'beach_vacation',
  destinations_count: 3,
  duration_days: 7,
  trip_mode: 'group'
});

analytics().logEvent('place_saved', {
  place_category: 'restaurant',
  source: 'ai_recommendation'
});

analytics().logEvent('travel_mode_start', {
  trip_id: 'xxx',
  has_companions: true
});

analytics().logEvent('place_visit_detected', {
  place_id: 'xxx',
  distance_m: 50,
  visit_confirmed: true
});
```

**Monetización Básica:**
```javascript
// AdMob auto-reporta ad_impression a GA4
// Solo añade eventos de intención:
analytics().logEvent('booking_click', {
  booking_type: 'flight', // hotel, tour, transport, esim
  destination: 'Paris',
  provider: 'trip_com'
});
```

#### Tier 2: Importante (añadir en Growth)

**Features Sociales:**
```javascript
analytics().logEvent('invite_sent', {
  trip_id: 'xxx',
  invite_count: 3
});

analytics().logEvent('invite_accepted', {
  trip_id: 'xxx',
  role: 'traveler'
});

analytics().logEvent('instatrip_upload', {
  trip_id: 'xxx',
  has_location: true
});
```

**Gamificación:**
```javascript
analytics().logEvent('level_up', {
  old_level: 5,
  new_level: 6,
  xp_total: 10500
});

analytics().logEvent('badge_unlocked', {
  badge_id: 'foodie',
  badge_rarity: 'rare'
});
```

**Producto Avanzado:**
```javascript
analytics().logEvent('ai_route_generated', {
  destinations_count: 5,
  days: 7,
  optimization_mode: 'balanced'
});

analytics().logEvent('expense_added', {
  trip_id: 'xxx',
  amount: 50,
  currency: 'USD',
  split_with: 3
});
```

#### Tier 3: Nice-to-have (añadir cuando tengas bandwidth)

**Engagement:**
```javascript
analytics().logEvent('review_written', {
  place_id: 'xxx',
  rating: 5,
  has_photo: true
});

analytics().logEvent('photo_uploaded', {
  trip_id: 'xxx',
  source: 'camera', // vs gallery
  added_to_photobook: false
});

analytics().logEvent('notification_received', {
  notification_type: 'place_nearby',
  distance_km: 2
});
```

---

### Funnels Clave a Configurar (PostHog/Mixpanel)

#### Funnel 1: Activación (Critical)
```
1. Sign up
2. Profile completed
3. First trip created
4. First place saved
5. Travel Mode activated (first time)
```
**Meta:** >40% llegan a step 5 dentro de 7 días

#### Funnel 2: Engagement (Core Loop)
```
1. App open
2. Explore section viewed
3. Place details viewed
4. Place saved
5. Place added to trip
```
**Meta:** >25% completan funnel por sesión

#### Funnel 3: Monetización (Revenue)
```
1. Booking section viewed
2. Booking widget opened (flight/hotel)
3. Booking click (external)
4. (Future) Booking completed + revenue
```
**Meta:** >5% CTR en step 3

#### Funnel 4: Viral Loop (Growth)
```
1. Trip created (group mode)
2. Invite modal opened
3. Invites sent
4. Invites accepted
```
**Meta:** >30% envían invites, >50% aceptación

#### Funnel 5: Retention (Travel Mode)
```
1. Travel Mode started
2. First place notification received
3. Place visit confirmed
4. Photo uploaded
5. Return to app next day
```
**Meta:** >60% vuelven día siguiente si completaron steps 1-4

---

### Cohortes a Crear (PostHog/Mixpanel)

1. **Activated users**: Completaron onboarding + crearon primer viaje
2. **Power users**: >3 viajes creados O >20 lugares guardados
3. **Travel Mode users**: Activaron Travel Mode al menos 1 vez
4. **Social users**: Invitaron a >1 persona O están en trip grupal
5. **Converters**: Hicieron clic en booking O generaron revenue
6. **At-risk**: Activados pero no abrieron app en 7 días
7. **Churned**: No abrieron app en 30 días (después de estar activados)

**Usa estos cohortes para:**
- Notificaciones push personalizadas
- Tests A/B segmentados
- Análisis de retención por segmento
- Identificar qué features retienen más

---

### Dashboards Recomendados

#### Dashboard 1: Executive (diario)
- MAU, DAU, DAU/MAU ratio
- New signups (día/semana/mes)
- Retention D1, D7, D30
- Ad revenue (si AdMob activo)
- Booking clicks + conversiones

#### Dashboard 2: Product (diario)
- Activation rate (signups → activated)
- Core loop completion (funnel 2)
- Travel Mode adoption
- Lugares guardados per user
- Viajes creados per user
- Time to first trip (desde signup)

#### Dashboard 3: Engagement (semanal)
- Session length promedio
- Sessions per user per week
- Eventos per session
- Feature adoption (% usuarios que usaron cada feature)
- Cohortes activos vs. at-risk vs. churned

#### Dashboard 4: Monetization (semanal)
- Ad impressions, CTR, eCPM
- Booking clicks por tipo (flight/hotel/tour/esim)
- Conversion rate (click → completado, cuando trackees revenue)
- Revenue per user (ARPU), Revenue per paying user (ARPPU)

#### Dashboard 5: Growth (semanal)
- Invites enviadas
- Invite acceptance rate
- Virality (K-factor aproximado)
- Organic vs. paid installs (con MMP)
- Costo por install, LTV/CAC

---

### Timeline de Implementación

#### Semana 1-2: Setup Base
- [ ] Configurar Firebase project (iOS + Android)
- [ ] Integrar Firebase Analytics SDK
- [ ] Integrar Crashlytics
- [ ] Configurar AdMob (sin mostrar ads aún)
- [ ] Implementar Tier 1 eventos (10 eventos core)
- [ ] Setup Sentry para errores
- [ ] Implementar consent management (UMP + ATT)

#### Semana 3-4: Eventos Avanzados
- [ ] Añadir Tier 2 eventos (15+ eventos)
- [ ] Configurar conversiones en Firebase → Google Ads
- [ ] Setup PostHog/Mixpanel (elegir uno)
- [ ] Configurar los 5 funnels clave
- [ ] Crear 7 cohortes base

#### Semana 5-6: Dashboards y Testing
- [ ] Crear dashboards en PostHog/Mixpanel
- [ ] Validar eventos en producción (cohort pequeño)
- [ ] Documentar eventos para el equipo
- [ ] Activar AdMob (banners conservadores)
- [ ] Monitorear impacto en retención

#### Mes 2+: Optimización
- [ ] Añadir Tier 3 eventos según necesidad
- [ ] Iterar en funnels basado en data
- [ ] Setup alertas para métricas críticas
- [ ] Comenzar A/B tests de features
- [ ] (Si escalas) Añadir Branch/MMP cuando empieces UA

---

## 📋 Checklist de Decisión

### ¿Qué herramienta elegir? Responde estas preguntas:

#### Firebase Analytics - ¿Lo necesito?
- [ ] ¿Usas Google Ads o AdMob? → **SÍ obligatorio**
- [ ] ¿Presupuesto limitado (<$1K/mes)? → **SÍ, es gratis**
- [ ] ¿React Native? → **SÍ, SDK oficial**
- [ ] ¿Te importa más simplicidad que funnels avanzados? → **SÍ**

**Decisión:** ✅ **SIEMPRE incluir Firebase Analytics en stack de RN + ads**

---

#### PostHog vs. Mixpanel vs. Amplitude - ¿Cuál elegir?

**Elige PostHog si:**
- [ ] Quieres todo-en-uno (analytics + feature flags + A/B testing)
- [ ] Valoras self-hosting / privacidad
- [ ] Presupuesto limitado pero necesitas funnels (<100K MAU)
- [ ] Equipo técnico que puede aprovechar SQL directo

**Elige Mixpanel si:**
- [ ] Funnels y retención son tu prioridad #1
- [ ] Quieres UI más intuitiva que PostHog
- [ ] Free tier generoso (20M eventos suficiente para 50K+ MAU)
- [ ] Equipo de producto no-técnico necesita self-serve

**Elige Amplitude si:**
- [ ] Presupuesto >$1K/mes
- [ ] Necesitas predictive analytics con ML
- [ ] Behavioral cohorts automáticos son críticos
- [ ] Equipo grande (5+ PMs) necesita analytics avanzados

**Decisión para Goveling:**
- **0-10K MAU:** PostHog Free o Mixpanel Free (ambos suficientes, preferir Mixpanel por UI)
- **10K-100K MAU:** PostHog Paid (mejor pricing) o Mixpanel Growth
- **100K+ MAU:** Amplitude (features enterprise justifican el costo)

---

#### MMP (AppsFlyer/Adjust/Branch) - ¿Lo necesito?

**SÍ necesitas MMP si:**
- [ ] Gastas >$20K/mes en UA pagada
- [ ] Corres campañas en múltiples canales (Google + Meta + TikTok + ASA)
- [ ] Necesitas optimizar ROAS por canal
- [ ] Deep linking es crítico para tu growth loop
- [ ] Necesitas detectar fraude en installs

**NO necesitas MMP si:**
- [ ] Solo usas Google Ads (Firebase atribuye bien)
- [ ] Aún en fase orgánica (pre-PMF)
- [ ] Presupuesto UA <$10K/mes
- [ ] Crecimiento principalmente viral/orgánico

**Decisión para Goveling:**
- **Pre-UA:** Skip MMP, usa Firebase + Branch free (deep linking)
- **UA modesta ($10-50K/mes):** Branch Startup ($200-500/mes)
- **UA agresiva ($50K+/mes):** AppsFlyer o Adjust ($1K-5K/mes)

---

#### Segment/RudderStack (CDP) - ¿Lo necesito?

**SÍ necesitas CDP si:**
- [ ] Usas 5+ herramientas de marketing/analytics
- [ ] Cambias de herramientas frecuentemente
- [ ] Tienes data engineers que quieren warehouse central
- [ ] Compliance/privacidad requiere control granular de data

**NO necesitas CDP si:**
- [ ] Usas solo 2-3 herramientas (Firebase + PostHog + Sentry)
- [ ] Presupuesto <$5K/mes para analytics
- [ ] Equipo pequeño (<10 personas)

**Decisión para Goveling:**
- **0-100K MAU:** Skip CDP (añade complejidad sin valor claro)
- **100K+ MAU:** Considerar si tienes >5 herramientas

---

## 🎯 Decisión Final Recomendada para Goveling

### Stack por Fase

#### Fase 0: Pre-Launch / Ideación → 500 usuarios (Costo: $0/mes)
```
🚨 IMPORTANTE: Si estás aquí, NO implementes analytics complejo todavía

Core:
✅ Feedback cualitativo (entrevistas, WhatsApp groups, llamadas)
✅ Firebase Crashlytics (solo si tienes beta testers)

Opcional (solo si tienes prototipo funcional):
✅ Firebase Analytics ultra-básico (3-5 eventos: app_open, sign_up, trip_created)

Lo que NO debes hacer:
❌ AdMob (arruinarás UX sin validar PMF)
❌ Eventos complejos (pérdida de tiempo)
❌ PostHog/Mixpanel (prematuro)
❌ Funnels/dashboards elaborados (vanity metrics)
```

#### Fase 1: MVP en Stores → 5K MAU (Costo: $0/mes)
```
Core:
✅ Firebase Analytics (setup completo, 15-20 eventos)
✅ Firebase Crashlytics
✅ Sentry Developer Free
✅ UMP SDK + ATT (consent)

Considerar (cuando tengas >2K MAU):
⚠️ AdMob con banners conservadores (solo si retención es sana)
⚠️ Mixpanel Free para 1-2 funnels críticos

Skip:
❌ MMPs (no hay UA pagada)
```

#### Fase 2: Early Growth → 5K-25K MAU (Costo: $26-200/mes)
```
Core:
✅ Firebase Analytics
✅ AdMob
✅ Sentry Team ($26/mes - better error tracking)
✅ Mixpanel Free o PostHog Paid (~$50-150/mes)

Opcional:
✅ Branch Startup ($200/mes - si empiezas UA)
```

#### Fase 3: 50K → 200K MAU (Costo: $500-2K/mes)
```
Core:
✅ Firebase Analytics + BigQuery export
✅ AdMob + mediation
✅ Sentry Business ($80+/mes)
✅ Mixpanel Growth ($300-800/mes) o PostHog Paid
✅ AppsFlyer Starter ($800-1.5K/mes - si UA agresiva)
```

#### Fase 4: 200K+ MAU (Costo: $3K-10K+/mes)
```
Core:
✅ Firebase Analytics + BigQuery
✅ AdMob
✅ Sentry Business/Enterprise
✅ Amplitude Enterprise ($2K-5K/mes)
✅ AppsFlyer Growth/Enterprise ($2K-5K/mes)

Opcional:
✅ Segment/RudderStack (si stack complejo)
✅ Data warehouse + BI tools
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Firebase Analytics:** https://rnfirebase.io/analytics/usage
- **AdMob RN:** https://docs.page/invertase/react-native-google-mobile-ads
- **Sentry RN:** https://docs.sentry.io/platforms/react-native/
- **PostHog RN:** https://posthog.com/docs/libraries/react-native
- **Mixpanel RN:** https://developer.mixpanel.com/docs/react-native
- **AppsFlyer RN:** https://dev.appsflyer.com/hc/docs/react-native-plugin
- **Branch RN:** https://help.branch.io/developers-hub/docs/react-native

### Guías de Implementación

- **Consent Management:** https://developers.google.com/admob/ump/android/quick-start
- **ATT (iOS):** https://developer.apple.com/documentation/apptrackingtransparency
- **SKAdNetwork:** https://developer.apple.com/documentation/storekit/skadnetwork

### Benchmarks Útiles

- **Mobile App Benchmarks 2024:** https://www.adjust.com/resources/benchmark/
- **App Retention Rates:** https://www.leanplum.com/blog/mobile-app-retention-rate/
- **Ad Revenue Benchmarks:** https://www.appodeal.com/blog/mobile-ad-mediation-benchmarks/

---

## ✅ Conclusión

**Para Goveling (React Native + Ads), la recomendación es:**

### Si estás en Pre-Launch / Ideación (Fase 0):
1. **Enfócate en:** Feedback cualitativo, entrevistas, prototipos
2. **Analytics mínimo:** Firebase Analytics básico (3-5 eventos) + Crashlytics
3. **NO implementes:** AdMob, funnels complejos, herramientas pagas
4. **Criterio de graduación:** 20+ beta testers activos, retention D7 >15%, listo para stores

### Si ya estás en stores con usuarios reales (Fase 1+):
1. **Arranca con:** Firebase Analytics + Crashlytics + Sentry Free
2. **Añade cuando tengas >2K MAU:** Mixpanel Free para funnels
3. **Añade cuando tengas >5K MAU:** AdMob con banners conservadores (evalúa impacto)
4. **Añade en Growth (>25K MAU):** Sentry Team ($26) + herramientas de producto
5. **Añade en Scale (>50K MAU):** AppsFlyer ($800+) solo cuando UA sea >$20K/mes

**Costo total por fase:**
- **Pre-Launch (0-500):** $0/mes (solo feedback cualitativo)
- **MVP → 5K MAU:** $0/mes (Firebase + Crashlytics + Sentry Free)
- **5K → 25K MAU:** $0-26/mes (+ PostHog/Mixpanel Free)
- **25K → 100K MAU:** $435-2K/mes (+ Sentry Biz + herramientas pagas)
- **100K → 500K MAU:** $3K-10K/mes (+ Amplitude + MMP)
- **500K+ MAU:** $15K-50K+/mes (enterprise tiers)

**Esta estrategia te permite:**
- ✅ NO perder tiempo en analytics antes de validar PMF
- ✅ Empezar sin costos cuando lances en stores
- ✅ Escalar herramientas conforme crece revenue
- ✅ Mantener integración con Google Ads/AdMob (clave para monetización)
- ✅ Tener funnels avanzados cuando los necesites (no antes)
- ✅ Optimizar LTV/CAC cuando hagas UA seria

**🚨 Recuerda:** En Fase 0, 10 conversaciones con usuarios > 10,000 eventos anónimos

---

**Última actualización:** Octubre 19, 2025  
**Versión:** 1.1 (añadida Fase 0: Pre-Launch/Ideación)  
**Autor:** AI Assistant para Goveling Team

---

## 📌 Changelog

### v1.1 (Oct 19, 2025)
- ✅ Añadida **Fase 0: Pre-Launch/Ideación (0-500 usuarios)**
- ✅ Añadida sección completa **"⏰ Cuándo Implementar Firebase Analytics + Crashlytics"**
  - Timeline detallado por etapa (4 etapas: NO implementar / Crashlytics solo / Analytics básico / Analytics completo)
  - Roadmap específico para Goveling (semana por semana)
  - Setup ultra-rápido (30 minutos para Crashlytics)
  - Reglas de oro para decidir
  - Tabla de decisión rápida
  - 5 errores comunes a evitar
  - Checklist de implementación por fase
- ✅ Actualizado Resumen Ejecutivo con advertencia para fase pre-launch
- ✅ Clarificado que AdMob NO debe implementarse en MVP
- ✅ Añadido "Startup Death Pattern" y cómo evitarlo
- ✅ Énfasis en feedback cualitativo sobre métricas prematuras

### v1.0 (Oct 18, 2025)
- Versión inicial del documento

