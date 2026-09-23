// src/views/ChatView.js
import { CHARACTERS } from '../utils/constans.js';
import { sendChatMessage } from '../services/apiServices.js';
import { loadChatHistory, saveChatHistory, clearChatHistory, loadSelectedCharacter } from '../services/storageServices.js';
import { getCurrentTimestamp, escapeHTML } from '../utils/formatters.js';

export function renderChatView(container) {
  const activeCharId = loadSelectedCharacter();
  const character = CHARACTERS[activeCharId] || CHARACTERS.luffy;
  let history = loadChatHistory(activeCharId);

  container.innerHTML = `
    <div class="view-container chat-view">
      <div class="chat-header">
        <div class="chat-char-info">
          <span class="char-avatar-sm">
            <img src="${character.avatar}" alt="${character.name}">
          </span>
          <div>
            <h2>${character.name}</h2>
            <span class="status-indicator">● En línea</span>
          </div>
        </div>
        <div class="chat-actions">
          <button id="clear-history-btn" class="btn-secondary" title="Borrar historial">🗑️ Limpiar Chat</button>
        </div>
      </div>

      <div id="chat-messages" class="chat-messages-container">
        ${history.length === 0 ? `
          <div class="welcome-message-bubble">
            <p>¡Hola! Soy <strong>${character.name}</strong>.${character.description}</p>
            <span class="msg-time">${getCurrentTimestamp()}</span>
          </div>
        ` : history.map(msg => `
          <div class="message ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}">
            <div class="msg-content">
              <p>${escapeHTML(msg.content)}</p>
              <div class="msg-footer">
                <span class="msg-time">${msg.timestamp || getCurrentTimestamp()}</span>${msg.role !== 'user' ? `<button class="btn-copy" data-text="${escapeHTML(msg.content)}" title="Copiar respuesta">📋</button>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="typing-indicator" class="typing-indicator hidden">
        <span></span><span></span><span></span> ${character.name} está escribiendo...
      </div>

      <form id="chat-form" class="chat-input-form">
        <input type="text" id="chat-input" placeholder="Escribe un mensaje a ${character.name}..." autocomplete="off" required />
        <button type="submit" id="send-btn">Enviar 🚀</button>
      </form>
    </div>
  `;

  const messagesContainer = container.querySelector('#chat-messages');
  const chatForm = container.querySelector('#chat-form');
  const chatInput = container.querySelector('#chat-input');
  const typingIndicator = container.querySelector('#typing-indicator');
  const clearBtn = container.querySelector('#clear-history-btn');
  const sendBtn = container.querySelector('#send-btn');
  let requestController = null;

  // Scroll automático al fondo
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  scrollToBottom();

  // Un único listener también cubre botones añadidos después de enviar mensajes.
  messagesContainer.addEventListener('click', async (e) => {
    const button = e.target.closest('.btn-copy');
    if (!button) return;

    try {
      await navigator.clipboard.writeText(button.dataset.text || '');
      button.textContent = '✅';
      setTimeout(() => button.textContent = '📋', 1500);
    } catch (error) {
      console.error('No se pudo copiar el mensaje:', error);
    }
  });

  // Limpiar historial
  clearBtn.addEventListener('click', () => {
    if (confirm(`¿Estas seguro de borrar la conversación con ${character.name}?`)) {
      requestController?.abort();
      clearChatHistory(activeCharId);
      renderChatView(container);
    }
  });

  // Enviar mensaje
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;

    const timestamp = getCurrentTimestamp();

    // Agregar mensaje del usuario
    history.push({ role: 'user', content: userText, timestamp });
    saveChatHistory(activeCharId, history);

    messagesContainer.innerHTML += `
      <div class="message user-msg">
        <div class="msg-content">
          <p>${escapeHTML(userText)}</p>
          <div class="msg-footer"><span class="msg-time">${timestamp}</span></div>
        </div>
      </div>
    `;

    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    requestController = new AbortController();
    scrollToBottom();

    // Mostrar indicador de escritura
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
      // Llamada a la API mediante apiService
      const botReply = await sendChatMessage(userText, character.systemPrompt, history.slice(0, -1), {
        signal: requestController.signal
      });
      const botTimestamp = getCurrentTimestamp();

      history.push({ role: 'assistant', content: botReply, timestamp: botTimestamp });
      saveChatHistory(activeCharId, history);

      typingIndicator.classList.add('hidden');

      messagesContainer.innerHTML += `
        <div class="message bot-msg">
          <div class="msg-content">
            <p>${escapeHTML(botReply)}</p>
            <div class="msg-footer">
              <span class="msg-time">${botTimestamp}</span>
              <button class="btn-copy" data-text="${escapeHTML(botReply)}">📋</button>
            </div>
          </div>
        </div>
      `;

      scrollToBottom();
    } catch (error) {
      if (error.name === 'AbortError') return;
      typingIndicator.classList.add('hidden');
      messagesContainer.innerHTML += `
        <div class="message error-msg">
          <div class="msg-content">
            <p>⚠️ Error: No se pudo conectar con el servidor de IA. Inténtalo de nuevo.</p>
          </div>
        </div>
      `;
      scrollToBottom();
    } finally {
      requestController = null;
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  });
}