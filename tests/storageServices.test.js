import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
  loadSelectedCharacter,
  saveSelectedCharacter
} from '../src/services/storageServices.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}

describe('storageServices', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage();
  });

  it('guarda y carga solo mensajes validos por personaje', () => {
    saveChatHistory('zoro', [
      { role: 'user', content: '  Hola  ', timestamp: '10:00' },
      { role: 'system', content: 'no debe guardarse' },
      { role: 'assistant', content: '' }
    ]);

    expect(loadChatHistory('zoro')).toEqual([
      { role: 'user', content: 'Hola', timestamp: '10:00' }
    ]);
  });

  it('recupera un historial vacio si el JSON esta corrupto', () => {
    localStorage.setItem('one_piece_chat_luffy', '{invalido');

    expect(loadChatHistory('luffy')).toEqual([]);
    expect(localStorage.getItem('one_piece_chat_luffy')).toBeNull();
  });

  it('mantiene separado el personaje activo del historial', () => {
    saveSelectedCharacter('usopp');
    saveChatHistory('luffy', [{ role: 'user', content: 'Carne' }]);

    expect(loadSelectedCharacter()).toBe('usopp');
    expect(loadChatHistory('luffy')).toHaveLength(1);
    clearChatHistory('luffy');
    expect(loadChatHistory('luffy')).toEqual([]);
  });
});
