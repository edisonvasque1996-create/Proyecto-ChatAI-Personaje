import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Método ${req.method} no permitido` });
    }

    try {
        const { message, history, systemPrompt } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido.' });
        }

        // Obtener la API Key desde las variables de entorno del servidor de Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'La API Key de Gemini no está configurada en el servidor.' });
        }

        // Inicializar el SDK oficial de Google Gen AI
        const ai = new GoogleGenAI({ apiKey });

        // Preparar el historial de chat en el formato que espera el SDK de Gemini
        // El SDK espera un array de objetos con role ('user' o 'model') y parts
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Crear la sesión de chat con el System Instruction (personalidad del personaje)
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash', // Modelo rápido y eficiente para chat
            config: {
                systemInstruction: systemPrompt || 'Eres un asistente útil y amigable.',
                temperature: 0.7,
            },
            history: formattedHistory
        });

        // Enviar el nuevo mensaje del usuario al modelo
        const result = await chat.sendMessage({ message });
        const responseText = result.text;

        return res.status(200).json({ reply: responseText });

    } catch (error) {
        console.error('Error en Vercel Function /api/chat:', error);
        return res.status(500).json({ 
            error: 'Error al procesar la solicitud con Gemini AI.',
            details: error.message 
        });
    }
}