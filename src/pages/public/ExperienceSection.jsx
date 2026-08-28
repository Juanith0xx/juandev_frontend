import { useEffect, useMemo, useState } from "react";

import {
  getPublicExperiences,
} from "../../services/experiencesService";

function ExperienceSection() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicExperiences();

        const list =
          data?.experiences ||
          data?.data ||
          (Array.isArray(data) ? data : []);

        setExperiences(list);
      } catch (error) {
        console.error(
          "Error cargando experiencias:",
          error
        );

        setError(
          "No fue posible cargar la experiencia profesional."
        );
      } finally {
        setLoading(false);
      }
    };

    loadExperiences();
  }, []);

  const orderedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const dateA = new Date(
        a.start_date ||
          a.started_at ||
          0
      );

      const dateB = new Date(
        b.start_date ||
          b.started_at ||
          0
      );

      return dateB - dateA;
    });
  }, [experiences]);

  return (
    <section
      id="experiencia"
      className="
        theme-page
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
            lg:grid-cols-[0.7fr_1.3fr]
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
              Trayectoria
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
              Experiencia profesional
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
              Experiencia desarrollando soluciones web,
              plataformas empresariales e integraciones
              orientadas a necesidades reales.
            </p>
          </div>

          {/* CONTENIDO */}

          <div>
            {loading && (
              <ExperienceSkeleton />
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
              orderedExperiences.length === 0 && (
                <div
                  className="
                    rounded-2xl
                    border
                    theme-card
                    p-6
                    theme-text
                  "
                >
                  Próximamente se publicará la experiencia
                  profesional.
                </div>
              )}

            {!loading &&
              !error &&
              orderedExperiences.length > 0 && (
                <div>
                  {orderedExperiences.map(
                    (experience, index) => (
                      <ExperienceItem
                        key={
                          experience.id ||
                          `${experience.title}-${index}`
                        }
                        experience={experience}
                        last={
                          index ===
                          orderedExperiences.length - 1
                        }
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({
  experience,
  last,
}) {
  const period =
    getExperiencePeriod(experience);

  const company =
    getCompanyName(experience);

  return (
    <article
      className={`
        relative
        grid
        gap-5
        py-8
        sm:grid-cols-[160px_1fr]

        ${
          !last
            ? "border-b border-[var(--theme-border)]"
            : ""
        }
      `}
    >
      {/* FECHA */}

      <div>
        <p
          className="
            text-xs
            font-medium
            theme-accent
          "
        >
          {period}
        </p>
      </div>

      {/* EXPERIENCIA */}

      <div>
        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-semibold
                tracking-[-0.025em]
                theme-title
              "
            >
              {experience.title ||
                experience.position ||
                experience.role ||
                "Desarrollador Full Stack"}
            </h3>

            {company && (
              <p
                className="
                  mt-1
                  text-sm
                  theme-muted
                "
              >
                {company}
              </p>
            )}
          </div>

          {experience.is_current && (
            <span
              className="
                w-fit
                rounded-full
                border
                border-[var(--theme-accent)]
                bg-[var(--theme-accent-soft)]
                px-3
                py-1
                text-[10px]
                font-medium
                uppercase
                tracking-[0.15em]
                theme-accent
              "
            >
              Actual
            </span>
          )}
        </div>

        {experience.description && (
          <p
            className="
              mt-5
              max-w-2xl
              text-sm
              leading-7
              theme-text
            "
          >
            {experience.description}
          </p>
        )}

        {Array.isArray(experience.technologies) &&
          experience.technologies.length > 0 && (
            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >
              {experience.technologies.map(
                (technology) => (
                  <span
                    key={
                      technology.id ||
                      technology.name ||
                      technology
                    }
                    className="
                      rounded-lg
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-secondary)]
                      px-3
                      py-1.5
                      text-[11px]
                      theme-muted
                    "
                  >
                    {typeof technology ===
                    "string"
                      ? technology
                      : technology.name}
                  </span>
                )
              )}
            </div>
          )}
      </div>
    </article>
  );
}

function getCompanyName(experience) {
  if (
    experience.is_confidential === true ||
    experience.company_visible === false
  ) {
    return "Proyecto confidencial";
  }

  return (
    experience.company_name ||
    experience.company ||
    experience.organization ||
    ""
  );
}

function getExperiencePeriod(experience) {
  const start =
    experience.start_date ||
    experience.started_at;

  const end =
    experience.end_date ||
    experience.ended_at;

  if (!start) {
    return "";
  }

  const startYear =
    new Date(start).getFullYear();

  if (
    experience.is_current ||
    !end
  ) {
    return `${startYear} — Actualidad`;
  }

  const endYear =
    new Date(end).getFullYear();

  if (startYear === endYear) {
    return `${startYear}`;
  }

  return `${startYear} — ${endYear}`;
}

function ExperienceSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            grid
            gap-5
            border-b
            border-[var(--theme-border)]
            py-8
            sm:grid-cols-[160px_1fr]
          "
        >
          <div>
            <div
              className="
                h-3
                w-24
                rounded
                bg-[var(--theme-border-strong)]
              "
            />
          </div>

          <div>
            <div
              className="
                h-5
                w-56
                rounded
                bg-[var(--theme-border-strong)]
              "
            />

            <div
              className="
                mt-3
                h-3
                w-32
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-6
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
                w-4/5
                rounded
                bg-[var(--theme-border)]
              "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExperienceSection;