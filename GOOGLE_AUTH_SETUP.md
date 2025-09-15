# Configuración de Google Native Authentication

## 1. Configuración en Google Cloud Console

### Para Android (APK):
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a "APIs y servicios" > "Credenciales"
4. Crea una credencial "OAuth 2.0 Client ID" para Android:
   - Tipo de aplicación: Android
   - Nombre del paquete: `app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8`
   - SHA-1 de tu keystore: Obtén con el comando:
     ```bash
     keytool -list -v -keystore android-keystore/goveling-release-key.keystore -alias goveling
     ```

### Para iOS (IPA):
1. Crea una credencial "OAuth 2.0 Client ID" para iOS:
   - Tipo de aplicación: iOS
   - Bundle ID: `app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8`

### Para Web (fallback):
1. Crea una credencial "OAuth 2.0 Client ID" para Web:
   - Tipo de aplicación: Web application
   - JavaScript origins: Tu dominio web
   - Redirect URIs: Tu dominio + callback de Supabase

## 2. Configurar el Client ID

Reemplaza `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` en estos archivos:

### En `src/hooks/useAuth.tsx` (línea ~338):
```typescript
await GoogleAuth.initialize({
  clientId: "TU_WEB_CLIENT_ID.apps.googleusercontent.com", // Reemplazar aquí
  scopes: ["profile", "email"],
  grantOfflineAccess: true,
});
```

### En `capacitor.config.json` (línea ~39):
```json
"GoogleAuth": {
  "scopes": ["profile", "email"],
  "clientId": "TU_WEB_CLIENT_ID.apps.googleusercontent.com", // Reemplazar aquí
  "forceCodeForRefreshToken": true
}
```

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

## 5. Beneficios de esta implementación:

✅ **Autenticación nativa**: No sale de la app en móviles
✅ **Fallback web**: Funciona en navegadores
✅ **Deep linking**: El redirect funciona correctamente
✅ **UX mejorada**: Experiencia más fluida para usuarios móviles
✅ **Seguridad**: Tokens manejados nativamente

## 6. Notas importantes:

- El mismo Web Client ID funciona para móvil y web
- Los Client IDs de Android/iOS solo son para configuración nativa
- La autenticación se detecta automáticamente según la plataforma
- En desarrollo web seguirá usando el método OAuth tradicional