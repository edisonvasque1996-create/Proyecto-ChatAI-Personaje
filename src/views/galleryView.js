import { characters, getActiveCharacter, setActiveCharacter } from '../services/characters.js';

export function renderGalleryView(container, navigateTo) {
    const activeChar = getActiveCharacter();

    container.innerHTML = `
        <section class="gallery-section">
            <div class="gallery-header">
                <h2>Galería de Personajes</h2>
                <p>Selecciona una mente brillante, un mago o un maestro para iniciar tu conversación interactiva.</p>
            </div>

            <div class="characters-grid">
                ${characters.map(char => `
                    <div class="character-card ${char.id === activeChar.id ? 'active-selection' : ''}" data-id="${char.id}">
                        <div class="character-avatar">${char.avatar}</div>
                        <div class="character-info">
                            <h3>${char.name}</h3>
                            <span class="character-title">${char.title}</span>
                            <p>${char.description}</p>
                        </div>
                        <div class="character-action">
                            <button class="btn-primary select-char-btn" data-id="${char.id}">
                                ${char.id === activeChar.id ? '✨ Personaje Actual' : 'Elegir y Chatear'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;

    // Escuchar eventos de selección
    container.querySelectorAll('.select-char-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const charId = e.currentTarget.getAttribute('data-id');
            setActiveCharacter(charId);
            // Redirigir suavemente a la ruta de chat
            window.history.pushState({}, '', '/chat');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    });
}