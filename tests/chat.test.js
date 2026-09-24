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

  it('rechaza mensajes que superan el límite antes de llamar a Gemini', async () => {
    process.env.GEMINI_API_KEY = 'test-secret';
    globalThis.fetch = vi.fn();
    const response = createResponse();

    await handler({
      method: 'POST',
      body: { message: 'a'.repeat(4001) }
    }, response);

    expect(response.status).toHaveBeenCalledWith(413);
    expect(fetch).not.toHaveBeenCalled();
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