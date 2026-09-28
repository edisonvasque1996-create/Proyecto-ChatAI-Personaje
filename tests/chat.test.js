import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/chat.js';

function createResponse() {
  const response = {};
  response.status = vi.fn(() => response);
  response.json = vi.fn(() => response);
  response.setHeader = vi.fn();
  return response;
}

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
});

describe('api/chat', () => {
  it('mantiene la API key en el header y fuera de la URL', async () => {
    process.env.GEMINI_API_KEY = 'test-secret';
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Hola' }] } }] }),
      { status: 200 }
    ));

    await handler({
      method: 'POST',
      body: { message: 'Hola', systemPrompt: 'Responde breve' }
    }, createResponse());

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/models/gemini-3.5-flash-lite:generateContent');
    expect(url).not.toContain('test-secret');
    expect(options.headers['x-goog-api-key']).toBe('test-secret');
  });

  it('rechaza mensajes que superan los 2000 caracteres antes de llamar a Gemini', async () => {
    process.env.GEMINI_API_KEY = 'test-secret';
    globalThis.fetch = vi.fn();
    const response = createResponse();

    await handler({
      method: 'POST',
      body: { message: 'a'.repeat(2001) }
    }, response);

    expect(response.status).toHaveBeenCalledWith(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('limita el historial enviado a ocho mensajes de hasta 1000 caracteres', async () => {
    process.env.GEMINI_API_KEY = 'test-secret';
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Respuesta' }] } }] }),
      { status: 200 }
    ));

    await handler({
      method: 'POST',
      body: {
        message: 'Hola',
        history: Array.from({ length: 10 }, (_, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: 'x'.repeat(1500)
        }))
      }
    }, createResponse());

    const [, options] = fetch.mock.calls[0];
    const payload = JSON.parse(options.body);
    const historySent = payload.contents.slice(0, -1);

    expect(payload.contents).toHaveLength(9);
    expect(historySent).toHaveLength(8);
    expect(historySent.every(item => item.parts[0].text.length === 1000)).toBe(true);
  });

  it('conserva el 429 y comunica el tiempo de espera', async () => {
    process.env.GEMINI_API_KEY = 'test-secret';
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: { message: 'Please retry in 3.2s' } }),
      { status: 429 }
    ));
    const response = createResponse();

    await handler({ method: 'POST', body: { message: 'Hola' } }, response);

    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '4');
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'RATE_LIMITED',
      retryAfter: 4
    }));
  });
});