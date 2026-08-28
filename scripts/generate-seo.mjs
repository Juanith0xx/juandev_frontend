import {
  readFile,
  writeFile,
} from "node:fs/promises";

import {
  existsSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

const ROOT = process.cwd();

await loadLocalEnv();

const siteUrl = normalizeUrl(
  process.env.VITE_SITE_URL ||
    "http://localhost:5173"
);

const apiUrl = normalizeUrl(
  process.env.VITE_API_URL ||
    "http://localhost:3000/api"
);

if (
  process.env.VERCEL &&
  !process.env.VITE_SITE_URL
) {
  throw new Error(
    "VITE_SITE_URL es obligatorio en Vercel para generar sitemap.xml y robots.txt correctamente."
  );
}

const projects =
  await fetchPublicProjects(
    apiUrl
  );

const urls = [
  {
    loc: `${siteUrl}/`,
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    loc: `${siteUrl}/projects`,
    changefreq: "weekly",
    priority: "0.9",
  },
  ...projects
    .filter(
      (project) =>
        Boolean(project.slug)
    )
    .map((project) => ({
      loc:
        `${siteUrl}/projects/${encodeURIComponent(project.slug)}`,
      lastmod:
        validDate(
          project.updated_at ||
            project.created_at
        ),
      changefreq: "monthly",
      priority: "0.8",
    })),
];

await writeFile(
  resolve(
    ROOT,
    "public/sitemap.xml"
  ),
  buildSitemap(urls),
  "utf8"
);

await writeFile(
  resolve(
    ROOT,
    "public/robots.txt"
  ),
  buildRobots(siteUrl),
  "utf8"
);

console.log(
  `SEO generado: ${urls.length} URLs en sitemap.xml`
);

if (
  projects.length === 0
) {
  console.warn(
    "Aviso SEO: no fue posible cargar proyectos desde la API. El sitemap incluye las rutas públicas estáticas y el build puede continuar."
  );
}

async function fetchPublicProjects(
  baseUrl
) {
  try {
    const response =
      await fetch(
        `${baseUrl}/projects`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const list =
      data?.projects ||
      data?.data ||
      (Array.isArray(data)
        ? data
        : []);

    return Array.isArray(list)
      ? list
      : [];
  } catch (error) {
    console.warn(
      `No se pudieron cargar proyectos para el sitemap: ${error.message}`
    );

    return [];
  }
}

async function loadLocalEnv() {
  const candidates = [
    ".env.production.local",
    ".env.production",
    ".env.local",
    ".env",
  ];

  for (
    const filename of candidates
  ) {
    const path =
      resolve(ROOT, filename);

    if (!existsSync(path)) {
      continue;
    }

    const contents =
      await readFile(
        path,
        "utf8"
      );

    for (
      const rawLine of
        contents.split(/\r?\n/)
    ) {
      const line =
        rawLine.trim();

      if (
        !line ||
        line.startsWith("#")
      ) {
        continue;
      }

      const separator =
        line.indexOf("=");

      if (separator < 1) {
        continue;
      }

      const key =
        line
          .slice(0, separator)
          .trim();

      let value =
        line
          .slice(separator + 1)
          .trim();

      value = value.replace(
        /^['"]|['"]$/g,
        ""
      );

      if (
        process.env[key] ===
        undefined
      ) {
        process.env[key] =
          value;
      }
    }
  }
}

function buildRobots(
  origin
) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

function buildSitemap(urls) {
  const items =
    urls
      .map((item) => {
        const fields = [
          `    <loc>${escapeXml(item.loc)}</loc>`,
        ];

        if (item.lastmod) {
          fields.push(
            `    <lastmod>${item.lastmod}</lastmod>`
          );
        }

        if (item.changefreq) {
          fields.push(
            `    <changefreq>${item.changefreq}</changefreq>`
          );
        }

        if (item.priority) {
          fields.push(
            `    <priority>${item.priority}</priority>`
          );
        }

        return [
          "  <url>",
          ...fields,
          "  </url>",
        ].join("\n");
      })
      .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items,
    "</urlset>",
    "",
  ].join("\n");
}

function validDate(value) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function normalizeUrl(value) {
  return value.replace(
    /\/+$/,
    ""
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
