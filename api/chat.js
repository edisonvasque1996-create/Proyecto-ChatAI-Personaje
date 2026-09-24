// api/chat.js
const MAX_MESSAGE_LENGTH = 4000;
const MAX_SYSTEM_PROMPT_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 20;

function getRetryAfterSeconds(response, errorData) {
  const retryAfterHeader = response.headers?.get?.('retry-after');
  const headerSeconds = Number(retryAfterHeader);
  if (Number.isFinite(headerSeconds) && headerSeconds > 0) {
    return Math.ceil(headerSeconds);
  }

  const retryMatch = errorData.error?.message?.match(/retry in ([\d.]+)s/i);
  return retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
}

export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { message, systemPrompt, history = [] } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje es obligatorio' });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(413).json({ error: 'El mensaje es demasiado largo' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta (API Key ausente)' });
  }

  try {
    // Transformamos el historial al formato que espera la API de Gemini (Google Generative Language)
    // role: 'user' o 'model'
    const validHistory = Array.isArray(history)
      ? history
        .filter(item => (
          item
          && (item.role === 'user' || item.role === 'assistant')
          && typeof item.content === 'string'
          && item.content.trim().length > 0
        ))
        .map(item => ({ role: item.role, content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
        .slice(-MAX_HISTORY_ITEMS)
      : [];

    const contents = [
      ...validHistory.map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const payload = {
      contents,
      systemInstruction: {
        parts: [{
          text: (typeof systemPrompt === 'string' && systemPrompt.trim()
            ? systemPrompt
            : 'Eres un asistente útil.').slice(0, MAX_SYSTEM_PROMPT_LENGTH)
        }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        // Mantener un mensaje estable cuando el proveedor no devuelve JSON.
      }
      console.error('Gemini API request failed', {
        status: response.status,
        message: errorData.error?.message
      });

      if (response.status === 429) {
        const retryAfter = getRetryAfterSeconds(response, errorData);
        if (retryAfter) {
          res.setHeader('Retry-After', String(retryAfter));
        }
        return res.status(429).json({
          error: retryAfter
            ? `Has alcanzado el límite gratuito. Intenta nuevamente en ${retryAfter} segundos.`
            : 'Has alcanzado el límite gratuito. Intenta nuevamente más tarde.',
          code: 'RATE_LIMITED',
          retryAfter
        });
      }

      throw new Error('Error al comunicarse con la API de Gemini');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener una respuesta.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error en Serverless Function:', error);
    return res.status(500).json({ error: 'No fue posible generar una respuesta en este momento' });
  }
}