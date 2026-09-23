// Definición de las rutas de la aplicación
const routes = {
    '/home': 'home-view',
    '/gallery': 'gallery-view',
    '/chat': 'chat-view',
    '/about': 'about-view'
};

export function initRouter(onRouteChanged) {
    // Manejar clics en los enlaces de navegación internos
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            const path = link.getAttribute('href');
            navigateTo(path);
        }
    });

    // Manejar botones atrás/adelante del navegador
    window.addEventListener('popstate', () => {
        handleRoute();
    });

    // Cargar la ruta inicial al arrancar
    handleRoute();

    function navigateTo(path) {
        window.history.pushState({}, '', path);
        handleRoute();
    }

    function handleRoute() {
        const path = window.location.pathname;
        const currentRoute = routes[path] || routes['/home'];
        
        // Actualizar clases activas en la barra de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('href') === path) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Callback para notificar a la app principal qué vista cargar
        if (onRouteChanged) {
            onRouteChanged(currentRoute, path);
        }
    }
}