# Configuración de Prettier para Go Travel Connect

Este proyecto ahora tiene Prettier configurado para mantener un formato de código consistente.

## ✅ Archivos creados

- `.prettierrc` - Configuración principal de Prettier
- `.prettierignore` - Archivos y carpetas que Prettier debe ignorar

## 🚀 Scripts disponibles

Los siguientes scripts han sido agregados al `package.json`:

```bash
# Formatear todos los archivos
npm run format

# Verificar el formato sin hacer cambios
npm run format:check

# Corregir problemas de linting automáticamente
npm run lint:fix
```

## ⚙️ Configuración de Prettier

El archivo `.prettierrc` contiene las siguientes reglas:

- **Semi**: `true` - Punto y coma al final de las declaraciones
- **Trailing Comma**: `es5` - Comas finales donde ES5 las permite
- **Single Quote**: `false` - Usar comillas dobles
- **Print Width**: `80` - Máximo de 80 caracteres por línea
- **Tab Width**: `2` - Indentación de 2 espacios
- **Use Tabs**: `false` - Usar espacios en lugar de tabs
- **Bracket Spacing**: `true` - Espacios alrededor de llaves en objetos
- **Bracket Same Line**: `false` - Cerrar `>` de JSX en nueva línea
- **Arrow Parens**: `always` - Siempre paréntesis en arrow functions
- **End Of Line**: `lf` - Line feed (LF) para terminación de línea

## 🔧 Integración con ESLint

Prettier está integrado con ESLint para evitar conflictos entre ambas herramientas:

- Se instaló `eslint-config-prettier` para deshabilitar reglas de ESLint que entran en conflicto con Prettier
- Se instaló `eslint-plugin-prettier` para ejecutar Prettier como una regla de ESLint
- Los errores de formato de Prettier aparecerán como errores de ESLint

## 📁 Archivos ignorados

El archivo `.prettierignore` excluye automáticamente:

- `node_modules/`
- Archivos de build (`dist/`, `build/`)
- Archivos de configuración que pueden tener formato específico
- Assets estáticos (imágenes, archivos comprimidos)
- Archivos de Supabase migrations
- Archivos de Capacitor

## 💡 Uso recomendado

### Formatear antes de commit

```bash
npm run format
```

### Verificar formato en CI/CD

```bash
npm run format:check
```

### Configurar tu editor

Para Visual Studio Code, instala la extensión oficial de Prettier:
- Extensión: `Prettier - Code formatter`
- Configurar como formateador por defecto
- Habilitar "Format on Save"

### Configuración recomendada para VS Code

En `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🐛 Solución de problemas

### Si Prettier no funciona:

1. Verifica que esté instalado: `npm list prettier`
2. Ejecuta manualmente: `npx prettier --write .`
3. Verifica conflictos con ESLint: `npm run lint`

### Para excluir archivos adicionales:

Agrega patrones al archivo `.prettierignore`:

```
# Excluir archivo específico
src/legacy-file.js

# Excluir carpeta
old-components/
```

## 📋 Estado actual

✅ Prettier instalado y configurado  
✅ Integración con ESLint  
✅ Scripts de npm configurados  
✅ Archivos formateados automáticamente  
✅ Configuración de archivos ignorados  

Tu proyecto está listo para mantener un formato de código consistente y profesional.
