# Fase 11 — Anime.js

## Objetivo

Agregar movimiento sutil y profesional al frontend público sin convertir el portafolio en una interfaz recargada ni alterar los flujos funcionales ya validados.

## Qué se animó

- Navbar al cargar una ruta pública.
- Hero del Home:
  - bloque de presentación;
  - elementos internos con aparición escalonada;
  - tarjeta visual;
  - métricas.
- Encabezados de secciones al entrar al viewport.
- Cards `<article>` al entrar al viewport.
- Footer cuando aparece en pantalla.
- Contenido agregado dinámicamente por llamadas API mediante `MutationObserver`.

## Qué NO se animó

- Panel administrativo.
- Formularios mientras el usuario escribe.
- Modales operativos.
- Tablas administrativas.
- Elementos con movimiento continuo.
- Fondos con loops infinitos.

La decisión es intencional: el área pública puede tener una capa editorial/premium, mientras que el Admin debe priorizar velocidad y claridad operativa.

## Accesibilidad

`usePublicMotion` respeta:

```css
prefers-reduced-motion: reduce
```

Si el sistema operativo solicita reducir movimiento, Anime.js no ejecuta estas animaciones.

## Rendimiento

Se usan:

- `IntersectionObserver` para animar solamente elementos cercanos al viewport.
- `MutationObserver` únicamente dentro del layout público para detectar contenido dinámico.
- Animaciones de opacidad en cards, evitando dejar transforms inline que interfieran con los hover del Theme System.
- Transform vertical solo en elementos contenedores/encabezados seguros.

## Archivos principales modificados

```text
src/hooks/usePublicMotion.js              NUEVO
src/layouts/PublicLayout.jsx
src/pages/public/HomePage.jsx
src/components/public/Navbar.jsx
src/components/public/Footer.jsx
package.json
```

El ZIP contiene el frontend completo consolidado desde la Fase 10.

## Dependencia nueva

```json
"animejs": "^4.5.0"
```

Como el entorno de generación no pudo sincronizar npm con el registro, el `package-lock.json` incluido corresponde al estado anterior.

Después de instalar esta fase ejecuta:

```powershell
npm install
```

Esto instalará Anime.js y actualizará automáticamente `package-lock.json`.

Después:

```powershell
npm run lint
npm run build
npm run dev
```

## Prueba visual recomendada

1. Abrir `/` en Dark.
2. Recargar y observar el Hero.
3. Hacer scroll lentamente por cada sección.
4. Abrir `/projects`.
5. Abrir un `/projects/:slug`.
6. Cambiar a Light y repetir.
7. Activar "Reducir movimiento" en Windows y confirmar que el contenido se muestra sin animaciones.
8. Revisar 375 px, 430 px, 768 px, 1366 px y 1920 px.

## Criterio visual

Las animaciones están configuradas para ser breves y discretas. No se agregaron efectos tipo parallax, rebotes, partículas ni animaciones infinitas porque no aportan al objetivo formal/profesional del portafolio.


## Validación realizada

Se ejecutó análisis sintáctico sobre todo `src`:

```text
60 archivos JS/JSX
0 errores de sintaxis
```

También se ejecutó ESLint sobre la versión resultante:

```text
0 errores
```

El `vite build` no pudo ejecutarse de forma válida en el entorno de generación
porque el `node_modules` disponible provenía de otra plataforma y Rolldown no
tenía su binding nativo de Linux. Por eso la validación final de build debe
hacerse en el equipo Windows después de instalar Anime.js.

Comandos:

```powershell
npm install animejs@^4.5.0
npm run lint
npm run build
npm run dev
```
