import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Seo from "../../components/common/Seo";

import {
  buildProjectSchema,
} from "../../config/site";

import {
  getPublicProjectBySlug,
} from "../../services/projectsService";

function ProjectDetailPage() {
  const {
    slug,
  } = useParams();

  const [
    project,
    setProject,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicProjectBySlug(
            slug
          );

        setProject(
          data?.project ||
          data?.data ||
          data
        );
      } catch (error) {
        console.error(
          "Error cargando proyecto:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar el proyecto."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [slug]);

  const confidential =
    project
      ? isConfidential(
          project
        )
      : false;

  const technologies =
    useMemo(() => {
      if (!project) {
        return [];
      }

      return getTechnologies(
        project
      );
    }, [project]);

  const images =
    useMemo(() => {
      if (
        !project ||
        confidential
      ) {
        return [];
      }

      return getProjectImages(
        project
      );
    }, [
      project,
      confidential,
    ]);

  return (
    <div
      className="
        theme-page
        min-h-screen
      "
    >
      <Seo
        title={
          project?.title ||
          (error
            ? "Proyecto no disponible"
            : "Proyecto")
        }
        description={
          project
            ? getDescription(
                project
              )
            : "Proyecto del portafolio de Juan Estay, desarrollador Full Stack."
        }
        canonicalPath={
          `/projects/${slug}`
        }
        image={
          project &&
          !confidential
            ? images[0]?.url
            : undefined
        }
        type="article"
        noIndex={Boolean(error)}
        structuredData={
          project
            ? buildProjectSchema({
                project,
                description:
                  getDescription(
                    project
                  ),
                image:
                  !confidential
                    ? images[0]?.url
                    : null,
                confidential,
              })
            : null
        }
      />

      <Navbar />

      <main>
        {/* ============================================
            STATE
        ============================================ */}

        {loading && (
          <ProjectDetailSkeleton />
        )}

        {!loading &&
          error && (
            <ErrorState
              message={error}
            />
          )}

        {!loading &&
          !error &&
          project && (
            <>
              {/* ======================================
                  HERO
              ====================================== */}

              <section
                className="
                  relative
                  overflow-hidden
                  pb-16
                  pt-36
                  sm:pb-20
                  sm:pt-40
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-[30%]
                    h-[650px]
                    w-[650px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[var(--theme-accent-soft)]
                    blur-[150px]
                  "
                />

                <div
                  className="
                    relative
                    z-10
                    mx-auto
                    max-w-7xl
                    px-6
                    lg:px-8
                  "
                >
                  <Link
                    to="/projects"
                    className="
                      theme-link
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                    "
                  >
                    <span
                      aria-hidden="true"
                    >
                      ←
                    </span>

                    Todos los proyectos
                  </Link>

                  <div
                    className="
                      mt-12
                      grid
                      gap-10
                      lg:grid-cols-[1.15fr_0.85fr]
                      lg:items-end
                    "
                  >
                    <div>
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        "
                      >
                        <p
                          className="
                            theme-eyebrow
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                          "
                        >
                          {confidential
                            ? "Proyecto confidencial"
                            : "Proyecto"}
                        </p>

                        {isFeatured(
                          project
                        ) && (
                          <span
                            className="
                              rounded-full
                              border
                              border-[var(--theme-accent)]
                              bg-[var(--theme-accent-soft)]
                              px-3
                              py-1
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-[0.14em]
                              text-[var(--theme-accent)]
                            "
                          >
                            Destacado
                          </span>
                        )}
                      </div>

                      <h1
                        className="
                          theme-title
                          mt-5
                          max-w-5xl
                          text-4xl
                          font-semibold
                          tracking-[-0.055em]
                          sm:text-5xl
                          lg:text-6xl
                          xl:text-7xl
                        "
                      >
                        {project.title}
                        <span
                          className="
                            theme-accent
                          "
                        >
                          .
                        </span>
                      </h1>
                    </div>

                    <p
                      className="
                        theme-text
                        max-w-xl
                        text-base
                        leading-8
                        sm:text-lg
                      "
                    >
                      {getDescription(
                        project
                      )}
                    </p>
                  </div>

                  {technologies.length >
                    0 && (
                    <div
                      className="
                        mt-10
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      {technologies.map(
                        (
                          technology,
                          index
                        ) => {
                          const name =
                            getTechnologyName(
                              technology
                            );

                          if (!name) {
                            return null;
                          }

                          return (
                            <span
                              key={
                                technology.id ||
                                `${name}-${index}`
                              }
                              className="
                                rounded-lg
                                border
                                border-[var(--theme-border)]
                                bg-[var(--theme-bg-card)]
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-[var(--theme-text-secondary)]
                              "
                            >
                              {name}
                            </span>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* ======================================
                  CONFIDENTIAL
              ====================================== */}

              {confidential ? (
                <ConfidentialProject
                  project={
                    project
                  }
                />
              ) : (
                <PublicProjectContent
                  project={
                    project
                  }
                  images={
                    images
                  }
                />
              )}

              {/* ======================================
                  CTA
              ====================================== */}

              <section
                className="
                  theme-section
                  theme-border
                  border-t
                  py-20
                "
              >
                <div
                  className="
                    mx-auto
                    max-w-7xl
                    px-6
                    lg:px-8
                  "
                >
                  <div
                    className="
                      theme-card-elevated
                      grid
                      gap-8
                      rounded-[1.75rem]
                      border
                      border-[var(--theme-accent)]
                      p-8
                      sm:p-10
                      lg:grid-cols-[1fr_auto]
                      lg:items-center
                    "
                  >
                    <div>
                      <p
                        className="
                          theme-eyebrow
                          text-xs
                          font-semibold
                          uppercase
                          tracking-[0.2em]
                        "
                      >
                        Próximo proyecto
                      </p>

                      <h2
                        className="
                          theme-title
                          mt-4
                          max-w-2xl
                          text-2xl
                          font-semibold
                          tracking-[-0.04em]
                          sm:text-3xl
                        "
                      >
                        ¿Necesitas desarrollar
                        una solución similar?
                      </h2>

                      <p
                        className="
                          theme-text
                          mt-4
                          max-w-2xl
                          text-sm
                          leading-7
                        "
                      >
                        Podemos revisar tu
                        requerimiento y definir
                        una solución técnica
                        adecuada a tus objetivos.
                      </p>
                    </div>

                    <Link
                      to="/#contacto"
                      className="
                        theme-btn-accent
                        inline-flex
                        items-center
                        justify-center
                        rounded-xl
                        px-6
                        py-3.5
                        text-sm
                        font-semibold
                      "
                    >
                      Conversemos

                      <span
                        className="ml-3"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </section>
            </>
          )}
      </main>

      <Footer />
    </div>
  );
}

/* ============================================
   PUBLIC PROJECT
============================================ */

function PublicProjectContent({
  project,
  images,
}) {
  const longDescription =
    getLongDescription(
      project
    );

  const primaryImage =
    images[0];

  const secondaryImages =
    images.slice(
      1,
      5
    );

  return (
    <>
      {/* VISUAL */}

      <section
        className="
          theme-section
          theme-border
          border-t
          py-16
          sm:py-20
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            lg:px-8
          "
        >
          {primaryImage ? (
            <div
              className="
                overflow-hidden
                rounded-[1.75rem]
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-card)]
              "
            >
              <img
                src={
                  primaryImage.url
                }
                alt={
                  primaryImage.alt ||
                  project.title
                }
                className="
                  aspect-[16/8]
                  w-full
                  object-cover
                "
              />
            </div>
          ) : (
            <ProjectVisualFallback />
          )}

          {secondaryImages.length >
            0 && (
            <div
              className="
                mt-5
                grid
                gap-5
                sm:grid-cols-2
              "
            >
              {secondaryImages.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={
                      image.id ||
                      `${image.url}-${index}`
                    }
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-card)]
                    "
                  >
                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        project.title
                      }
                      className="
                        aspect-[16/10]
                        w-full
                        object-cover
                      "
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* DETAIL */}

      <section
        className="
          theme-page
          theme-border
          border-t
          py-20
          sm:py-24
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            gap-12
            px-6
            lg:grid-cols-[0.7fr_1.3fr]
            lg:gap-20
            lg:px-8
          "
        >
          <div>
            <p
              className="
                theme-eyebrow
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
              "
            >
              Sobre el proyecto
            </p>

            <h2
              className="
                theme-title
                mt-4
                text-3xl
                font-semibold
                tracking-[-0.04em]
                sm:text-4xl
              "
            >
              Contexto y solución.
            </h2>
          </div>

          <div>
            <p
              className="
                theme-text
                whitespace-pre-line
                text-base
                leading-8
              "
            >
              {longDescription}
            </p>

            <ProjectLinks
              project={
                project
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================
   CONFIDENTIAL PROJECT
============================================ */

function ConfidentialProject({
  project,
}) {
  return (
    <section
      className="
        theme-section
        theme-border
        border-t
        py-20
        sm:py-24
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          lg:px-8
        "
      >
        <div
          className="
            theme-card-elevated
            relative
            overflow-hidden
            rounded-[1.75rem]
            border
            border-[var(--theme-border)]
            p-8
            sm:p-10
            lg:p-14
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              right-[-120px]
              top-[-120px]
              h-[350px]
              w-[350px]
              rounded-full
              bg-[var(--theme-accent-soft)]
              blur-[90px]
            "
          />

          <div
            className="
              relative
              z-10
              grid
              gap-10
              lg:grid-cols-[0.7fr_1.3fr]
            "
          >
            <div>
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[var(--theme-accent)]
                  bg-[var(--theme-accent-soft)]
                  text-[var(--theme-accent)]
                "
              >
                <LockIcon />
              </div>

              <p
                className="
                  theme-eyebrow
                  mt-6
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                "
              >
                Confidencialidad
              </p>
            </div>

            <div>
              <h2
                className="
                  theme-title
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                  sm:text-3xl
                "
              >
                Información protegida
                por acuerdo de
                confidencialidad.
              </h2>

              <p
                className="
                  theme-text
                  mt-5
                  max-w-3xl
                  text-base
                  leading-8
                "
              >
                Este proyecto puede
                mostrarse únicamente de
                forma general. No se
                publican nombres de
                clientes, capturas,
                código, información
                comercial ni otros datos
                que permitan identificar
                la implementación.
              </p>

              <p
                className="
                  theme-muted
                  mt-5
                  max-w-3xl
                  text-sm
                  leading-7
                "
              >
                {getDescription(
                  project
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROJECT LINKS
============================================ */

function ProjectLinks({
  project,
}) {
  const links = [
    {
      label: "Ver proyecto",
      url:
        project.live_url ||
        project.project_url ||
        project.website_url ||
        project.demo_url,
    },
    {
      label: "Repositorio",
      url:
        project.github_url ||
        project.repository_url ||
        project.repo_url,
    },
  ].filter(
    (item) =>
      Boolean(item.url)
  );

  if (!links.length) {
    return null;
  }

  return (
    <div
      className="
        mt-8
        flex
        flex-wrap
        gap-3
      "
    >
      {links.map(
        (item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              theme-btn-accent
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-5
              py-3
              text-sm
              font-semibold
            "
          >
            {item.label}

            <span
              aria-hidden="true"
            >
              ↗
            </span>
          </a>
        )
      )}
    </div>
  );
}

/* ============================================
   VISUAL FALLBACK
============================================ */

function ProjectVisualFallback() {
  return (
    <div
      className="
        theme-card
        relative
        flex
        min-h-[380px]
        items-center
        justify-center
        overflow-hidden
        rounded-[1.75rem]
        border
      "
    >
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[110px]
        "
      />

      <div
        className="
          relative
          z-10
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          text-xl
          font-semibold
          text-[var(--theme-accent)]
        "
      >
        {"</>"}
      </div>
    </div>
  );
}

/* ============================================
   ERROR
============================================ */

function ErrorState({
  message,
}) {
  return (
    <section
      className="
        flex
        min-h-[75vh]
        items-center
        pt-24
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
          px-6
          text-center
          lg:px-8
        "
      >
        <div
          className="
            theme-card
            rounded-[1.75rem]
            border
            p-8
            sm:p-10
          "
        >
          <p
            className="
              text-sm
              text-[var(--theme-danger)]
            "
          >
            {message}
          </p>

          <Link
            to="/projects"
            className="
              theme-btn-accent
              mt-6
              inline-flex
              rounded-xl
              px-5
              py-3
              text-sm
              font-semibold
            "
          >
            Volver a proyectos
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SKELETON
============================================ */

function ProjectDetailSkeleton() {
  return (
    <section
      className="
        min-h-[75vh]
        pt-40
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          animate-pulse
          px-6
          lg:px-8
        "
      >
        <div
          className="
            h-3
            w-32
            rounded
            bg-[var(--theme-border)]
          "
        />

        <div
          className="
            mt-12
            h-14
            max-w-3xl
            rounded-xl
            bg-[var(--theme-border-strong)]
          "
        />

        <div
          className="
            mt-5
            h-14
            max-w-2xl
            rounded-xl
            bg-[var(--theme-border-strong)]
          "
        />

        <div
          className="
            mt-10
            h-4
            max-w-xl
            rounded
            bg-[var(--theme-border)]
          "
        />

        <div
          className="
            mt-16
            aspect-[16/7]
            w-full
            rounded-[1.75rem]
            bg-[var(--theme-bg-card)]
          "
        />
      </div>
    </section>
  );
}

/* ============================================
   ICON
============================================ */

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="
        h-6
        w-6
      "
      aria-hidden="true"
    >
      <rect
        width="14"
        height="11"
        x="5"
        y="11"
        rx="2"
      />

      <path
        d="
          M8 11
          V7
          a4 4 0 0 1
          8 0
          v4
        "
      />
    </svg>
  );
}

/* ============================================
   HELPERS
============================================ */

function getProjectImages(
  project
) {
  const values = [];

  const pushImage = (
    value,
    alt = ""
  ) => {
    if (!value) {
      return;
    }

    if (
      values.some(
        (image) =>
          image.url === value
      )
    ) {
      return;
    }

    values.push({
      url: value,
      alt,
    });
  };

  pushImage(
    project.cover_image_url ||
      project.cover_image ||
      project.image_url ||
      project.image,
    project.title
  );

  if (
    Array.isArray(
      project.images
    )
  ) {
    const ordered =
      [...project.images].sort(
        (a, b) => {
          const primaryA =
            a.is_primary ||
            a.is_cover
              ? 1
              : 0;

          const primaryB =
            b.is_primary ||
            b.is_cover
              ? 1
              : 0;

          if (
            primaryA !==
            primaryB
          ) {
            return (
              primaryB -
              primaryA
            );
          }

          return (
            Number(
              a.display_order ??
              a.sort_order ??
              999
            ) -
            Number(
              b.display_order ??
              b.sort_order ??
              999
            )
          );
        }
      );

    ordered.forEach(
      (image) => {
        pushImage(
          image.url ||
            image.image_url ||
            image.src,
          image.alt_text ||
            image.alt ||
            project.title
        );
      }
    );
  }

  return values;
}

function getTechnologies(
  project
) {
  return Array.isArray(
    project.technologies
  )
    ? project.technologies
    : [];
}

function getTechnologyName(
  technology
) {
  if (
    typeof technology ===
    "string"
  ) {
    return technology;
  }

  return (
    technology?.name ||
    technology?.title ||
    ""
  );
}

function getDescription(
  project
) {
  return (
    project.short_description ||
    project.description_short ||
    project.summary ||
    project.description ||
    "Desarrollo de una solución digital orientada a necesidades reales de negocio."
  );
}

function getLongDescription(
  project
) {
  return (
    project.description ||
    project.long_description ||
    project.full_description ||
    project.short_description ||
    project.summary ||
    "La información detallada de este proyecto será publicada próximamente."
  );
}

function isFeatured(
  project
) {
  return (
    project.is_featured ===
      true ||
    project.featured ===
      true
  );
}

function isConfidential(
  project
) {
  return (
    project.is_confidential ===
      true ||
    project.project_type ===
      "CONFIDENTIAL" ||
    project.type ===
      "CONFIDENTIAL"
  );
}

export default ProjectDetailPage;
