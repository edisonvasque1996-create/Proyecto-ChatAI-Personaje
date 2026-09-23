// src/views/HomeView.js
import { CHARACTERS } from '../utils/constans.js';
import { saveSelectedCharacter } from '../services/storageServices.js';

export function renderHomeView(container, navigateTo) {
  container.innerHTML = `
    <div class="view-container home-view">
      <div class="hero-section">
        <h1>¡Bienvenido al Chat de One Piece AI! 🏴‍☠️</h1>
        <p>Conversa en tiempo real con tus personajes favoritos de la tripulación de los Sombrero de Paja, potenciados con Inteligencia Artificial.</p>
      </div>

      <div class="character-selection-section">
        <h2>Elige a tu personaje para comenzar:</h2>
        <div class="character-grid">
          ${Object.values(CHARACTERS).map(char => `
            <div class="character-card" data-id="${char.id}" style="border-top: 4px solid ${char.themeColor};">
              <div class="char-avatar">
                <img src="${char.avatar}" alt="${char.name}" loading="lazy">
              </div>
              <h3>${char.name}</h3>
              <span class="char-title">${char.title}</span>
              <p>${char.description}</p>
              <button class="btn-select-char" data-id="${char.id}">Chatear con ${char.name.split(' ')[0]}</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Estilos específicos de la vista home inyectados dinámicamente o gestionados en CSS
  container.querySelectorAll('.btn-select-char').forEach(button => {
    button.addEventListener('click', (e) => {
      const charId = e.target.getAttribute('data-id');
      saveSelectedCharacter(charId);
      navigateTo('/chat');
    });
  });
}