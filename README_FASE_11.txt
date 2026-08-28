FASE 11 — ANIME.JS
===================

Esta fase parte desde el frontend consolidado de la Fase 10.

CAMBIOS PRINCIPALES
-------------------
- Anime.js agregado al package.json.
- Nuevo hook: src/hooks/usePublicMotion.js
- PublicLayout activa las animaciones solamente en el frontend público.
- Navbar entra suavemente al cargar.
- Hero del Home tiene entrada escalonada.
- Headers de secciones aparecen al entrar al viewport.
- Cards <article> aparecen con stagger de opacidad.
- Footer aparece al llegar al final.
- MutationObserver detecta cards cargadas después de llamadas API.
- prefers-reduced-motion desactiva las animaciones.
- El Admin NO se anima intencionalmente.

ARCHIVOS MODIFICADOS CLAVE
--------------------------
src/hooks/usePublicMotion.js
src/layouts/PublicLayout.jsx
src/pages/public/HomePage.jsx
src/components/public/Navbar.jsx
src/components/public/Footer.jsx
package.json

INSTALACIÓN
-----------
1. Copia/reemplaza el frontend incluido.

2. Desde la raíz del frontend ejecuta:

npm install animejs@^4.5.0

Este paso también actualizará tu package-lock.json.

3. Luego:

npm run lint
npm run build
npm run dev

PRUEBA
------
Revisar:
- /
- /projects
- /projects/:slug
- Dark
- Light
- 375px
- 430px
- 768px
- 1366px
- 1920px

Las animaciones se diseñaron para ser sutiles y profesionales.
No se agregaron parallax, partículas, rebotes o loops infinitos.

VALIDACIÓN DE CÓDIGO
--------------------
60 archivos JS/JSX parseados.
0 errores de sintaxis.
ESLint: 0 errores.

El build final debe ejecutarse en Windows después de npm install porque
el entorno de generación no dispone del binding nativo de Rolldown compatible.
