const runtimeOrigin =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5173";

const configuredSiteUrl =
  import.meta.env.VITE_SITE_URL?.trim();

export const SITE = {
  name: "Juan Estay",
  siteName: "Portafolio de Juan Estay",
  defaultTitle:
    "Juan Estay | Desarrollador Full Stack",
  description:
    "Desarrollador Full Stack en Chile especializado en React, Node.js y PostgreSQL. Diseño plataformas web, integraciones y soluciones empresariales modernas.",
  language: "es-CL",
  locale: "es_CL",
  country: "CL",
  themeColor: "#050505",
  accentColor: "#C7A86B",
  defaultImage: "/og-default.png",
  url: normalizeSiteUrl(
    configuredSiteUrl ||
      runtimeOrigin
  ),
};

export function absoluteUrl(
  value = "/"
) {
  if (!value) {
    return SITE.url;
  }

  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    return value;
  }

  const path =
    value.startsWith("/")
      ? value
      : `/${value}`;

  return `${SITE.url}${path}`;
}

export function buildPersonSchema() {
  return {
    "@context":
      "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    jobTitle:
      "Desarrollador Full Stack",
    nationality: {
      "@type": "Country",
      name: "Chile",
    },
    knowsAbout: [
      "React",
      "JavaScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "APIs REST",
      "Integraciones web",
      "Aplicaciones empresariales",
      "Desarrollo Full Stack",
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context":
      "https://schema.org",
    "@type": "WebSite",
    name: SITE.siteName,
    url: SITE.url,
    description:
      SITE.description,
    inLanguage:
      SITE.language,
    publisher:
      buildPersonReference(),
  };
}

export function buildProjectsSchema() {
  return {
    "@context":
      "https://schema.org",
    "@type": "CollectionPage",
    name:
      "Proyectos | Juan Estay",
    url: absoluteUrl(
      "/projects"
    ),
    description:
      "Selección de proyectos, plataformas web, integraciones y soluciones Full Stack desarrolladas por Juan Estay.",
    inLanguage:
      SITE.language,
    author:
      buildPersonReference(),
  };
}

export function buildProjectSchema({
  project,
  description,
  image,
  confidential = false,
}) {
  if (!project) {
    return null;
  }

  const schema = {
    "@context":
      "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    url: absoluteUrl(
      `/projects/${project.slug}`
    ),
    description,
    inLanguage:
      SITE.language,
    author:
      buildPersonReference(),
  };

  if (
    !confidential &&
    image
  ) {
    schema.image =
      absoluteUrl(image);
  }

  return schema;
}

function buildPersonReference() {
  return {
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
  };
}

function normalizeSiteUrl(
  value
) {
  return value.replace(
    /\/+$/,
    ""
  );
}
