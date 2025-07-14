# Configuración de Capacitor para Goveling MVP
## Pasos para completar la migración móvil
### 1. Exportar proyecto a GitHub
1. Haz clic en el botón "Export to Github" en Lovable
2. Clona el repositorio en tu máquina local
3. Ejecuta `npm install` para instalar dependencias

### 2. Inicializar Capacitor
```bash
npx cap init
```

### 3. Agregar plataformas
```bash
# Para iOS (requiere macOS con Xcode)
npx cap add ios

# Para Android (requiere Android Studio)
npx cap add android
```

### 4. Configurar autenticación móvil
En el archivo `supabase/config.toml`, ya están configuradas las URLs de redirección para Capacitor:
- `app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8://callback`

### 5. Build y sincronización
```bash
# Construir la aplicación web
npm run build
c
# Sincronizar con plataformas nativas
npx cap sync
```

### 6. Ejecutar en simulador/dispositivo
```bash
# Para iOS
npx cap run ios

# Para Android
npx cap run android
```

### 7. Configuraciones adicionales recomendadas

#### iOS (Info.plist)
- Permisos de cámara: `NSCameraUsageDescription`
- Permisos de ubicación: `NSLocationWhenInUseUsageDescription`

#### Android (AndroidManifest.xml)
- Permisos de cámara: `<uses-permission android:name="android.permission.CAMERA" />`
- Permisos de ubicación: `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`

### 8. Para App Store y Google Play
1. Generar iconos y splash screens apropiados
2. Configurar signing certificates
3. Preparar metadata de la app (descripciones, capturas, etc.)
4. Seguir guías oficiales de cada tienda para submission

## Funcionalidades implementadas
- ✅ Navegación móvil optimizada
- ✅ Header móvil con notificaciones
- ✅ Detección automática de plataforma
- ✅ URLs de redirección configuradas para auth
- ✅ Configuración de splash screen y status bar
- 🔄 Pendiente: Implementar funciones nativas (cámara, GPS, push notifications)

## Próximos pasos sugeridos
1. Implementar plugin de cámara para fotos de perfil
2. Agregar plugin de geolocalización para ubicación automática
3. Configurar notificaciones push
4. Implementar capacidades offline básicas
5. Optimizar rendimiento para móvil
