import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendChatMessage } from '../src/services/apiServices.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiServices', () => {
  it('envia mensaje e historial y devuelve la respuesta', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ reply: '¡Shishishi!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

    await expect(sendChatMessage('Hola', 'Eres Luffy', [
      { role: 'user', content: 'Hey' }
    ])).resolves.toBe('¡Shishishi!');

    expect(fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        message: 'Hola',
        systemPrompt: 'Eres Luffy',
        history: [{ role: 'user', content: 'Hey' }]
      })
    }));
  });

  it('expone el error del servidor aunque no devuelva JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('Servicio caido', { status: 503 }));

    await expect(sendChatMessage('Hola', '')).rejects.toThrow(
      'Error al conectar con el servidor de IA.'
    );
  });

  it('rechaza respuestas exitosas sin reply', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));

    await expect(sendChatMessage('Hola', '')).rejects.toThrow(
      'El servidor no devolvió una respuesta válida.'
    );
  });

  it('identifica el limite gratuito y conserva el tiempo de espera', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        error: 'Has alcanzado el límite gratuito. Intenta nuevamente en 4 segundos.',
        code: 'RATE_LIMITED',
        retryAfter: 4
      }),
      { status: 429, headers: { 'Retry-After': '4' } }
    ));

    await expect(sendChatMessage('Hola', '')).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
      retryAfter: 4
    });
  });
});
