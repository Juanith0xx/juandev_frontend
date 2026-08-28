# Fase 12 — SEO y preparación de producción

## Implementado

- Metadata base en `index.html`.
- Metadata dinámica por ruta con `Seo.jsx`.
- Canonical dinámico.
- Open Graph.
- Twitter Card.
- JSON-LD Schema.org.
- `Person` + `WebSite` en Home.
- `CollectionPage` en `/projects`.
- `CreativeWork` por proyecto.
- Protección SEO de proyectos confidenciales: no publica imagen ni cliente en el schema.
- `noindex, nofollow` para 404, login y panel Admin.
- `robots.txt` con bloqueo de `/admin`.
- `sitemap.xml` automático.
- El sitemap intenta cargar proyectos públicos desde la API durante `npm run build`.
- Si la API no responde durante el build, conserva las rutas estáticas y no rompe el build.
- `manifest.webmanifest`.
- Nuevo favicon de identidad `JE`.
- Imagen Open Graph 1200×630.
- `vercel.json` para routing SPA y headers de seguridad básicos.
- `VITE_SITE_URL` agregado a `.env.example`.

## Importante sobre Vite SPA

La metadata dinámica de `/projects/:slug` se actualiza en el navegador. Google puede renderizar JavaScript, pero scrapers sociales como WhatsApp, LinkedIn, Facebook o X no siempre ejecutan JavaScript antes de leer Open Graph.

Por eso:

- El Home tiene Open Graph estático completo desde `index.html`.
- Las rutas dinámicas tienen SEO cliente para buscadores con renderizado JS.
- Para Open Graph 100% diferente por cada proyecto en redes sociales se necesitaría prerenderizado/SSR o migrar esas páginas a un framework con renderizado de servidor, como Next.js. No es necesario bloquear el despliegue actual por esto.

## Variables necesarias

Local:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SITE_URL=http://localhost:5173
```

Producción en Vercel:

```env
VITE_API_URL=https://TU-BACKEND/api
VITE_SITE_URL=https://TU-DOMINIO
```

`VITE_SITE_URL` no debe terminar en `/`.

## Build

```powershell
npm run lint
npm run build
```

`npm run build` ejecuta primero:

```text
npm run seo:generate
```

y genera `public/robots.txt` y `public/sitemap.xml` usando las variables del entorno.

## Validación después del despliegue

Abrir:

- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`
- `/og-default.png`

Luego revisar el HTML/DOM de:

- `/`
- `/projects`
- `/projects/:slug`
- `/admin/login`
- una ruta 404

Confirmar title, description, canonical, robots, Open Graph y JSON-LD.

## Search Console

Cuando el dominio esté activo:

1. Registrar el dominio en Google Search Console.
2. Verificar propiedad.
3. Enviar `https://TU-DOMINIO/sitemap.xml`.
4. Solicitar indexación de `/` y `/projects`.
5. Revisar cobertura e indexación después de algunos días.
