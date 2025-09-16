# Guía de Desarrollo Móvil con Capacitor

## 🚀 Configuraciones Disponibles

### Modo Desarrollo (Hot-reload desde Lovable)
```bash
npm run cap:dev
```
- La app móvil carga directamente desde Lovable
- Cambios en tiempo real
- Perfecto para desarrollo rápido

### Modo Producción (Archivos Locales)
```bash
npm run cap:prod
```
- La app móvil usa archivos compilados localmente
- Simula la experiencia de producción
- Necesario para testing en iOS/Android

## 📱 Comandos Rápidos

### Para iOS (Requiere macOS + Xcode)
```bash
# Preparar y ejecutar en iOS
npm run cap:build:ios

# Manual paso a paso
npm run build
npx cap sync ios
npx cap run ios
```

### Para Android (Requiere Android Studio)
```bash
# Preparar y ejecutar en Android
npm run cap:build:android

# Manual paso a paso
npm run build
npx cap sync android
npx cap run android
```

## 🔧 Solución de Problemas

### ❌ Problema: iOS muestra página de Lovable
**Causa:** Configuración en modo desarrollo
**Solución:** Usar modo producción
```bash
npm run cap:prod
npm run cap:build:ios
```

### ❌ Problema: Android no autentica con Google
**Causa:** Configuración incorrecta de cliente IDs
**Solución:** Los IDs están en `capacitor.config.json` - verificar configuración

### 🔄 Cambiar Entre Modos

**Activar desarrollo:**
```bash
npm run cap:dev
```

**Activar producción:**
```bash
npm run cap:prod
```

## 📋 Checklist Pre-Deploy

- [ ] `npm run build` ejecutado correctamente
- [ ] `npx cap sync` completado
- [ ] Configuración en modo producción
- [ ] Permisos configurados (cámara, ubicación, etc.)
- [ ] Iconos y splash screen actualizados

## 🏗️ Archivos de Configuración

- `capacitor.config.json` - Configuración activa (producción por defecto)
- `capacitor.config.dev.json` - Configuración de desarrollo con hot-reload
- `capacitor.config.json.bak` - Backup automático

## 📚 Recursos Adicionales

Para más información sobre desarrollo móvil con Capacitor y solución de problemas comunes, consulta nuestro blog post: https://lovable.dev/blogs/TODO