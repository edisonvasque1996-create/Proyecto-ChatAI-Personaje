// src/utils/formatters.js

/**
 * Retorna la hora actual formateada en formato HH:MM (ej. 14:35).
 * @returns {string}
 */
export function getCurrentTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Escapa caracteres especiales en HTML para prevenir inyecciones XSS básicas al renderizar texto del usuario.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}