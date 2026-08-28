import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPublicTechnologies,
} from "../../services/technologiesService";

function TechnologiesSection() {
  const [technologies, setTechnologies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicTechnologies();

        const list =
          data?.technologies ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        const activeTechnologies =
          list.filter(
            (technology) =>
              technology.is_active !== false
          );

        setTechnologies(
          activeTechnologies
        );
      } catch (error) {
        console.error(
          "Error cargando tecnologías:",
          error
        );

        setError(
          "No fue posible cargar las tecnologías."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTechnologies();
  }, []);

  const technologyGroups =
    useMemo(() => {
      const groups = {
        frontend: [],
        backend: [],
        database: [],
        tools: [],
      };

      technologies.forEach(
        (technology) => {
          const group =
            getTechnologyGroup(
              technology
            );

          groups[group].push(
            technology
          );
        }
      );

      return groups;
    }, [technologies]);

  return (
    <section
      id="tecnologias"
      className="
        theme-section
        theme-border
        border-t
        py-24
        sm:py-28
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
        {/* HEADER */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.75fr_1.25fr]
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
              Stack tecnológico
            </p>

            <h2
              className="
                mt-4
                max-w-lg
                text-3xl
                font-semibold
                tracking-[-0.04em]
                theme-title
                sm:text-4xl
              "
            >
              Tecnologías con las que construyo
            </h2>

            <p
              className="
                mt-5
                max-w-md
                text-sm
                leading-7
                theme-text
                sm:text-base
              "
            >
              Herramientas y tecnologías
              utilizadas en el desarrollo de
              aplicaciones web, plataformas
              empresariales y soluciones
              Full Stack.
            </p>
          </div>

          {/* TECNOLOGÍAS */}

          <div>
            {loading && (
              <TechnologiesSkeleton />
            )}

            {!loading && error && (
              <div
                className="
                  rounded-2xl
                  border
                  theme-card
                  p-6
                  text-sm
                  theme-text
                "
              >
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              technologies.length ===
                0 && (
                <div
                  className="
                    rounded-2xl
                    border
                    theme-card
                    p-6
                    text-sm
                    theme-text
                  "
                >
                  No hay tecnologías
                  publicadas todavía.
                </div>
              )}

            {!loading &&
              !error &&
              technologies.length >
                0 && (
                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  <TechnologyGroup
                    title="Frontend"
                    technologies={
                      technologyGroups.frontend
                    }
                  />

                  <TechnologyGroup
                    title="Backend"
                    technologies={
                      technologyGroups.backend
                    }
                  />

                  <TechnologyGroup
                    title="Datos, DB & Cloud"
                    technologies={
                      technologyGroups.database
                    }
                  />

                  <TechnologyGroup
                    title="Herramientas & DevOps"
                    technologies={
                      technologyGroups.tools
                    }
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TechnologyGroup({
  title,
  technologies,
}) {
  if (!technologies.length) {
    return null;
  }

  return (
    <article
      className="
        group
        min-h-[210px]
        rounded-2xl
        border
        theme-card-hover
        p-6
        transition-all
        duration-300
      "
    >
      <div
        className="
          flex
          items-center
        "
      >
        <h3
          className="
            text-sm
            font-semibold
            theme-title
          "
        >
          {title}
        </h3>
      </div>

      <div
        className="
          mt-8
          flex
          flex-wrap
          gap-2
        "
      >
        {technologies.map(
          (technology) => (
            <TechnologyBadge
              key={
                technology.id ||
                technology.name
              }
              technology={
                technology
              }
            />
          )
        )}
      </div>
    </article>
  );
}

function TechnologyBadge({
  technology,
}) {
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
        inline-flex
        items-center
        rounded-lg
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        px-3
        py-2
        text-xs
        font-medium
        theme-text
        transition-colors
        duration-300
        hover:border-[var(--theme-accent)]
        hover:text-[var(--theme-accent)]
      "
    >
      {name}
    </span>
  );
}

function getTechnologyGroup(
  technology
) {
  const explicitCategory = (
    technology.category ||
    technology.type ||
    technology.group ||
    ""
  )
    .toString()
    .toLowerCase();

  if (
    explicitCategory.includes(
      "front"
    )
  ) {
    return "frontend";
  }

  if (
    explicitCategory.includes(
      "back"
    )
  ) {
    return "backend";
  }

  if (
    explicitCategory.includes(
      "database"
    ) ||
    explicitCategory.includes(
      "cloud"
    ) ||
    explicitCategory.includes(
      "data"
    ) ||
    explicitCategory.includes(
      "sql"
    )
  ) {
    return "database";
  }

  if (
    explicitCategory.includes(
      "tool"
    ) ||
    explicitCategory.includes(
      "devops"
    ) ||
    explicitCategory.includes(
      "design"
    ) ||
    explicitCategory.includes(
      "herramient"
    )
  ) {
    return "tools";
  }

  const name = (
    technology.name || ""
  ).toLowerCase();

  const frontend = [
    "react",
    "javascript",
    "typescript",
    "tailwind",
    "html",
    "css",
    "next",
    "vite",
    "anime",
  ];

  const backend = [
    "node",
    "express",
    "nestjs",
    "api",
    "jwt",
  ];

  const database = [
    "postgres",
    "postgresql",
    "mongodb",
    "mongo",
    "sql",
    "mysql",
    "supabase",
    "railway",
    "vercel",
  ];

  const tools = [
    "github",
    "git",
    "docker",
    "postman",
    "insomnia",
    "dbeaver",
    "figma",
  ];

  if (
    frontend.some((item) =>
      name.includes(item)
    )
  ) {
    return "frontend";
  }

  if (
    backend.some((item) =>
      name.includes(item)
    )
  ) {
    return "backend";
  }

  if (
    database.some((item) =>
      name.includes(item)
    )
  ) {
    return "database";
  }

  if (
    tools.some((item) =>
      name.includes(item)
    )
  ) {
    return "tools";
  }

  return "tools";
}

function TechnologiesSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        sm:grid-cols-2
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              min-h-[210px]
              animate-pulse
              rounded-2xl
              border
              theme-card
              p-6
            "
          >
            <div
              className="
                h-4
                w-24
                rounded
                bg-[var(--theme-border-strong)]
              "
            />

            <div
              className="
                mt-8
                flex
                gap-2
              "
            >
              <div className="h-8 w-20 rounded-lg bg-[var(--theme-border)]" />
              <div className="h-8 w-24 rounded-lg bg-[var(--theme-border)]" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default TechnologiesSection;