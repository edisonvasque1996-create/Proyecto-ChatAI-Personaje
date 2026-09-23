// tests/formatters.test.js
import { describe, it, expect } from 'vitest';
import { escapeHTML, getCurrentTimestamp } from '../src/utils/formatters.js';

describe('Funciones de Utilidad (Formatters)', () => {
  it('debe escapar caracteres HTML correctamente para prevenir XSS', () => {
    const maliciousString = '<script>alert("hacker")</script>';
    const safeString = escapeHTML(maliciousString);
    expect(safeString).not.toContain('<script>');
    expect(safeString).toContain('&lt;script&gt;');
  });

  it('debe retornar un timestamp con formato HH:MM válido', () => {
    const timestamp = getCurrentTimestamp();
    expect(timestamp).toMatch(/^\d{2}:\d{2}$/);
  });
});