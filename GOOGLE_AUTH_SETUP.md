# Google Auth Configuration - @capgo/capacitor-social-login

## ✅ Estado Actual
La autenticación de Google está configurada usando el plugin @capgo/capacitor-social-login que es compatible con Capacitor 7.

## 🔧 Configuración de Google Auth:

La autenticación nativa de Google ya está configurada usando el plugin `@capgo/capacitor-social-login`.

## 📋 Configuración requerida:

### 1. Configurar Google Cloud Console
Sigue los pasos estándar para configurar OAuth en Google Cloud Console.

### 2. Configurar Client IDs en `capacitor.config.json`

El archivo ya está configurado con los Client IDs necesarios:

```json
"SocialLogin": {
  "google": {
    "webClientId": "117845276386-tjagl8ie97jc881vem3qam4kvkq0i34j.apps.googleusercontent.com",
    "androidClientId": "117845276386-mbdal5loltmqik4nakq7aja9ioiejplt.apps.googleusercontent.com",
    "iosClientId": "117845276386-mbdal5loltmqik4nakq7aja9ioiejplt.apps.googleusercontent.com"
  }
}
```

### 3. Actualizar Client IDs
Reemplaza los Client IDs de ejemplo con tus propios IDs de Google Cloud Console.

## 3. Configuración en Supabase

1. Ve a tu proyecto Supabase > Authentication > Providers
2. Activa el proveedor Google
3. Ingresa:
   - Client ID: El mismo Web Client ID de Google Cloud
   - Client Secret: El secret del Web Client ID

## 4. Rebuild y Deploy

Después de configurar:

```bash
npm run build
npx cap sync android
npx cap build android
cd android
./gradlew assembleRelease
```

## 5. Funcionamiento del plugin:

✅ **Plugin compatible**: @capgo/capacitor-social-login es compatible con Capacitor 7
✅ **Autenticación nativa**: No sale de la app en móviles  
✅ **Fallback web**: Funciona en navegadores
✅ **UX mejorada**: Experiencia más fluida para usuarios móviles
✅ **Seguridad**: Tokens manejados nativamente por el plugin

## 6. Notas importantes:

- El plugin @capgo/capacitor-social-login es la versión actualizada compatible con Capacitor 7
- Se removió completamente @codetrix-studio/capacitor-google-auth por incompatibilidad de dependencias
- La configuración en capacitor.config.json usa la sección "SocialLogin" en lugar de "GoogleAuth"
- El nuevo plugin maneja automáticamente la detección de plataforma