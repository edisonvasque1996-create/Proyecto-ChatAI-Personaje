// api/chat.js
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta (API Key ausente)' });
  }

  try {
    // Transformamos el historial al formato que espera la API de Gemini (Google Generative Language)
    // role: 'user' o 'model'
    const validHistory = Array.isArray(history)
      ? history.filter(item => item && typeof item.content === 'string').slice(-20)
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

    // Endpoint oficial de Google Gemini (modelo gemini-1.5-flash o gemini-pro)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt || "Eres un asistente útil." }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al comunicarse con la API de Gemini');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener una respuesta.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error en Serverless Function:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}