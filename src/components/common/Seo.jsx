import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  absoluteUrl,
  SITE,
} from "../../config/site";

function Seo({
  title,
  description = SITE.description,
  canonicalPath,
  image = SITE.defaultImage,
  type = "website",
  noIndex = false,
  structuredData = null,
}) {
  const location =
    useLocation();

  const resolvedTitle =
    title
      ? `${title} | ${SITE.name}`
      : SITE.defaultTitle;

  const resolvedPath =
    canonicalPath ||
    location.pathname ||
    "/";

  const canonicalUrl =
    absoluteUrl(
      resolvedPath
    );

  const imageUrl =
    image
      ? absoluteUrl(image)
      : null;

  const structuredDataJson =
    structuredData
      ? JSON.stringify(
          structuredData
        )
      : "";

  useEffect(() => {
    document.title =
      resolvedTitle;

    document.documentElement.lang =
      SITE.language;

    setMeta(
      "name",
      "description",
      description
    );

    setMeta(
      "name",
      "author",
      SITE.name
    );

    setMeta(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow, noarchive"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    setMeta(
      "name",
      "theme-color",
      SITE.themeColor
    );

    setMeta(
      "property",
      "og:type",
      type
    );

    setMeta(
      "property",
      "og:site_name",
      SITE.siteName
    );

    setMeta(
      "property",
      "og:locale",
      SITE.locale
    );

    setMeta(
      "property",
      "og:title",
      resolvedTitle
    );

    setMeta(
      "property",
      "og:description",
      description
    );

    setMeta(
      "property",
      "og:url",
      canonicalUrl
    );

    setMeta(
      "name",
      "twitter:card",
      imageUrl
        ? "summary_large_image"
        : "summary"
    );

    setMeta(
      "name",
      "twitter:title",
      resolvedTitle
    );

    setMeta(
      "name",
      "twitter:description",
      description
    );

    if (imageUrl) {
      setMeta(
        "property",
        "og:image",
        imageUrl
      );

      setMeta(
        "property",
        "og:image:width",
        "1200"
      );

      setMeta(
        "property",
        "og:image:height",
        "630"
      );

      setMeta(
        "property",
        "og:image:alt",
        resolvedTitle
      );

      setMeta(
        "name",
        "twitter:image",
        imageUrl
      );
    } else {
      removeMeta(
        "property",
        "og:image"
      );

      removeMeta(
        "property",
        "og:image:width"
      );

      removeMeta(
        "property",
        "og:image:height"
      );

      removeMeta(
        "property",
        "og:image:alt"
      );

      removeMeta(
        "name",
        "twitter:image"
      );
    }

    setCanonical(
      canonicalUrl
    );

    setStructuredData(
      structuredDataJson
    );
  }, [
    canonicalUrl,
    description,
    imageUrl,
    noIndex,
    resolvedTitle,
    structuredDataJson,
    type,
  ]);

  return null;
}

function setMeta(
  attribute,
  key,
  content
) {
  const selector =
    `meta[${attribute}="${key}"]`;

  let element =
    document.head.querySelector(
      selector
    );

  if (!element) {
    element =
      document.createElement(
        "meta"
      );

    element.setAttribute(
      attribute,
      key
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "content",
    content
  );
}

function removeMeta(
  attribute,
  key
) {
  const element =
    document.head.querySelector(
      `meta[${attribute}="${key}"]`
    );

  element?.remove();
}

function setCanonical(href) {
  let element =
    document.head.querySelector(
      'link[rel="canonical"]'
    );

  if (!element) {
    element =
      document.createElement(
        "link"
      );

    element.setAttribute(
      "rel",
      "canonical"
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "href",
    href
  );
}

function setStructuredData(
  value
) {
  const id = "seo-jsonld";
  let element =
    document.getElementById(id);

  if (!value) {
    element?.remove();
    return;
  }

  if (!element) {
    element =
      document.createElement(
        "script"
      );

    element.id = id;
    element.type =
      "application/ld+json";

    document.head.appendChild(
      element
    );
  }

  element.textContent = value;
}

export default Seo;
