// src/services/apiService.js

/**
 * Envía un mensaje al servidor (Serverless Function de Vercel) para consultar con Gemini AI.
 * @param {string} message - El mensaje escrito por el usuario.
 * @param {string} systemPrompt - El prompt de contexto del personaje activo.
 * @param {Array} history - Historial previo de la conversación [{ role, content }].
 * @returns {Promise<string>} - La respuesta generada por la IA.
 */
export async function sendChatMessage(message, systemPrompt, history = [], options = {}) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        systemPrompt,
        history
      }),
      signal: options.signal
    });

    const rawData = await response.text();
    let data = {};
    try {
      data = rawData ? JSON.parse(rawData) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error al conectar con el servidor de IA.');
    }

    if (typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('El servidor no devolvió una respuesta válida.');
    }

    return data.reply;
  } catch (error) {
    console.error('Error en apiService:', error);
    throw error;
  }
}