FASE 12 — SEO + PRODUCCIÓN
==========================

Esta fase parte desde la Fase 11.

ANTES DE PROBAR
---------------
En tu .env de raíz agrega:

VITE_SITE_URL=http://localhost:5173

Mantén también tu VITE_API_URL actual.

EN VERCEL
---------
Configura:

VITE_API_URL=https://TU-BACKEND/api
VITE_SITE_URL=https://TU-DOMINIO

No uses slash final en VITE_SITE_URL.

COMANDOS
--------
npm install
npm run lint
npm run build
npm run dev

El build ejecuta automáticamente el generador SEO.

ARCHIVOS NUEVOS PRINCIPALES
---------------------------
src/config/site.js
src/components/common/Seo.jsx
scripts/generate-seo.mjs
public/robots.txt
public/sitemap.xml
public/manifest.webmanifest
public/og-default.png
vercel.json
PHASE_12_SEO_PRODUCTION_REPORT.md

METADATA DINÁMICA
-----------------
Home: Person + WebSite
Projects: CollectionPage
Project detail: CreativeWork
404: noindex
Admin login: noindex
Admin: noindex

IMPORTANTE
----------
El dominio todavía no fue definido en esta fase. Los archivos de ejemplo
usan https://www.tudominio.cl únicamente como placeholder. `npm run build`
regenera robots.txt y sitemap.xml utilizando VITE_SITE_URL.
