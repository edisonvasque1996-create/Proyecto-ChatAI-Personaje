// src/services/storageService.js

const STORAGE_PREFIX = 'one_piece_chat_';
const MAX_HISTORY_MESSAGES = 100;

function getStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function isValidMessage(message) {
  return message
    && (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.trim().length > 0;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(isValidMessage)
    .map(message => ({
      role: message.role,
      content: message.content.trim(),
      ...(typeof message.timestamp === 'string' ? { timestamp: message.timestamp } : {})
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}

/**
 * Guarda el historial de chat para un personaje específico en localStorage.
 * @param {string} characterId 
 * @param {Array} history 
 */
export function saveChatHistory(characterId, history) {
  try {
    const storage = getStorage();
    if (!storage || typeof characterId !== 'string' || !characterId.trim()) return false;
    storage.setItem(`${STORAGE_PREFIX}${characterId}`, JSON.stringify(normalizeHistory(history)));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
}

/**
 * Carga el historial de chat guardado para un personaje.
 * @param {string} characterId 
 * @returns {Array}
 */
export function loadChatHistory(characterId) {
  try {
    const storage = getStorage();
    if (!storage || typeof characterId !== 'string' || !characterId.trim()) return [];
    const data = storage.getItem(`${STORAGE_PREFIX}${characterId}`);
    return data ? normalizeHistory(JSON.parse(data)) : [];
  } catch (error) {
    console.error('Error leyendo localStorage:', error);
    if (typeof characterId === 'string') getStorage()?.removeItem(`${STORAGE_PREFIX}${characterId}`);
    return [];
  }
}

/**
 * Borra el historial de un personaje específico.
 * @param {string} characterId 
 */
export function clearChatHistory(characterId) {
  try {
    getStorage()?.removeItem(`${STORAGE_PREFIX}${characterId}`);
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
  }
}

/**
 * Guarda el personaje seleccionado actualmente.
 * @param {string} characterId 
 */
export function saveSelectedCharacter(characterId) {
  try {
    const storage = getStorage();
    if (!storage || typeof characterId !== 'string' || !characterId.trim()) return false;
    storage.setItem(`${STORAGE_PREFIX}active`, characterId);
    return true;
  } catch (error) {
    console.error('Error guardando personaje activo:', error);
    return false;
  }
}

/**
 * Carga el personaje seleccionado actualmente (por defecto 'luffy').
 * @returns {string}
 */
export function loadSelectedCharacter() {
  try {
    return getStorage()?.getItem(`${STORAGE_PREFIX}active`) || 'luffy';
  } catch (error) {
    return 'luffy';
  }
}