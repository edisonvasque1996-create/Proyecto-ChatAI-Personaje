# One Piece AI Chat

SPA de chat con personajes, historial local y una funcion serverless para Gemini.

## Requisitos

- Node.js 18 o superior.
- Una API key de Google Gemini para activar las respuestas.

## Instalacion y pruebas

```bash
npm install
npm run test:run
```

La suite valida formatters, persistencia por personaje, favoritos y respuestas del cliente API.

## Configuracion de Gemini

1. Copia `.env.example` como referencia.
2. En desarrollo, configura `GEMINI_API_KEY` en el entorno que ejecute la funcion serverless.
3. En Vercel, crea `GEMINI_API_KEY` en Project Settings > Environment Variables y vuelve a desplegar.

La clave solo se lee en `api/chat.js`; nunca se envia al navegador.

## SPA y despliegue

Las rutas `/home`, `/chat` y `/about` se resuelven mediante `History API`. El archivo `vercel.json` reescribe esas rutas hacia `index.html`, por lo que una recarga directa conserva la aplicacion.

Para probar el frontend con funciones serverless en local se recomienda usar Vercel CLI:

```bash
npx vercel dev
```

No publiques la API key en el repositorio ni en archivos dentro de `src/`.
