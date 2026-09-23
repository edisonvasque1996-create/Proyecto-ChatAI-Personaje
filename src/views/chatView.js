import { getActiveCharacter } from '../services/characters.js';

// Estado local del historial de sesión actual
let currentSessionHistory = [];

export function renderChatView(container, navigateTo) {
    const activeChar = getActiveCharacter();

    container.innerHTML = `
        <section class="chat-section">
            <!-- Cabecera del chat con el personaje activo -->
            <div class="chat-header">
                <div class="chat-character-meta">
                    <span class="chat-avatar-sm">${activeChar.avatar}</span>
                    <div>
                        <h2>${activeChar.name}</h2>
                        <span class="chat-status"><span class="status-dot"></span> En línea</span>
                    </div>
                </div>
                <button id="switch-char-btn" class="btn-secondary-sm">Cambiar Personaje</button>
            </div>

            <!-- Contenedor de Mensajes -->
            <div id="chat-messages" class="chat-messages">
                ${currentSessionHistory.length === 0 ? `
                    <div class="chat-welcome-banner">
                        <div class="welcome-avatar">${activeChar.avatar}</div>
                        <h3>¡Hola! Soy ${activeChar.name}</h3>
                        <p>${activeChar.description}</p>
                        <span class="welcome-hint">Escribe un mensaje abajo para comenzar la conversación.</span>
                    </div>
                ` : renderMessages()}
            </div>

            <!-- Indicador de "Escribiendo..." (Oculto por defecto) -->
            <div id="typing-indicator" class="typing-indicator hidden">
                <span class="typing-avatar">${activeChar.avatar}</span>
                <div class="typing-bubble">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>

            <!-- Formulario de Entrada de Mensaje -->
            <form id="chat-form" class="chat-form">
                <input 
                    type="text" 
                    id="chat-input" 
                    placeholder="Escribe tu mensaje a ${activeChar.name}..." 
                    autocomplete="off"
                    required
                >
                <button type="submit" id="send-btn" class="btn-send" aria-label="Enviar mensaje">
                    ➤
                </button>
            </form>
        </section>
    `;

    const chatMessagesEl = container.querySelector('#chat-messages');
    const chatFormEl = container.querySelector('#chat-form');
    const chatInputEl = container.querySelector('#chat-input');
    const typingIndicatorEl = container.querySelector('#typing-indicator');
    const switchCharBtn = container.querySelector('#switch-char-btn');

    // Botón para volver a la galería y cambiar de personaje
    switchCharBtn.addEventListener('click', () => {
        window.history.pushState({}, '', '/gallery');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Scroll automático al fondo al iniciar la vista
    scrollToBottom(chatMessagesEl);

    // Manejar envío de mensajes
    chatFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInputEl.value.trim();
        if (!text) return;

        const timestamp = getFormattedTime();

        // 1. Agregar mensaje del usuario al historial local
        const userMsg = { role: 'user', content: text, timestamp };
        currentSessionHistory.push(userMsg);
        
        // Limpiar input y re-renderizar mensajes
        chatInputEl.value = '';
        updateMessagesUI(chatMessagesEl);
        scrollToBottom(chatMessagesEl);

        // 2. Mostrar indicador de "escribiendo..."
        typingIndicatorEl.classList.remove('hidden');
        scrollToBottom(chatMessagesEl);

        try {
            // Simulamos respuesta temporal o conectaremos en la Fase 4 con la Vercel Function
            // En la fase 4 reemplazaremos esto por la petición real fetch('/api/chat', ...)
            const aiReplyText = await simulateAIResponse(activeChar, text, currentSessionHistory);
            
            const aiTimestamp = getFormattedTime();
            currentSessionHistory.push({ role: 'assistant', content: aiReplyText, timestamp: aiTimestamp });
        } catch (error) {
            currentSessionHistory.push({ 
                role: 'assistant', 
                content: '⚠️ Lo siento, ha ocurrido un error al conectar con mis pensamientos.', 
                timestamp: getFormattedTime() 
            });
        } finally {
            // Ocultar indicador y actualizar UI
            typingIndicatorEl.classList.add('hidden');
            updateMessagesUI(chatMessagesEl);
            scrollToBottom(chatMessagesEl);
        }
    });

    // Permitir copiar respuestas al portapapeles
    chatMessagesEl.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            const content = copyBtn.getAttribute('data-content');
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.textContent = '¡Copiado!';
                setTimeout(() => { copyBtn.textContent = '📋 Copiar'; }, 2000);
            });
        }
    });
}

function renderMessages() {
    return currentSessionHistory.map(msg => `
        <div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
            <div class="message-content">
                <p>${escapeHTML(msg.content)}</p>
                <div class="message-footer">
                    <span class="message-time">${msg.timestamp}</span>
                    ${msg.role === 'assistant' ? `<button class="copy-btn" data-content="${escapeAttr(msg.content)}">📋 Copiar</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateMessagesUI(container) {
    const activeChar = getActiveCharacter();
    container.innerHTML = currentSessionHistory.length === 0 ? `
        <div class="chat-welcome-banner">
            <div class="welcome-avatar">${activeChar.avatar}</div>
            <h3>¡Hola! Soy ${activeChar.name}</h3>
            <p>${activeChar.description}</p>
            <span class="welcome-hint">Escribe un mensaje abajo para comenzar la conversación.</span>
        </div>
    ` : renderMessages();
}

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;');
}

// Función temporal de simulación (será reemplazada en la Fase 4 por la API real de Gemini)
async function simulateAIResponse(character, userText) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula retraso de red
    return `[Modo Simulación] Entendido tu mensaje: "${userText}". Pronto me conectaré a Google Gemini usando tu Vercel Function con mi personalidad de ${character.name}.`;
}