// src/views/AboutView.js

export function renderAboutView(container) {
  container.innerHTML = `
    <div class="view-container about-view">
      <h2>Acerca del Proyecto</h2>
      <p>Esta aplicación es una Prueba de Concepto (POC) desarrollada como Proyecto Integrador para evaluar la integración de interfaces SPA con JavaScript Vanilla, Serverless Functions en Vercel y Google Gemini AI.</p>
      
      <h3>Tecnologías Utilizadas</h3>
      <ul>
        <li><strong>Frontend:</strong> HTML5, CSS3 (Mobile-First, Flexbox/Grid), JavaScript Vanilla (SPA con History API).</li>
        <li><strong>Backend / Seguridad:</strong> Vercel Serverless Functions (Proxy seguro para ocultar la API Key).</li>
        <li><strong>Inteligencia Artificial:</strong> Google Gemini API (gemini-1.5-flash).</li>
        <li><strong>Testing:</strong> Vitest.</li>
      </ul>

      <h3>Características Destacadas</h3>
      <ul>
        <li>Galería de múltiples personajes (Luffy, Zoro y Usopp) con personalidades únicas.</li>
        <li>Persistencia de conversaciones mediante <code>localStorage</code>.</li>
        <li>Modo oscuro / claro dinámico.</li>
        <li>Indicadores de escritura y marcas de tiempo.</li>
      </ul>
    </div>
  `;
}