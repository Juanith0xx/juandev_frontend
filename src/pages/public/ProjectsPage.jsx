import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Seo from "../../components/common/Seo";

import {
  buildProjectsSchema,
} from "../../config/site";

import {
  getPublicProjects,
} from "../../services/projectsService";

const FILTERS = [
  {
    value: "ALL",
    label: "Todos",
  },
  {
    value: "FEATURED",
    label: "Destacados",
  },
  {
    value: "PUBLIC",
    label: "Públicos",
  },
  {
    value: "CONFIDENTIAL",
    label: "Confidenciales",
  },
];

function ProjectsPage() {
  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("ALL");

  const [
    search,
    setSearch,
  ] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicProjects();

        const list =
          data?.projects ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        setProjects(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando proyectos:",
          error
        );

        setError(
          "No fue posible cargar los proyectos en este momento."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const visibleProjects =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const confidential =
            isConfidential(
              project
            );

          const featured =
            isFeatured(
              project
            );

          if (
            filter ===
              "FEATURED" &&
            !featured
          ) {
            return false;
          }

          if (
            filter ===
              "PUBLIC" &&
            confidential
          ) {
            return false;
          }

          if (
            filter ===
              "CONFIDENTIAL" &&
            !confidential
          ) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const searchable = [
            project.title,
            getDescription(
              project
            ),
            ...getTechnologies(
              project
            ).map(
              (technology) =>
                getTechnologyName(
                  technology
                )
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            normalizedSearch
          );
        }
      );
    }, [
      projects,
      filter,
      search,
    ]);

  const counts =
    useMemo(() => {
      return {
        all: projects.length,

        featured:
          projects.filter(
            isFeatured
          ).length,

        confidential:
          projects.filter(
            isConfidential
          ).length,
      };
    }, [projects]);

  return (
    <div
      className="
        theme-page
        min-h-screen
      "
    >
      <Seo
        title="Proyectos"
        description="Selección de proyectos, plataformas web, integraciones y soluciones Full Stack desarrolladas por Juan Estay."
        canonicalPath="/projects"
        structuredData={
          buildProjectsSchema()
        }
      />

      <Navbar />

      <main>
        {/* ============================================
            HERO
        ============================================ */}

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
              h-[620px]
              w-[620px]
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
              to="/"
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

              Volver al inicio
            </Link>

            <div
              className="
                mt-12
                grid
                gap-10
                lg:grid-cols-[1.1fr_0.9fr]
                lg:items-end
              "
            >
              <div>
                <p
                  className="
                    theme-eyebrow
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                  "
                >
                  Portafolio
                </p>

                <h1
                  className="
                    theme-title
                    mt-5
                    max-w-4xl
                    text-4xl
                    font-semibold
                    tracking-[-0.055em]
                    sm:text-5xl
                    lg:text-6xl
                  "
                >
                  Proyectos y soluciones
                  digitales
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
                "
              >
                Una selección de
                plataformas, aplicaciones
                e implementaciones
                desarrolladas para resolver
                necesidades reales de
                negocio y operación.
              </p>
            </div>

            {/* SUMMARY */}

            {!loading &&
              !error && (
                <div
                  className="
                    mt-12
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <SummaryBadge
                    value={
                      counts.all
                    }
                    label="proyectos"
                  />

                  <SummaryBadge
                    value={
                      counts.featured
                    }
                    label="destacados"
                  />

                  {counts.confidential >
                    0 && (
                    <SummaryBadge
                      value={
                        counts.confidential
                      }
                      label="confidenciales"
                    />
                  )}
                </div>
              )}
          </div>
        </section>

        {/* ============================================
            CATALOG
        ============================================ */}

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
            {/* TOOLBAR */}

            <div
              className="
                flex
                flex-col
                gap-5
                xl:flex-row
                xl:items-center
                xl:justify-between
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {FILTERS.map(
                  (option) => {
                    const active =
                      filter ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setFilter(
                            option.value
                          )
                        }
                        className={`
                          rounded-xl
                          border
                          px-4
                          py-2.5
                          text-xs
                          font-semibold
                          transition-all
                          duration-300

                          ${
                            active
                              ? `
                                border-[var(--theme-accent)]
                                bg-[var(--theme-accent-soft)]
                                text-[var(--theme-accent)]
                              `
                              : `
                                border-[var(--theme-border)]
                                bg-[var(--theme-bg-card)]
                                text-[var(--theme-text-secondary)]
                                hover:border-[var(--theme-accent)]
                                hover:text-[var(--theme-accent)]
                              `
                          }
                        `}
                      >
                        {
                          option.label
                        }
                      </button>
                    );
                  }
                )}
              </div>

              <div
                className="
                  relative
                  w-full
                  xl:max-w-sm
                "
              >
                <SearchIcon />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Buscar proyecto o tecnología"
                  className="
                    theme-input
                    w-full
                    rounded-xl
                    border
                    py-3
                    pl-11
                    pr-4
                    text-sm
                  "
                />
              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <ProjectsGridSkeleton />
            )}

            {/* ERROR */}

            {!loading &&
              error && (
                <div
                  className="
                    theme-card
                    mt-10
                    rounded-2xl
                    border
                    p-7
                  "
                >
                  <p
                    className="
                      text-sm
                      text-[var(--theme-danger)]
                    "
                  >
                    {error}
                  </p>
                </div>
              )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              visibleProjects.length ===
                0 && (
                <div
                  className="
                    theme-card
                    mt-10
                    rounded-2xl
                    border
                    px-6
                    py-14
                    text-center
                  "
                >
                  <p
                    className="
                      theme-title
                      text-lg
                      font-semibold
                    "
                  >
                    No encontramos
                    proyectos.
                  </p>

                  <p
                    className="
                      theme-muted
                      mx-auto
                      mt-3
                      max-w-md
                      text-sm
                      leading-7
                    "
                  >
                    Prueba con otro
                    filtro o término de
                    búsqueda.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter(
                        "ALL"
                      );
                      setSearch("");
                    }}
                    className="
                      theme-btn-accent
                      mt-6
                      rounded-xl
                      px-5
                      py-3
                      text-sm
                      font-semibold
                    "
                  >
                    Ver todos
                  </button>
                </div>
              )}

            {/* PROJECTS */}

            {!loading &&
              !error &&
              visibleProjects.length >
                0 && (
                <div
                  className="
                    mt-10
                    grid
                    gap-5
                    md:grid-cols-2
                    xl:grid-cols-3
                  "
                >
                  {visibleProjects.map(
                    (project) => (
                      <ProjectCard
                        key={
                          project.id ||
                          project.slug
                        }
                        project={
                          project
                        }
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </section>

        {/* ============================================
            CTA
        ============================================ */}

        <section
          className="
            theme-page
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
                  ¿Tienes una idea?
                </p>

                <h2
                  className="
                    theme-title
                    mt-4
                    text-2xl
                    font-semibold
                    tracking-[-0.04em]
                    sm:text-3xl
                  "
                >
                  Conversemos sobre tu
                  próximo proyecto.
                </h2>
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
                Contactar
                <span
                  className="ml-3"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ============================================
   PROJECT CARD
============================================ */

function ProjectCard({
  project,
}) {
  const confidential =
    isConfidential(project);

  const image =
    confidential
      ? null
      : getProjectImage(
          project
        );

  const technologies =
    getTechnologies(
      project
    ).slice(0, 5);

  return (
    <article
      className="
        theme-card-hover
        group
        flex
        min-h-full
        flex-col
        overflow-hidden
        rounded-[1.5rem]
        border
      "
    >
      {/* VISUAL */}

      <div
        className="
          relative
          aspect-[16/10]
          overflow-hidden
          border-b
          border-[var(--theme-border)]
        "
      >
        {image ? (
          <img
            src={image}
            alt={project.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <ProjectFallback
            confidential={
              confidential
            }
          />
        )}

        <div
          className="
            absolute
            left-4
            top-4
            flex
            flex-wrap
            gap-2
          "
        >
          {isFeatured(
            project
          ) && (
            <span
              className="
                rounded-full
                border
                border-[var(--theme-accent)]
                bg-[var(--theme-bg-card)]
                px-3
                py-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[var(--theme-accent)]
                shadow-sm
              "
            >
              Destacado
            </span>
          )}

          {confidential && (
            <span
              className="
                rounded-full
                border
                border-[var(--theme-border-strong)]
                bg-[var(--theme-bg-card)]
                px-3
                py-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[var(--theme-text-secondary)]
                shadow-sm
              "
            >
              Confidencial
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-6
        "
      >
        <p
          className="
            theme-eyebrow
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
          "
        >
          {confidential
            ? "Proyecto confidencial"
            : "Proyecto"}
        </p>

        <h2
          className="
            theme-title
            mt-3
            text-xl
            font-semibold
            tracking-[-0.03em]
          "
        >
          {project.title}
        </h2>

        <p
          className="
            theme-text
            mt-4
            line-clamp-3
            text-sm
            leading-7
          "
        >
          {getDescription(
            project
          )}
        </p>

        {technologies.length >
          0 && (
          <div
            className="
              mt-6
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
                      bg-[var(--theme-bg-secondary)]
                      px-3
                      py-1.5
                      text-[10px]
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

        <div
          className="
            mt-auto
            pt-7
          "
        >
          <Link
            to={`/projects/${project.slug}`}
            className="
              theme-link
              inline-flex
              items-center
              gap-3
              text-sm
              font-semibold
            "
          >
            Ver proyecto

            <span
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ============================================
   PROJECT FALLBACK
============================================ */

function ProjectFallback({
  confidential,
}) {
  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-[var(--theme-bg-secondary)]
      "
    >
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[260px]
          w-[260px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[70px]
        "
      />

      <div
        className="
          relative
          z-10
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          text-lg
          font-semibold
          text-[var(--theme-accent)]
        "
      >
        {confidential
          ? "•••"
          : "</>"}
      </div>
    </div>
  );
}

/* ============================================
   SUMMARY
============================================ */

function SummaryBadge({
  value,
  label,
}) {
  return (
    <div
      className="
        theme-card
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-4
        py-2
      "
    >
      <span
        className="
          theme-accent
          text-xs
          font-bold
        "
      >
        {value}
      </span>

      <span
        className="
          theme-muted
          text-xs
        "
      >
        {label}
      </span>
    </div>
  );
}

/* ============================================
   SKELETON
============================================ */

function ProjectsGridSkeleton() {
  return (
    <div
      className="
        mt-10
        grid
        gap-5
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {[1, 2, 3, 4, 5, 6].map(
        (item) => (
          <div
            key={item}
            className="
              theme-card
              animate-pulse
              overflow-hidden
              rounded-[1.5rem]
              border
            "
          >
            <div
              className="
                aspect-[16/10]
                bg-[var(--theme-border)]
              "
            />

            <div
              className="p-6"
            >
              <div
                className="
                  h-3
                  w-24
                  rounded
                  bg-[var(--theme-border)]
                "
              />

              <div
                className="
                  mt-4
                  h-6
                  w-4/5
                  rounded
                  bg-[var(--theme-border-strong)]
                "
              />

              <div
                className="
                  mt-5
                  h-3
                  w-full
                  rounded
                  bg-[var(--theme-border)]
                "
              />

              <div
                className="
                  mt-2
                  h-3
                  w-3/4
                  rounded
                  bg-[var(--theme-border)]
                "
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ============================================
   SEARCH ICON
============================================ */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        h-4
        w-4
        -translate-y-1/2
        text-[var(--theme-text-muted)]
      "
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6"
      />

      <path d="m16 16 4 4" />
    </svg>
  );
}

/* ============================================
   HELPERS
============================================ */

function getProjectImage(
  project
) {
  return (
    project.cover_image_url ||
    project.cover_image ||
    project.image_url ||
    project.image ||
    project.images?.find(
      (image) =>
        image.is_primary ||
        image.is_cover
    )?.url ||
    project.images?.find(
      (image) =>
        image.is_primary ||
        image.is_cover
    )?.image_url ||
    project.images?.[0]?.url ||
    project.images?.[0]
      ?.image_url ||
    null
  );
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

export default ProjectsPage;
