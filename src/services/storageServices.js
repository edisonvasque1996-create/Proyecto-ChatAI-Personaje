// src/services/storageService.js

const STORAGE_PREFIX = 'one_piece_chat_';

/**
 * Guarda el historial de chat para un personaje específico en localStorage.
 * @param {string} characterId 
 * @param {Array} history 
 */
export function saveChatHistory(characterId, history) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${characterId}`, JSON.stringify(history));
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
}

/**
 * Carga el historial de chat guardado para un personaje.
 * @param {string} characterId 
 * @returns {Array}
 */
export function loadChatHistory(characterId) {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${characterId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error leyendo localStorage:', error);
    return [];
  }
}

/**
 * Borra el historial de un personaje específico.
 * @param {string} characterId 
 */
export function clearChatHistory(characterId) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${characterId}`);
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
    localStorage.setItem(`${STORAGE_PREFIX}active`, characterId);
  } catch (error) {
    console.error('Error guardando personaje activo:', error);
  }
}

/**
 * Carga el personaje seleccionado actualmente (por defecto 'luffy').
 * @returns {string}
 */
export function loadSelectedCharacter() {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}active`) || 'luffy';
  } catch (error) {
    return 'luffy';
  }
}