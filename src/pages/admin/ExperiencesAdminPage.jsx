import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAdminExperience,
  deleteAdminExperience,
  getAdminExperiences,
  updateAdminExperience,
} from "../../services/experiencesAdminService";

/* ============================================
   INITIAL FORM
============================================ */

const INITIAL_FORM = {
  company_name: "",
  position: "",
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  is_confidential: false,
  company_visible: true,
  display_order: 0,
  is_published: true,
};

/* ============================================
   PAGE
============================================ */

function ExperiencesAdminPage() {
  const [experiences, setExperiences] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    publicationFilter,
    setPublicationFilter,
  ] = useState("ALL");

  const [
    visibilityFilter,
    setVisibilityFilter,
  ] = useState("ALL");

  const [
    modalMode,
    setModalMode,
  ] = useState(null);

  const [
    selectedExperience,
    setSelectedExperience,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadExperiences =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminExperiences();

        setExperiences(
          Array.isArray(
            data?.experiences
          )
            ? data.experiences
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando experiencias:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar la experiencia profesional."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadExperiences();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      return {
        total:
          experiences.length,

        published:
          experiences.filter(
            (item) =>
              item.is_published
          ).length,

        current:
          experiences.filter(
            (item) =>
              item.is_current
          ).length,

        confidential:
          experiences.filter(
            (item) =>
              item.is_confidential
          ).length,
      };
    }, [experiences]);

  /* ============================================
     FILTERS
  ============================================ */

  const filteredExperiences =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return experiences.filter(
        (experience) => {
          const publicationMatches =
            publicationFilter ===
              "ALL" ||
            (
              publicationFilter ===
                "PUBLISHED" &&
              experience.is_published
            ) ||
            (
              publicationFilter ===
                "DRAFT" &&
              !experience.is_published
            );

          if (
            !publicationMatches
          ) {
            return false;
          }

          const visibilityMatches =
            visibilityFilter ===
              "ALL" ||
            (
              visibilityFilter ===
                "CURRENT" &&
              experience.is_current
            ) ||
            (
              visibilityFilter ===
                "CONFIDENTIAL" &&
              experience.is_confidential
            ) ||
            (
              visibilityFilter ===
                "PUBLIC" &&
              !experience.is_confidential
            );

          if (!visibilityMatches) {
            return false;
          }

          if (!term) {
            return true;
          }

          return [
            experience.company_name,
            experience.position,
            experience.title,
            experience.description,
            experience.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term);
        }
      );
    }, [
      experiences,
      search,
      publicationFilter,
      visibilityFilter,
    ]);

  const openCreate = () => {
    setSelectedExperience(
      null
    );

    setModalMode("create");
  };

  const openEdit = (
    experience
  ) => {
    setSelectedExperience(
      experience
    );

    setModalMode("edit");
  };

  const closeModal = () => {
    setSelectedExperience(
      null
    );

    setModalMode(null);
  };

  return (
    <div className="min-h-full">
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        className="
          flex
          flex-col
          gap-6
          border-b
          border-[var(--theme-border)]
          pb-8
          xl:flex-row
          xl:items-end
          xl:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--theme-text-secondary)]
            "
          >
            Trayectoria
          </p>

          <h1
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-[var(--theme-text-primary)]
            "
          >
            Experiencia
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-[var(--theme-text-secondary)]
            "
          >
            Administra la experiencia
            profesional que se muestra
            en la línea de tiempo del
            portafolio.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          <button
            type="button"
            onClick={
              loadExperiences
            }
            disabled={loading}
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              px-5
              py-3
              text-sm
              font-medium
              text-[var(--theme-text-primary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:bg-[var(--theme-accent-soft)]
              hover:text-[var(--theme-text-primary)]
              disabled:opacity-40
            "
          >
            {loading
              ? "Actualizando..."
              : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="
              rounded-xl
              bg-[var(--theme-accent)]
              px-5
              py-3
              text-sm
              font-semibold
              text-[var(--theme-bg-page)]
              transition
              hover:bg-[var(--theme-accent-hover)]
            "
          >
            Nueva experiencia
          </button>
        </div>
      </div>

      {/* ========================================
          METRICS
      ======================================== */}

      <div
        className="
          mt-8
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Total"
          value={metrics.total}
        />

        <MetricCard
          label="Publicadas"
          value={
            metrics.published
          }
        />

        <MetricCard
          label="Actuales"
          value={
            metrics.current
          }
        />

        <MetricCard
          label="Confidenciales"
          value={
            metrics.confidential
          }
        />
      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          p-4
        "
      >
        <div
          className="
            grid
            gap-3
            xl:grid-cols-[minmax(280px,1fr)_200px_200px]
          "
        >
          <div className="relative">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar cargo, empresa, ubicación..."
              className="
                w-full
                rounded-xl
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-secondary)]
                py-3
                pl-11
                pr-4
                text-sm
                text-[var(--theme-text-primary)]
                outline-none
                placeholder:text-[var(--theme-text-subtle)]
                focus:border-[var(--theme-accent)]/25
              "
            />
          </div>

          <select
            value={
              publicationFilter
            }
            onChange={(event) =>
              setPublicationFilter(
                event.target.value
              )
            }
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              focus:border-[var(--theme-accent)]/25
            "
          >
            <option value="ALL">
              Todas
            </option>

            <option value="PUBLISHED">
              Publicadas
            </option>

            <option value="DRAFT">
              Borradores
            </option>
          </select>

          <select
            value={
              visibilityFilter
            }
            onChange={(event) =>
              setVisibilityFilter(
                event.target.value
              )
            }
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              focus:border-[var(--theme-accent)]/25
            "
          >
            <option value="ALL">
              Todas las categorías
            </option>

            <option value="CURRENT">
              Actuales
            </option>

            <option value="PUBLIC">
              No confidenciales
            </option>

            <option value="CONFIDENTIAL">
              Confidenciales
            </option>
          </select>
        </div>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            px-5
            py-4
            text-sm
            text-[var(--theme-danger)]
          "
        >
          {error}
        </div>
      )}

      {/* ========================================
          LIST
      ======================================== */}

      <div className="mt-6">
        {loading ? (
          <ExperiencesSkeleton />
        ) : filteredExperiences.length ===
          0 ? (
          <EmptyState
            filtered={
              Boolean(search) ||
              publicationFilter !==
                "ALL" ||
              visibilityFilter !==
                "ALL"
            }
          />
        ) : (
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-card)]
            "
          >
            <div
              className="
                hidden
                overflow-x-auto
                lg:block
              "
            >
              <table
                className="
                  w-full
                  border-collapse
                  text-left
                "
              >
                <thead>
                  <tr
                    className="
                      border-b
                      border-[var(--theme-border)]
                      text-[10px]
                      uppercase
                      tracking-[0.16em]
                      text-[var(--theme-text-muted)]
                    "
                  >
                    <TableHeader>
                      Experiencia
                    </TableHeader>

                    <TableHeader>
                      Período
                    </TableHeader>

                    <TableHeader>
                      Visibilidad
                    </TableHeader>

                    <TableHeader>
                      Orden
                    </TableHeader>

                    <TableHeader right>
                      Acción
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredExperiences.map(
                    (experience) => (
                      <ExperienceRow
                        key={
                          experience.id
                        }
                        experience={
                          experience
                        }
                        onEdit={() =>
                          openEdit(
                            experience
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {filteredExperiences.map(
                (
                  experience,
                  index
                ) => (
                  <ExperienceMobileCard
                    key={
                      experience.id
                    }
                    experience={
                      experience
                    }
                    last={
                      index ===
                      filteredExperiences.length -
                        1
                    }
                    onEdit={() =>
                      openEdit(
                        experience
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          MODAL
      ======================================== */}

      {modalMode && (
        <ExperienceModal
          mode={modalMode}
          experience={
            selectedExperience
          }
          onClose={closeModal}
          onSaved={async () => {
            await loadExperiences();
            closeModal();
          }}
          onDeleted={async () => {
            await loadExperiences();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   TABLE ROW
============================================ */

function ExperienceRow({
  experience,
  onEdit,
}) {
  return (
    <tr
      className="
        border-b
        border-[var(--theme-border)]
        transition
        last:border-b-0
        hover:bg-[var(--theme-accent-soft)]
      "
    >
      <td className="px-6 py-5 align-top">
        <div
          className="
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-border)]
              text-xs
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {getInitials(
              experience.position
            )}
          </div>

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <p
                className="
                  max-w-[280px]
                  truncate
                  text-sm
                  font-semibold
                  text-[var(--theme-text-primary)]
                "
              >
                {experience.position}
              </p>

              {experience.is_current && (
                <CurrentBadge />
              )}
            </div>

            <p
              className="
                mt-1
                max-w-[300px]
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {getAdminCompanyLabel(
                experience
              )}
            </p>

            {experience.title && (
              <p
                className="
                  mt-2
                  max-w-[360px]
                  truncate
                  text-xs
                  text-[var(--theme-text-subtle)]
                "
              >
                {experience.title}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-5 align-top">
        <p
          className="
            text-sm
            text-[var(--theme-text-primary)]
          "
        >
          {formatPeriod(
            experience
          )}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          {experience.location ||
            "Sin ubicación"}
        </p>
      </td>

      <td className="px-6 py-5 align-top">
        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <PublicationBadge
            published={
              experience.is_published
            }
          />

          {experience.is_confidential && (
            <ConfidentialBadge />
          )}

          {!experience
            .is_confidential &&
            !experience
              .company_visible && (
              <SimpleBadge>
                Empresa oculta
              </SimpleBadge>
            )}
        </div>
      </td>

      <td
        className="
          px-6
          py-5
          align-top
          text-sm
          text-[var(--theme-text-secondary)]
        "
      >
        {Number(
          experience.display_order
        ) || 0}
      </td>

      <td
        className="
          px-6
          py-5
          text-right
          align-top
        "
      >
        <button
          type="button"
          onClick={onEdit}
          className="
            rounded-lg
            border
            border-[var(--theme-border)]
            px-4
            py-2
            text-xs
            font-medium
            text-[var(--theme-text-secondary)]
            transition
            hover:border-[var(--theme-border-strong)]
            hover:bg-[var(--theme-accent-soft)]
            hover:text-[var(--theme-text-primary)]
          "
        >
          Administrar
        </button>
      </td>
    </tr>
  );
}

/* ============================================
   MOBILE CARD
============================================ */

function ExperienceMobileCard({
  experience,
  last,
  onEdit,
}) {
  return (
    <article
      className={`
        p-5

        ${
          !last
            ? "border-b border-[var(--theme-border)]"
            : ""
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-[var(--theme-text-primary)]
              "
            >
              {experience.position}
            </p>

            {experience.is_current && (
              <CurrentBadge />
            )}
          </div>

          <p
            className="
              mt-1
              text-xs
              text-[var(--theme-text-muted)]
            "
          >
            {getAdminCompanyLabel(
              experience
            )}
          </p>
        </div>

        <PublicationBadge
          published={
            experience.is_published
          }
        />
      </div>

      <p
        className="
          mt-5
          text-sm
          text-[var(--theme-text-secondary)]
        "
      >
        {formatPeriod(
          experience
        )}
      </p>

      {experience.description && (
        <p
          className="
            mt-3
            text-xs
            leading-6
            text-[var(--theme-text-muted)]
          "
        >
          {truncateText(
            experience.description,
            150
          )}
        </p>
      )}

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          {experience.is_confidential && (
            <ConfidentialBadge />
          )}

          {!experience
            .is_confidential &&
            !experience
              .company_visible && (
              <SimpleBadge>
                Empresa oculta
              </SimpleBadge>
            )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="
            text-xs
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          Administrar →
        </button>
      </div>
    </article>
  );
}

/* ============================================
   MODAL
============================================ */

function ExperienceModal({
  mode,
  experience,
  onClose,
  onSaved,
  onDeleted,
}) {
  const editing =
    mode === "edit" &&
    Boolean(experience);

  const [form, setForm] =
    useState(
      editing
        ? experienceToForm(
            experience
          )
        : {
            ...INITIAL_FORM,
          }
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /* ============================================
     BODY LOCK
  ============================================ */

  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !deleteConfirm
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previous;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    deleteConfirm,
  ]);

  /* ============================================
     CHANGE
  ============================================ */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setForm((current) => {
      const next = {
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      /*
       * Experiencia actual:
       * el backend no permite end_date.
       */
      if (
        name === "is_current" &&
        checked
      ) {
        next.end_date = "";
      }

      /*
       * Confidencialidad:
       * la API pública ya protege la empresa,
       * y el frontend mantiene también
       * company_visible = false.
       */
      if (
        name ===
          "is_confidential" &&
        checked
      ) {
        next.company_visible =
          false;
      }

      return next;
    });
  };

  /* ============================================
     SAVE
  ============================================ */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!form.position.trim()) {
        setError(
          "El cargo o posición es obligatorio."
        );

        return;
      }

      if (!form.start_date) {
        setError(
          "La fecha de inicio es obligatoria."
        );

        return;
      }

      if (
        !form.is_current &&
        form.end_date &&
        form.end_date <
          form.start_date
      ) {
        setError(
          "La fecha de término no puede ser anterior a la fecha de inicio."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildPayload(form);

        if (editing) {
          await updateAdminExperience(
            experience.id,
            payload
          );
        } else {
          await createAdminExperience(
            payload
          );
        }

        await onSaved?.();
      } catch (error) {
        console.error(
          "Error guardando experiencia:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar la experiencia."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ============================================
     DELETE
  ============================================ */

  const handleDelete =
    async () => {
      if (!experience) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteAdminExperience(
          experience.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando experiencia:",
          error
        );

        setDeleteConfirm(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar la experiencia."
        );
      } finally {
        setDeleting(false);
      }
    };

  const confidential =
    Boolean(
      form.is_confidential
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleteConfirm
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          max-h-[94vh]
          w-full
          max-w-5xl
          overflow-y-auto
          rounded-[1.75rem]
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-elevated)]
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            border-b
            border-[var(--theme-border)]
            bg-[var(--theme-bg-elevated)]/95
            px-6
            py-5
            backdrop-blur
            sm:px-8
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-[var(--theme-text-muted)]
              "
            >
              {editing
                ? "Administración"
                : "Nueva trayectoria"}
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-semibold
                tracking-[-0.025em]
                text-[var(--theme-text-primary)]
              "
            >
              {editing
                ? "Editar experiencia"
                : "Crear experiencia"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--theme-border)]
              text-[var(--theme-text-secondary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="
            grid
            lg:grid-cols-[1.15fr_0.85fr]
          "
        >
          {/* LEFT */}

          <div
            className="
              border-b
              border-[var(--theme-border)]
              p-6
              sm:p-8
              lg:border-b-0
              lg:border-r
            "
          >
            <SectionTitle>
              Información profesional
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <Field
                label="Cargo / posición"
                name="position"
                value={
                  form.position
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Full Stack Developer"
              />

              <Field
                label="Empresa"
                name="company_name"
                value={
                  form.company_name
                }
                onChange={
                  handleChange
                }
                placeholder={
                  confidential
                    ? "Solo visible en Admin"
                    : "Empresa o cliente"
                }
              />
            </div>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <Field
                label="Título complementario"
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                placeholder="Proyecto / área / especialidad"
              />

              <Field
                label="Ubicación"
                name="location"
                value={
                  form.location
                }
                onChange={
                  handleChange
                }
                placeholder="Santiago, Chile / Remoto"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="experience-description"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Descripción
              </label>

              <textarea
                id="experience-description"
                name="description"
                rows="9"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe responsabilidades, alcance, resultados y tipo de trabajo realizado."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  px-4
                  py-3.5
                  text-sm
                  leading-7
                  text-[var(--theme-text-primary)]
                  outline-none
                  placeholder:text-[var(--theme-text-subtle)]
                  focus:border-[var(--theme-accent)]/25
                "
              />
            </div>

            <SectionTitle>
              Período
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <DateField
                label="Fecha de inicio"
                name="start_date"
                value={
                  form.start_date
                }
                onChange={
                  handleChange
                }
                required
              />

              <DateField
                label="Fecha de término"
                name="end_date"
                value={
                  form.end_date
                }
                onChange={
                  handleChange
                }
                disabled={
                  form.is_current
                }
              />
            </div>

            <div className="mt-4">
              <ToggleCard
                name="is_current"
                checked={
                  form.is_current
                }
                onChange={
                  handleChange
                }
                title="Experiencia actual"
                description="Marca esta opción si esta experiencia continúa vigente. La fecha de término quedará vacía."
              />
            </div>

            <SectionTitle>
              Privacidad
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              <ToggleCard
                name="is_confidential"
                checked={
                  form.is_confidential
                }
                onChange={
                  handleChange
                }
                title="Experiencia confidencial"
                description="Oculta automáticamente el nombre de la empresa en la API pública."
              />

              <ToggleCard
                name="company_visible"
                checked={
                  form.company_visible
                }
                onChange={
                  handleChange
                }
                disabled={
                  confidential
                }
                title="Mostrar empresa"
                description={
                  confidential
                    ? "Bloqueado por confidencialidad."
                    : "Permite mostrar el nombre de la empresa en el sitio público."
                }
              />
            </div>

            {confidential && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-[var(--theme-warning)]
                  bg-[var(--theme-warning-soft)]
                  px-4
                  py-3
                  text-xs
                  leading-6
                  text-[var(--theme-warning)]
                "
              >
                La empresa se mantendrá
                disponible en el
                backoffice para gestión
                interna, pero no se
                enviará en la experiencia
                pública.
              </div>
            )}
          </div>

          {/* RIGHT */}

          <div
            className="
              p-6
              sm:p-8
            "
          >
            <SectionTitle>
              Publicación
            </SectionTitle>

            <div
              className="
                mt-4
                space-y-3
              "
            >
              <ToggleCard
                name="is_published"
                checked={
                  form.is_published
                }
                onChange={
                  handleChange
                }
                title="Publicada"
                description="Permite mostrar esta experiencia en el Home público."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="experience-order"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Orden
              </label>

              <input
                id="experience-order"
                type="number"
                min="0"
                name="display_order"
                value={
                  form.display_order
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  px-4
                  py-3.5
                  text-sm
                  text-[var(--theme-text-primary)]
                  outline-none
                  focus:border-[var(--theme-accent)]/25
                "
              />
            </div>

            {/* PREVIEW */}

            <div
              className="
                mt-8
                border-t
                border-[var(--theme-border)]
                pt-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.17em]
                  text-[var(--theme-text-muted)]
                "
              >
                Vista previa pública
              </p>

              <ExperiencePreview
                form={form}
              />
            </div>

            {error && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-[var(--theme-danger)]
                  bg-[var(--theme-danger-soft)]
                  px-4
                  py-3
                  text-sm
                  text-[var(--theme-danger)]
                "
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="
                mt-6
                w-full
                rounded-xl
                bg-[var(--theme-accent)]
                px-5
                py-3.5
                text-sm
                font-semibold
                text-[var(--theme-bg-page)]
                transition
                hover:bg-[var(--theme-accent-hover)]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {saving
                ? "Guardando..."
                : editing
                ? "Guardar cambios"
                : "Crear experiencia"}
            </button>

            {editing && (
              <div
                className="
                  mt-8
                  border-t
                  border-[var(--theme-border)]
                  pt-8
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Eliminar experiencia
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[var(--theme-text-subtle)]
                  "
                >
                  Esta acción elimina
                  permanentemente el
                  registro.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirm(
                      true
                    )
                  }
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-[var(--theme-danger)]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-[var(--theme-danger)]
                    transition
                    hover:bg-[var(--theme-danger-soft)]
                  "
                >
                  Eliminar experiencia
                </button>
              </div>
            )}
          </div>
        </form>

        {deleteConfirm &&
          experience && (
            <DeleteExperienceModal
              experience={
                experience
              }
              loading={deleting}
              onCancel={() =>
                setDeleteConfirm(
                  false
                )
              }
              onConfirm={
                handleDelete
              }
            />
          )}
      </div>
    </div>
  );
}

/* ============================================
   PREVIEW
============================================ */

function ExperiencePreview({
  form,
}) {
  const company =
    form.is_confidential ||
    !form.company_visible
      ? "Proyecto confidencial"
      : form.company_name ||
        "Empresa";

  return (
    <div
      className="
        mt-4
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-xs
              text-[var(--theme-text-muted)]
            "
          >
            {formatPeriodFromForm(
              form
            )}
          </p>

          <h3
            className="
              mt-3
              text-lg
              font-semibold
              tracking-[-0.025em]
              text-[var(--theme-text-primary)]
            "
          >
            {form.position ||
              "Cargo / posición"}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-[var(--theme-text-secondary)]
            "
          >
            {company}
          </p>
        </div>

        {form.is_current && (
          <CurrentBadge />
        )}
      </div>

      {form.title && (
        <p
          className="
            mt-5
            text-xs
            font-medium
            text-[var(--theme-text-secondary)]
          "
        >
          {form.title}
        </p>
      )}

      <p
        className="
          mt-4
          text-sm
          leading-7
          text-[var(--theme-text-muted)]
        "
      >
        {form.description ||
          "La descripción de la experiencia aparecerá aquí."}
      </p>

      {form.location && (
        <p
          className="
            mt-5
            border-t
            border-[var(--theme-border)]
            pt-4
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          {form.location}
        </p>
      )}
    </div>
  );
}

/* ============================================
   DELETE MODAL
============================================ */

function DeleteExperienceModal({
  experience,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="
        absolute
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/90
        p-5
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          p-6
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            text-[var(--theme-danger)]
          "
        >
          !
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          ¿Eliminar experiencia?
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--theme-text-secondary)]
          "
        >
          Se eliminará
          permanentemente{" "}
          <strong
            className="
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {experience.position}
          </strong>
          .
        </p>

        <div
          className="
            mt-7
            flex
            gap-3
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              border
              border-[var(--theme-border)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-secondary)]
              hover:text-[var(--theme-text-primary)]
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              bg-[var(--theme-danger)]
              px-4
              py-3
              text-sm
              font-semibold
              text-[var(--theme-text-primary)]
              hover:opacity-90
              disabled:opacity-40
            "
          >
            {loading
              ? "Eliminando..."
              : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SMALL COMPONENTS
============================================ */

function TableHeader({
  children,
  right = false,
}) {
  return (
    <th
      className={`
        px-6
        py-4
        font-medium

        ${
          right
            ? "text-right"
            : ""
        }
      `}
    >
      {children}
    </th>
  );
}

function MetricCard({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
      "
    >
      <p
        className="
          text-xs
          text-[var(--theme-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-semibold
          tracking-[-0.035em]
          text-[var(--theme-text-primary)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={`experience-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`experience-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          placeholder:text-[var(--theme-text-subtle)]
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function DateField({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={`experience-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`experience-${name}`}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          focus:border-[var(--theme-accent)]/25
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      />
    </div>
  );
}

function ToggleCard({
  name,
  checked,
  onChange,
  title,
  description,
  disabled = false,
}) {
  return (
    <label
      className={`
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-4

        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }
      `}
    >
      <input
        type="checkbox"
        name={name}
        checked={
          Boolean(checked)
        }
        onChange={onChange}
        disabled={disabled}
        className="
          mt-1
          h-4
          w-4
          accent-[var(--theme-accent)]
        "
      />

      <div>
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[var(--theme-text-muted)]
          "
        >
          {description}
        </p>
      </div>
    </label>
  );
}

function SectionTitle({
  children,
}) {
  return (
    <p
      className="
        mt-8
        first:mt-0
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.17em]
        text-[var(--theme-text-muted)]
      "
    >
      {children}
    </p>
  );
}

function PublicationBadge({
  published,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${
          published
            ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
            : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            published
              ? "bg-[var(--theme-success)]"
              : "bg-[var(--theme-text-muted)]"
          }
        `}
      />

      {published
        ? "Publicada"
        : "Borrador"}
    </span>
  );
}

function CurrentBadge() {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-[var(--theme-accent)]
        bg-[var(--theme-accent-soft)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-accent)]
      "
    >
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-[var(--theme-accent)]
        "
      />

      Actual
    </span>
  );
}

function ConfidentialBadge() {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border
        border-[var(--theme-warning)]
        bg-[var(--theme-warning-soft)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-warning)]
      "
    >
      Confidencial
    </span>
  );
}

function SimpleBadge({
  children,
}) {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-text-secondary)]
      "
    >
      {children}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="
        absolute
        left-4
        top-1/2
        h-4
        w-4
        -translate-y-1/2
        text-[var(--theme-text-subtle)]
      "
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/* ============================================
   EMPTY + SKELETON
============================================ */

function EmptyState({
  filtered,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        px-6
        py-20
        text-center
      "
    >
      <p
        className="
          text-sm
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {filtered
          ? "No encontramos experiencias con estos filtros."
          : "Todavía no hay experiencias registradas."}
      </p>

      <p
        className="
          mt-2
          text-xs
          text-[var(--theme-text-subtle)]
        "
      >
        {filtered
          ? "Prueba modificando los filtros o la búsqueda."
          : "Crea tu primera experiencia desde Nueva experiencia."}
      </p>
    </div>
  );
}

function ExperiencesSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              flex
              animate-pulse
              items-center
              gap-5
              border-b
              border-[var(--theme-border)]
              p-6
              last:border-b-0
            "
          >
            <div
              className="
                h-10
                w-10
                shrink-0
                rounded-xl
                bg-[var(--theme-border)]
              "
            />

            <div className="flex-1">
              <div
                className="
                  h-3
                  w-48
                  rounded
                  bg-[var(--theme-border)]
                "
              />

              <div
                className="
                  mt-3
                  h-2
                  w-64
                  rounded
                  bg-[var(--theme-bg-secondary)]
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
   HELPERS
============================================ */

function experienceToForm(
  experience
) {
  return {
    company_name:
      experience.company_name ||
      "",

    position:
      experience.position ||
      "",

    title:
      experience.title || "",

    description:
      experience.description ||
      "",

    location:
      experience.location || "",

    start_date:
      normalizeDateValue(
        experience.start_date
      ),

    end_date:
      normalizeDateValue(
        experience.end_date
      ),

    is_current:
      Boolean(
        experience.is_current
      ),

    is_confidential:
      Boolean(
        experience.is_confidential
      ),

    company_visible:
      experience.company_visible !==
      false,

    display_order:
      Number(
        experience.display_order
      ) || 0,

    is_published:
      Boolean(
        experience.is_published
      ),
  };
}

function buildPayload(form) {
  const confidential =
    Boolean(
      form.is_confidential
    );

  return {
    company_name:
      nullable(
        form.company_name
      ),

    position:
      form.position.trim(),

    title:
      nullable(form.title),

    description:
      nullable(
        form.description
      ),

    location:
      nullable(form.location),

    start_date:
      form.start_date,

    end_date:
      form.is_current
        ? null
        : nullable(
            form.end_date
          ),

    is_current:
      Boolean(form.is_current),

    is_confidential:
      confidential,

    company_visible:
      confidential
        ? false
        : Boolean(
            form.company_visible
          ),

    display_order:
      Number(
        form.display_order
      ) || 0,

    is_published:
      Boolean(
        form.is_published
      ),
  };
}

function getAdminCompanyLabel(
  experience
) {
  if (
    experience.is_confidential
  ) {
    return experience.company_name
      ? `${experience.company_name} · Confidencial`
      : "Proyecto confidencial";
  }

  return (
    experience.company_name ||
    "Sin empresa informada"
  );
}

function formatPeriod(
  experience
) {
  const start =
    formatMonthYear(
      experience.start_date
    );

  const end =
    experience.is_current
      ? "Actualidad"
      : formatMonthYear(
          experience.end_date
        );

  return `${start} — ${end}`;
}

function formatPeriodFromForm(
  form
) {
  const start =
    formatMonthYear(
      form.start_date
    );

  const end =
    form.is_current
      ? "Actualidad"
      : formatMonthYear(
          form.end_date
        );

  return `${start} — ${end}`;
}

function formatMonthYear(
  value
) {
  const normalized =
    normalizeDateValue(value);

  if (!normalized) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] = normalized
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day || 1
    )
  );
}

function normalizeDateValue(
  value
) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
}

function nullable(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
}

function getInitials(
  value
) {
  return String(value || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) =>
      item.charAt(0)
        .toUpperCase()
    )
    .join("");
}

function truncateText(
  text,
  maxLength
) {
  if (!text) {
    return "";
  }

  return text.length <=
    maxLength
    ? text
    : `${text.slice(
        0,
        maxLength
      )}…`;
}

export default ExperiencesAdminPage;
