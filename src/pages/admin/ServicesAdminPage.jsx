import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from "../../services/servicesAdminService";

/* ============================================
   INITIAL FORM
============================================ */

const INITIAL_FORM = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  icon: "",
  starting_price: "",
  currency: "CLP",
  is_featured: false,
  is_active: true,
  display_order: 0,
};

/* ============================================
   PAGE
============================================ */

function ServicesAdminPage() {
  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    featuredFilter,
    setFeaturedFilter,
  ] = useState("ALL");

  const [
    modalMode,
    setModalMode,
  ] = useState(null);

  const [
    selectedService,
    setSelectedService,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadServices =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminServices();

        setServices(
          Array.isArray(
            data?.services
          )
            ? data.services
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando servicios:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar los servicios."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadServices();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      return {
        total:
          services.length,

        active:
          services.filter(
            (service) =>
              service.is_active
          ).length,

        featured:
          services.filter(
            (service) =>
              service.is_featured
          ).length,

        priced:
          services.filter(
            (service) =>
              service.starting_price !==
                null &&
              service.starting_price !==
                undefined
          ).length,
      };
    }, [services]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredServices =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return services.filter(
        (service) => {
          const statusMatches =
            statusFilter === "ALL" ||
            (
              statusFilter ===
                "ACTIVE" &&
              service.is_active
            ) ||
            (
              statusFilter ===
                "INACTIVE" &&
              !service.is_active
            );

          if (!statusMatches) {
            return false;
          }

          const featuredMatches =
            featuredFilter ===
              "ALL" ||
            (
              featuredFilter ===
                "FEATURED" &&
              service.is_featured
            ) ||
            (
              featuredFilter ===
                "NORMAL" &&
              !service.is_featured
            );

          if (
            !featuredMatches
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          return [
            service.name,
            service.slug,
            service.short_description,
            service.description,
            service.icon,
            service.currency,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term);
        }
      );
    }, [
      services,
      search,
      statusFilter,
      featuredFilter,
    ]);

  const openCreate = () => {
    setSelectedService(null);
    setModalMode("create");
  };

  const openEdit = (
    service
  ) => {
    setSelectedService(service);
    setModalMode("edit");
  };

  const closeModal = () => {
    setSelectedService(null);
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
            Oferta comercial
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
            Servicios
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
            Administra los servicios
            profesionales que se
            presentan públicamente en
            el portafolio.
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
              loadServices
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
            Nuevo servicio
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
          label="Activos"
          value={metrics.active}
        />

        <MetricCard
          label="Destacados"
          value={
            metrics.featured
          }
        />

        <MetricCard
          label="Con precio"
          value={metrics.priced}
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
              placeholder="Buscar nombre, slug, descripción..."
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
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
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
              Todos los estados
            </option>

            <option value="ACTIVE">
              Activos
            </option>

            <option value="INACTIVE">
              Inactivos
            </option>
          </select>

          <select
            value={
              featuredFilter
            }
            onChange={(event) =>
              setFeaturedFilter(
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
              Todos
            </option>

            <option value="FEATURED">
              Destacados
            </option>

            <option value="NORMAL">
              No destacados
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
          CONTENT
      ======================================== */}

      <div className="mt-6">
        {loading ? (
          <ServicesSkeleton />
        ) : filteredServices.length ===
          0 ? (
          <EmptyState
            filtered={
              Boolean(search) ||
              statusFilter !==
                "ALL" ||
              featuredFilter !==
                "ALL"
            }
          />
        ) : (
          <div
            className="
              grid
              gap-4
              xl:grid-cols-2
            "
          >
            {filteredServices.map(
              (service) => (
                <ServiceCard
                  key={
                    service.id
                  }
                  service={
                    service
                  }
                  onEdit={() =>
                    openEdit(service)
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ========================================
          MODAL
      ======================================== */}

      {modalMode && (
        <ServiceModal
          mode={modalMode}
          service={
            selectedService
          }
          onClose={closeModal}
          onSaved={async () => {
            await loadServices();
            closeModal();
          }}
          onDeleted={async () => {
            await loadServices();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   SERVICE CARD
============================================ */

function ServiceCard({
  service,
  onEdit,
}) {
  return (
    <article
      className="
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
          items-start
          justify-between
          gap-5
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-4
          "
        >
          <ServiceIcon
            value={service.icon}
          />

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              <ActiveBadge
                active={
                  service.is_active
                }
              />

              {service.is_featured && (
                <FeaturedBadge />
              )}
            </div>

            <h2
              className="
                mt-4
                text-xl
                font-semibold
                tracking-[-0.03em]
                text-[var(--theme-text-primary)]
              "
            >
              {service.name}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-[var(--theme-text-subtle)]
              "
            >
              /{service.slug}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="
            shrink-0
            rounded-xl
            border
            border-[var(--theme-border)]
            px-4
            py-2.5
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
      </div>

      <p
        className="
          mt-5
          min-h-[48px]
          text-sm
          leading-6
          text-[var(--theme-text-secondary)]
        "
      >
        {service.short_description ||
          service.description ||
          "Sin descripción."}
      </p>

      <div
        className="
          mt-6
          grid
          grid-cols-2
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <CardMeta
          label="Desde"
          value={formatMoney(
            service.starting_price,
            service.currency
          )}
        />

        <CardMeta
          label="Orden"
          value={
            Number(
              service.display_order
            ) || 0
          }
        />
      </div>
    </article>
  );
}

/* ============================================
   MODAL
============================================ */

function ServiceModal({
  mode,
  service,
  onClose,
  onSaved,
  onDeleted,
}) {
  const editing =
    mode === "edit" &&
    Boolean(service);

  const [form, setForm] =
    useState(
      editing
        ? serviceToForm(service)
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

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleNameBlur = () => {
    if (!form.slug.trim()) {
      setForm((current) => ({
        ...current,

        slug:
          createSlug(
            current.name
          ),
      }));
    }
  };

  /* ============================================
     SAVE
  ============================================ */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!form.name.trim()) {
        setError(
          "El nombre del servicio es obligatorio."
        );

        return;
      }

      const generatedSlug =
        createSlug(
          form.slug ||
            form.name
        );

      if (!generatedSlug) {
        setError(
          "No fue posible generar un slug válido."
        );

        return;
      }

      if (
        form.starting_price !==
          "" &&
        (
          Number.isNaN(
            Number(
              form.starting_price
            )
          ) ||
          Number(
            form.starting_price
          ) < 0
        )
      ) {
        setError(
          "El precio inicial debe ser mayor o igual a 0."
        );

        return;
      }

      if (
        !Number.isInteger(
          Number(
            form.display_order
          )
        )
      ) {
        setError(
          "El orden debe ser un número entero."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildPayload({
            ...form,
            slug:
              generatedSlug,
          });

        if (editing) {
          await updateAdminService(
            service.id,
            payload
          );
        } else {
          await createAdminService(
            payload
          );
        }

        await onSaved?.();
      } catch (error) {
        console.error(
          "Error guardando servicio:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar el servicio."
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
      if (!service) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteAdminService(
          service.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando servicio:",
          error
        );

        setDeleteConfirm(false);

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar el servicio."
        );
      } finally {
        setDeleting(false);
      }
    };

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
          max-w-6xl
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
                : "Nueva oferta"}
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
                ? "Editar servicio"
                : "Crear servicio"}
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
              Información principal
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
                label="Nombre"
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                onBlur={
                  handleNameBlur
                }
                required
                placeholder="Desarrollo de aplicaciones web"
              />

              <Field
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={
                  handleChange
                }
                placeholder="desarrollo-aplicaciones-web"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Descripción corta"
                name="short_description"
                value={
                  form.short_description
                }
                onChange={
                  handleChange
                }
                placeholder="Resumen breve para el Home."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="service-description"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Descripción completa
              </label>

              <textarea
                id="service-description"
                name="description"
                rows="8"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe el alcance del servicio y el tipo de problema que resuelve."
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
              Presentación
            </SectionTitle>

            <div className="mt-4">
              <Field
                label="Icono / identificador"
                name="icon"
                value={form.icon}
                onChange={
                  handleChange
                }
                placeholder="code, api, database, web..."
              />
            </div>

            <SectionTitle>
              Precio inicial
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-[1fr_160px]
              "
            >
              <div>
                <label
                  htmlFor="service-price"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Precio desde
                </label>

                <input
                  id="service-price"
                  type="number"
                  min="0"
                  step="1"
                  name="starting_price"
                  value={
                    form.starting_price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="500000"
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

              <div>
                <label
                  htmlFor="service-currency"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Moneda
                </label>

                <input
                  id="service-currency"
                  type="text"
                  name="currency"
                  maxLength="10"
                  value={form.currency}
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
                    uppercase
                    text-[var(--theme-text-primary)]
                    outline-none
                    focus:border-[var(--theme-accent)]/25
                  "
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              p-6
              sm:p-8
            "
          >
            <SectionTitle>
              Estado
            </SectionTitle>

            <div
              className="
                mt-4
                space-y-3
              "
            >
              <ToggleCard
                name="is_active"
                checked={
                  form.is_active
                }
                onChange={
                  handleChange
                }
                title="Servicio activo"
                description="Solo los servicios activos se exponen en la API pública."
              />

              <ToggleCard
                name="is_featured"
                checked={
                  form.is_featured
                }
                onChange={
                  handleChange
                }
                title="Servicio destacado"
                description="Los destacados tienen prioridad en el orden público."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="service-order"
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
                id="service-order"
                type="number"
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

              <ServicePreview
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
                : "Crear servicio"}
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
                  Eliminar servicio
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
                  Eliminar servicio
                </button>
              </div>
            )}
          </div>
        </form>

        {deleteConfirm &&
          service && (
            <DeleteServiceModal
              service={service}
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

function ServicePreview({
  form,
}) {
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
        <ServiceIcon
          value={form.icon}
          large
        />

        <div
          className="
            flex
            flex-wrap
            justify-end
            gap-2
          "
        >
          <ActiveBadge
            active={
              form.is_active
            }
          />

          {form.is_featured && (
            <FeaturedBadge />
          )}
        </div>
      </div>

      <h3
        className="
          mt-6
          text-lg
          font-semibold
          tracking-[-0.025em]
          text-[var(--theme-text-primary)]
        "
      >
        {form.name ||
          "Nombre del servicio"}
      </h3>

      <p
        className="
          mt-3
          text-sm
          leading-7
          text-[var(--theme-text-muted)]
        "
      >
        {form.short_description ||
          form.description ||
          "La descripción del servicio aparecerá aquí."}
      </p>

      <div
        className="
          mt-6
          flex
          items-end
          justify-between
          gap-4
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.12em]
              text-[var(--theme-text-subtle)]
            "
          >
            Desde
          </p>

          <p
            className="
              mt-1
              text-xl
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {formatMoney(
              form.starting_price,
              form.currency
            )}
          </p>
        </div>

        <span
          className="
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          Orden{" "}
          {Number(
            form.display_order
          ) || 0}
        </span>
      </div>
    </div>
  );
}

/* ============================================
   DELETE MODAL
============================================ */

function DeleteServiceModal({
  service,
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
          ¿Eliminar servicio?
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
            {service.name}
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

function CardMeta({
  label,
  value,
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.12em]
          text-[var(--theme-text-subtle)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-sm
          font-medium
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
  onBlur,
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={`service-${name}`}
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
        id={`service-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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

function ToggleCard({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-4
      "
    >
      <input
        type="checkbox"
        name={name}
        checked={
          Boolean(checked)
        }
        onChange={onChange}
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

function ServiceIcon({
  value,
  large = false,
}) {
  return (
    <div
      className={`
        flex
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        font-semibold
        uppercase
        text-[var(--theme-text-secondary)]

        ${
          large
            ? "h-14 w-14 text-sm"
            : "h-12 w-12 text-xs"
        }
      `}
    >
      {value
        ? String(value)
            .slice(0, 2)
        : "SV"}
    </div>
  );
}

function ActiveBadge({
  active,
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
          active
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
            active
              ? "bg-[var(--theme-success)]"
              : "bg-[var(--theme-text-muted)]"
          }
        `}
      />

      {active
        ? "Activo"
        : "Inactivo"}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-text-primary)]
      "
    >
      Destacado
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
          ? "No encontramos servicios con estos filtros."
          : "Todavía no hay servicios registrados."}
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
          : "Crea tu primer servicio desde Nuevo servicio."}
      </p>
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        xl:grid-cols-2
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              animate-pulse
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
                gap-4
              "
            >
              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-[var(--theme-border)]
                "
              />

              <div className="flex-1">
                <div
                  className="
                    h-4
                    w-48
                    rounded
                    bg-[var(--theme-border)]
                  "
                />

                <div
                  className="
                    mt-3
                    h-3
                    w-32
                    rounded
                    bg-[var(--theme-bg-secondary)]
                  "
                />
              </div>
            </div>

            <div
              className="
                mt-6
                h-3
                w-full
                rounded
                bg-[var(--theme-bg-secondary)]
              "
            />
          </div>
        )
      )}
    </div>
  );
}

/* ============================================
   HELPERS
============================================ */

function serviceToForm(
  service
) {
  return {
    name:
      service.name || "",

    slug:
      service.slug || "",

    short_description:
      service.short_description ||
      "",

    description:
      service.description || "",

    icon:
      service.icon || "",

    starting_price:
      service.starting_price ===
        null ||
      service.starting_price ===
        undefined
        ? ""
        : String(
            service.starting_price
          ),

    currency:
      service.currency || "CLP",

    is_featured:
      Boolean(
        service.is_featured
      ),

    is_active:
      Boolean(
        service.is_active
      ),

    display_order:
      Number(
        service.display_order
      ) || 0,
  };
}

function buildPayload(form) {
  return {
    name:
      form.name.trim(),

    slug:
      createSlug(
        form.slug ||
          form.name
      ),

    short_description:
      nullable(
        form.short_description
      ),

    description:
      nullable(
        form.description
      ),

    icon:
      nullable(form.icon),

    starting_price:
      form.starting_price ===
      ""
        ? null
        : Number(
            form.starting_price
          ),

    currency:
      (
        form.currency ||
        "CLP"
      )
        .trim()
        .toUpperCase(),

    is_featured:
      Boolean(
        form.is_featured
      ),

    is_active:
      Boolean(
        form.is_active
      ),

    display_order:
      Number(
        form.display_order
      ) || 0,
  };
}

function createSlug(
  value = ""
) {
  return String(value)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
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

function formatMoney(
  value,
  currency = "CLP"
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "A convenir";
  }

  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return "A convenir";
  }

  try {
    return new Intl.NumberFormat(
      "es-CL",
      {
        style: "currency",
        currency:
          currency || "CLP",
        maximumFractionDigits: 0,
      }
    ).format(numeric);
  } catch {
    return `${numeric} ${
      currency || ""
    }`.trim();
  }
}

export default ServicesAdminPage;
