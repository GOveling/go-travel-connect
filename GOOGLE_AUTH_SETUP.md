# Solución Temporal: Google Auth funcionando

## ⚠️ Estado Actual
La autenticación de Google está funcionando en modo web (con redirect externo) mientras configuramos la autenticación nativa.

## 🔧 Para habilitar autenticación nativa:

1. **Configura Google Cloud Console** (sigue los pasos del setup original)
2. **Descomenta y configura la importación** en `src/hooks/useAuth.tsx`:
   ```typescript
   import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
   ```
3. **Cambia el condicional** en línea ~287:
   ```typescript
   // Cambiar de:
   if (false && isNative()) {
   // A:
   if (isNative()) {
   ```

## 🚀 Alternativa más simple: Deep Link

Para una solución más rápida, puedes mejorar el deep linking:

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