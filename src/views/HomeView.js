// src/views/HomeView.js
import { CHARACTERS } from '../utils/constans.js';
import {
  loadFavoriteCharacters,
  saveSelectedCharacter,
  toggleFavoriteCharacter
} from '../services/storageServices.js';

export function renderHomeView(container, navigateTo) {
  let favorites = loadFavoriteCharacters();
  let selectedFilter = 'all';

  function renderCharacters() {
    const characters = Object.values(CHARACTERS).filter(character => (
      selectedFilter === 'all' || favorites.includes(character.id)
    ));

    container.querySelector('.character-grid').innerHTML = characters.length
      ? characters.map(character => `
          <article class="character-card" data-id="${character.id}" style="border-top-color: ${character.themeColor};">
            <button class="favorite-btn ${favorites.includes(character.id) ? 'is-favorite' : ''}" data-favorite="${character.id}" aria-label="${favorites.includes(character.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}" aria-pressed="${favorites.includes(character.id)}">★</button>
            <div class="char-avatar">
              <img src="${character.avatar}" alt="${character.name}" loading="lazy">
            </div>
            <h3>${character.name}</h3>
            <span class="char-title">${character.title}</span>
            <p>${character.description}</p>
            <button class="btn-select-char" data-id="${character.id}">Chatear con ${character.name.split(' ')[0]}</button>
          </article>
        `).join('')
      : '<p class="empty-state">Aún no tienes personajes favoritos.</p>';
  }

  container.innerHTML = `
    <div class="view-container home-view">
      <div class="hero-section">
        <h1>¡Bienvenido al Chat de One Piece AI! 🏴‍☠️</h1>
        <p>Conversa en tiempo real con tus personajes favoritos de la tripulación de los Sombrero de Paja, potenciados con Inteligencia Artificial.</p>
      </div>

      <div class="character-selection-section">
        <div class="section-heading">
          <h2>Elige a tu personaje</h2>
          <div class="filter-tabs" role="group" aria-label="Filtrar personajes">
            <button class="filter-tab is-active" data-filter="all">Todos</button>
            <button class="filter-tab" data-filter="favorites">★ Favoritos</button>
          </div>
        </div>
        <div class="character-grid">
          <!-- El contenido se dibuja después de crear los filtros para compartir su estado. -->
        </div>
      </div>
    </div>
  `;

  renderCharacters();

  container.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-favorite]');
    if (favoriteButton) {
      favorites = toggleFavoriteCharacter(favoriteButton.dataset.favorite);
      renderCharacters();
      return;
    }

    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      selectedFilter = filterButton.dataset.filter;
      container.querySelectorAll('[data-filter]').forEach(button => {
        button.classList.toggle('is-active', button.dataset.filter === selectedFilter);
      });
      renderCharacters();
      return;
    }

    const selectButton = event.target.closest('.btn-select-char');
    if (selectButton) {
      saveSelectedCharacter(selectButton.dataset.id);
      navigateTo('/chat');
    }
  });
}