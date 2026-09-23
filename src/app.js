// src/app.js
import { renderHomeView } from './views/HomeView.js';
import { renderChatView } from './views/ChatView.js';
import { renderAboutView } from './views/AboutView.js';
import { ROUTES } from './utils/constans.js';

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
  function normalizePath(path) {
    const pathname = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
    return pathname === '/' ? ROUTES.HOME : pathname;
  }

  function router(path) {
    const normalizedPath = normalizePath(path);
    const currentRoute = Object.values(ROUTES).includes(normalizedPath)
      ? normalizedPath
      : ROUTES.HOME;
    appContainer.innerHTML = '';
    
    // Actualizar clases activas en la barra de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
      if (normalizePath(link.getAttribute('href')) === currentRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    switch (currentRoute) {
      case ROUTES.HOME:
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

    if (normalizedPath !== currentRoute) window.history.replaceState({}, '', currentRoute);
  }

  // Navegación con History API
  function navigateTo(path) {
    const nextPath = normalizePath(path);
    if (normalizePath(window.location.pathname) === nextPath) return;
    window.history.pushState({}, '', nextPath);
    router(nextPath);
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
  router(window.location.pathname);
});