import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicProjects } from "../../services/projectsService";

function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicProjects();

        const projectList =
          data?.projects ||
          data?.data ||
          (Array.isArray(data) ? data : []);

        setProjects(projectList);
      } catch (err) {
        console.error("Error cargando proyectos:", err);

        setError(
          "No fue posible cargar los proyectos en este momento."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const featuredProjects = useMemo(() => {
    if (!projects.length) {
      return [];
    }

    const featured = projects.filter(
      (project) =>
        project.is_featured === true ||
        project.featured === true
    );

    if (featured.length) {
      return featured.slice(0, 4);
    }

    return projects.slice(0, 4);
  }, [projects]);

  const mainProject = featuredProjects[0];

  const secondaryProjects = featuredProjects.slice(1, 4);

  return (
    <section
      id="proyectos"
      className="
        theme-section
        theme-border
        border-t
        py-24
        sm:py-28
      "
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.22em]
                theme-eyebrow
              "
            >
              Portafolio
            </p>

            <h2
              className="
                mt-4
                text-3xl
                font-semibold
                tracking-[-0.04em]
                theme-title
                sm:text-4xl
              "
            >
              Proyectos destacados
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                theme-text
                sm:text-base
              "
            >
              Soluciones digitales desarrolladas para resolver
              necesidades reales de negocio, automatización y
              operación.
            </p>
          </div>

          <Link
            to="/projects"
            className="
              inline-flex
              w-fit
              items-center
              gap-3
              rounded-xl
              border
              theme-btn-secondary
              px-5
              py-3
              text-sm
              font-medium
              transition-all
              duration-300
            "
          >
            Ver todos los proyectos
            <span>→</span>
          </Link>
        </div>

        {/* ESTADO DE CARGA */}
        {loading && (
          <ProjectsSkeleton />
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            className="
              mt-12
              rounded-2xl
              border
              theme-card
              p-8
              text-sm
              theme-text
            "
          >
            {error}
          </div>
        )}

        {/* SIN PROYECTOS */}
        {!loading &&
          !error &&
          featuredProjects.length === 0 && (
            <div
              className="
                mt-12
                rounded-2xl
                border
                theme-card
                p-8
              "
            >
              <p className="theme-text">
                Próximamente se publicarán proyectos en esta sección.
              </p>
            </div>
          )}

        {/* PROYECTOS */}
        {!loading &&
          !error &&
          mainProject && (
            <div className="mt-12">
              <MainProjectCard project={mainProject} />

              {secondaryProjects.length > 0 && (
                <div
                  className="
                    mt-5
                    grid
                    gap-5
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  {secondaryProjects.map((project) => (
                    <SecondaryProjectCard
                      key={project.id}
                      project={project}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </section>
  );
}

function MainProjectCard({ project }) {
  const image = getProjectImage(project);

  const technologies = getTechnologies(project);

  return (
    <article
      className="
        group
        grid
        overflow-hidden
        rounded-[1.75rem]
        border
        theme-card-hover
        lg:grid-cols-[1.35fr_0.65fr]
      "
    >
      {/* VISUAL */}
      <div
        className="
          relative
          min-h-[320px]
          overflow-hidden
          border-b
          border-[var(--theme-border)]
          lg:min-h-[470px]
          lg:border-b-0
          lg:border-r
        lg:border-[var(--theme-border)]
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
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <ProjectVisualFallback
            title={project.title}
          />
        )}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/50
            via-transparent
            to-transparent
          "
        />

        {isFeatured(project) && (
          <div
            className="
              absolute
              left-5
              top-5
              rounded-full
              border
              border-white/10
              bg-black/70
              px-3
              py-1.5
              text-[10px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-neutral-300
              backdrop-blur
            "
          >
            Proyecto destacado
          </div>
        )}
      </div>

      {/* INFORMACIÓN */}
      <div
        className="
          flex
          flex-col
          justify-between
          p-7
          sm:p-9
          lg:p-10
        "
      >
        <div>
          <ProjectType project={project} />

          <h3
            className="
              mt-5
              text-2xl
              font-semibold
              tracking-[-0.035em]
              theme-title
              sm:text-3xl
            "
          >
            {project.title}
          </h3>

          <p
            className="
              mt-5
              text-sm
              leading-7
              theme-text
            "
          >
            {getDescription(project)}
          </p>

          {technologies.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              {technologies
                .slice(0, 6)
                .map((technology) => (
                  <TechnologyBadge
                    key={
                      technology.id ||
                      technology.name ||
                      technology
                    }
                    technology={technology}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <Link
            to={`/projects/${project.slug}`}
            className="
              inline-flex
              items-center
              gap-3
              text-sm
              font-semibold
              theme-link
              transition
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

function SecondaryProjectCard({ project }) {
  const image = getProjectImage(project);

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        theme-card-hover
        transition-all
        duration-300
        hover:-translate-y-1
      "
    >
      <div
        className="
          relative
          aspect-[16/9]
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
              duration-500
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <ProjectVisualFallback
            title={project.title}
            small
          />
        )}
      </div>

      <div className="p-6">
        <ProjectType project={project} />

        <h3
          className="
            mt-3
            text-lg
            font-semibold
            tracking-[-0.025em]
            theme-title
          "
        >
          {project.title}
        </h3>

        <p
          className="
            mt-3
            line-clamp-2
            text-sm
            leading-6
            theme-text
          "
        >
          {getDescription(project)}
        </p>

        <Link
          to={`/projects/${project.slug}`}
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            text-xs
            font-semibold
            theme-link
            transition
          "
        >
          Ver proyecto
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

function ProjectVisualFallback({
  title,
  small = false,
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
        theme-card
      "
    >
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[300px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[80px]
        "
      />

      <div
        className="
          absolute
          inset-6
          rounded-2xl
          border
          border-[var(--theme-border)]
        "
      />

      <div
        className="
          relative
          z-10
          max-w-xs
          px-8
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--theme-border)]
            bg-[var(--theme-bg-secondary)]
            text-lg
            font-semibold
            theme-accent
          "
        >
          {"</>"}
        </div>

        {!small && (
          <p
            className="
              mt-5
              text-sm
              font-medium
              theme-muted
            "
          >
            {title}
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectType({ project }) {
  const confidential =
    project.is_confidential === true ||
    project.project_type === "CONFIDENTIAL" ||
    project.type === "CONFIDENTIAL";

  return (
    <p
      className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.18em]
        theme-eyebrow
      "
    >
      {confidential
        ? "Proyecto confidencial"
        : "Proyecto"}
    </p>
  );
}

function TechnologyBadge({ technology }) {
  const name =
    typeof technology === "string"
      ? technology
      : technology.name;

  if (!name) {
    return null;
  }

  return (
    <span
      className="
        rounded-lg
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        px-3
        py-1.5
        text-[11px]
        font-medium
        theme-text
      "
    >
      {name}
    </span>
  );
}

function getProjectImage(project) {
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
    project.images?.[0]?.url ||
    project.images?.[0]?.image_url ||
    null
  );
}

function getTechnologies(project) {
  if (!Array.isArray(project.technologies)) {
    return [];
  }

  return project.technologies;
}

function getDescription(project) {
  return (
    project.short_description ||
    project.description_short ||
    project.summary ||
    project.description ||
    "Desarrollo de una solución digital orientada a necesidades reales de negocio."
  );
}

function isFeatured(project) {
  return (
    project.is_featured === true ||
    project.featured === true
  );
}

function ProjectsSkeleton() {
  return (
    <div className="mt-12">
      <div
        className="
          grid
          min-h-[470px]
          animate-pulse
          overflow-hidden
          rounded-[1.75rem]
          border
          theme-card
          lg:grid-cols-[1.35fr_0.65fr]
        "
      >
        <div className="bg-[var(--theme-bg-secondary)]" />

        <div className="p-10">
          <div className="h-3 w-28 rounded bg-[var(--theme-border-strong)]" />
          <div className="mt-6 h-8 w-3/4 rounded bg-[var(--theme-border-strong)]" />
          <div className="mt-6 h-3 w-full rounded bg-[var(--theme-border)]" />
          <div className="mt-2 h-3 w-4/5 rounded bg-[var(--theme-border)]" />
        </div>
      </div>
    </div>
  );
}

export default ProjectsSection;