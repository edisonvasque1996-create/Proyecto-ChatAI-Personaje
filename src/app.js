// src/app.js
import { renderHomeView } from './views/HomeView.js';
import { renderChatView } from './views/ChatView.js';
import { renderAboutView } from './views/AboutView.js';
import { ROUTES } from './utils/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (!appContainer || !themeToggleBtn) {
    console.error('No se encontraron los elementos principales de la aplicación.');
    return;
  }

  // Manejo de Modo Oscuro
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  // Función de Enrutamiento SPA
  function router(path) {
    appContainer.innerHTML = '';
    
    // Actualizar clases activas en la barra de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    switch (path) {
      case ROUTES.HOME:
      case '/':
        renderHomeView(appContainer, navigateTo);
        break;
      case ROUTES.CHAT:
        renderChatView(appContainer);
        break;
      case ROUTES.ABOUT:
        renderAboutView(appContainer);
        break;
      default:
        renderHomeView(appContainer, navigateTo);
        break;
    }
  }

  // Navegación con History API
  function navigateTo(path) {
    window.history.pushState({}, '', path);
    router(path);
  }

  // Interceptar clics en enlaces de navegación
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (!link) return;

    e.preventDefault();
    navigateTo(link.getAttribute('href'));
  });

  // Escuchar eventos de atrás/adelante del navegador
  window.addEventListener('popstate', () => {
    router(window.location.pathname);
  });

  // Ruta inicial al cargar la página
  const initialPath = window.location.pathname === '/' ? ROUTES.HOME : window.location.pathname;
  router(initialPath);
});