# One Piece AI Chat

Aplicacion web SPA para conversar con personajes de la tripulacion de los Sombrero de Paja mediante Google Gemini.

| | |
|---|---|
| **Creador** | Arq. Edison |
| **Repositorio** | [Proyecto-ChatAI-Personaje en GitHub](https://github.com/edisonvasque1996-create/Proyecto-ChatAI-Personaje) |
| **Tecnologias** | HTML, CSS, JavaScript, Vercel Functions, Google Gemini API y Vitest |

## Personajes y funciones

El usuario puede elegir entre Monkey D. Luffy, Roronoa Zoro y Usopp. Cada personaje tiene una personalidad e instrucciones propias para Gemini. La aplicacion incluye seleccion y favoritos, tema claro/oscuro, chat con indicador de escritura y cancelacion, y conversaciones guardadas por personaje en `localStorage`.

## Estructura

```text
.
├── api/
│   └── chat.js                 # Funcion serverless y proxy seguro hacia Gemini
├── img/                        # Avatares y capturas de la aplicacion
├── src/
│   ├── services/                # Cliente API y persistencia local
│   ├── utils/                   # Personajes, rutas y formateadores
│   ├── views/                   # Vistas Inicio, Chat y Acerca de
│   └── app.js                   # Enrutamiento SPA con History API
├── styles/styles.css            # Estilos responsive y temas
├── tests/                       # Pruebas unitarias con Vitest
├── index.html
├── vercel.json                  # Reescrituras de rutas SPA
└── package.json
```

## Requisitos y ejecucion local

- Node.js 18 o superior y npm.
- Una API key de [Google AI Studio](https://aistudio.google.com/app/apikey) para obtener respuestas de Gemini.
- Vercel CLI, que puede ejecutarse con `npx`.

1. Clona el repositorio e instala las dependencias:

	```bash
	git clone https://github.com/edisonvasque1996-create/Proyecto-ChatAI-Personaje.git
	cd Proyecto-ChatAI-Personaje
	npm install
	```

2. Crea `.env.local` a partir de `.env.example` y agrega tu clave:

	```env
	GEMINI_API_KEY=tu_clave_de_google_ai_studio
	# Opcional; por defecto se usa gemini-3.5-flash-lite
	GEMINI_MODEL=gemini-3.5-flash-lite
	```

3. Inicia la aplicacion junto con las funciones serverless:

	```bash
	npx vercel dev
	```

	Abre la URL local que indique Vercel CLI (normalmente `http://localhost:3000`). Si la CLI solicita vincular el proyecto, autentícate con Vercel y sigue sus instrucciones. `.env.local` está excluido de Git; nunca publiques la API key.

## Tests

Ejecuta la suite completa una vez:

```bash
npm run test:run
```

Para mantener Vitest en modo observación:

```bash
npm test
```

Las pruebas cubren el cliente y la funcion API, validaciones y errores de Gemini, persistencia/favoritos y formateadores.

## Despliegue en Vercel

1. Importa el repositorio de GitHub desde el panel de Vercel y conserva la configuracion por defecto para un proyecto JavaScript sin framework.
2. En **Settings > Environment Variables**, configura `GEMINI_API_KEY` y, opcionalmente, `GEMINI_MODEL` para los entornos necesarios.
3. Despliega el proyecto. Los siguientes cambios en la rama configurada se desplegaran automaticamente; también puedes desplegar desde la CLI con `npx vercel --prod`.
4. Comprueba `/home`, `/chat` y `/about`, incluida la recarga directa de las rutas.

La funcion `api/chat.js` mantiene la clave en el servidor y la envia a Gemini en un encabezado; no se expone al navegador.

## Capturas

**Inicio y seleccion de personaje**

![Pantalla de inicio con Luffy, Zoro y Usopp](img/captura-inicio.png)

**Chat con Luffy**

![Vista de chat con el personaje Luffy](img/captura-chat.png)

## Aplicacion publicada

[Abrir One Piece AI Chat](https://proyecto-chat-ai-n3-arq.vercel.app)

La URL asociada al proyecto responde actualmente con `DEPLOYMENT_PAUSED` en Vercel. El propietario debe reactivar el despliegue para que la aplicacion vuelva a estar disponible.

## Registro de uso de IA

| Herramienta | Uso en el proyecto |
|---|---|
| Google Gemini API | Genera las respuestas del chat con el prompt del personaje y el historial reciente de la conversacion. El modelo se configura con `GEMINI_MODEL`. |
| GitHub Copilot | Asistencia para organizar y redactar esta documentacion. |

Las respuestas generadas se muestran como contenido de IA; el historial se conserva en el navegador. La API key se configura como variable de entorno y no forma parte del codigo publicado.
