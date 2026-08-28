import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAdminConsultingService,
  deleteAdminConsultingService,
  getAdminConsultingServices,
  updateAdminConsultingService,
} from "../../services/consultingServicesAdminService";

/* ============================================
   CONSTANTS
============================================ */

const CONSULTING_MODES = [
  {
    value: "ONLINE",
    label: "Online",
  },
  {
    value: "IN_PERSON",
    label: "Presencial",
  },
  {
    value: "HYBRID",
    label: "Híbrida",
  },
];

const BILLING_INCREMENTS = [
  30,
  60,
];

const INITIAL_FORM = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  minimum_duration_minutes: 60,
  hourly_rate: "",
  currency: "CLP",
  mode: "ONLINE",
  location_text: "",
  icon: "",
  is_featured: false,
  is_active: true,
  display_order: 0,
  billing_increment_minutes: 60,
};

/* ============================================
   PAGE
============================================ */

function ConsultingServicesAdminPage() {
  const [
    consultingServices,
    setConsultingServices,
  ] = useState([]);

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

  const [modeFilter, setModeFilter] =
    useState("ALL");

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

  const loadConsultingServices =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminConsultingServices();

        setConsultingServices(
          Array.isArray(
            data?.consulting_services
          )
            ? data.consulting_services
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando asesorías:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar los servicios de consultoría."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadConsultingServices();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      const active =
        consultingServices.filter(
          (service) =>
            service.is_active
        );

      const rates =
        active
          .map((service) =>
            Number(
              service.hourly_rate
            )
          )
          .filter(
            (rate) =>
              Number.isFinite(rate)
          );

      const averageRate =
        rates.length > 0
          ? rates.reduce(
              (
                total,
                rate
              ) => total + rate,
              0
            ) / rates.length
          : null;

      return {
        total:
          consultingServices.length,

        active:
          active.length,

        featured:
          consultingServices.filter(
            (service) =>
              service.is_featured
          ).length,

        averageRate,
      };
    }, [consultingServices]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredServices =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return consultingServices.filter(
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

          const modeMatches =
            modeFilter === "ALL" ||
            service.mode ===
              modeFilter;

          if (!modeMatches) {
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
            service.location_text,
            service.mode,
            service.currency,
            service.icon,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term);
        }
      );
    }, [
      consultingServices,
      search,
      statusFilter,
      modeFilter,
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
            Agenda comercial
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
            Asesorías
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
            Administra las asesorías
            reservables, su tarifa,
            modalidad, duración mínima
            y reglas de cobro.
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
              loadConsultingServices
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
            Nueva asesoría
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
          label="Activas"
          value={metrics.active}
        />

        <MetricCard
          label="Destacadas"
          value={
            metrics.featured
          }
        />

        <MetricCard
          label="Tarifa promedio"
          value={
            metrics.averageRate ===
            null
              ? "—"
              : formatMoney(
                  metrics.averageRate,
                  "CLP"
                )
          }
          compact
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
              placeholder="Buscar asesoría, modalidad, ubicación..."
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
              Activas
            </option>

            <option value="INACTIVE">
              Inactivas
            </option>
          </select>

          <select
            value={modeFilter}
            onChange={(event) =>
              setModeFilter(
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
              Todas las modalidades
            </option>

            {CONSULTING_MODES.map(
              (mode) => (
                <option
                  key={mode.value}
                  value={mode.value}
                >
                  {mode.label}
                </option>
              )
            )}
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
          <ConsultingServicesSkeleton />
        ) : filteredServices.length ===
          0 ? (
          <EmptyState
            filtered={
              Boolean(search) ||
              statusFilter !==
                "ALL" ||
              modeFilter !== "ALL"
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
                <ConsultingServiceCard
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
        <ConsultingServiceModal
          mode={modalMode}
          service={
            selectedService
          }
          onClose={closeModal}
          onSaved={async () => {
            await loadConsultingServices();
            closeModal();
          }}
          onDeleted={async () => {
            await loadConsultingServices();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   CARD
============================================ */

function ConsultingServiceCard({
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
          <ConsultingIcon
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

              <ModeBadge
                mode={service.mode}
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
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
          sm:grid-cols-2
        "
      >
        <CardMeta
          label="Tarifa por hora"
          value={formatMoney(
            service.hourly_rate,
            service.currency
          )}
        />

        <CardMeta
          label="Duración mínima"
          value={formatDuration(
            service.minimum_duration_minutes
          )}
        />

        <CardMeta
          label="Incremento"
          value={`${Number(
            service.billing_increment_minutes
          )} min`}
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

      {service.location_text && (
        <div
          className="
            mt-5
            border-t
            border-[var(--theme-border)]
            pt-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.12em]
              text-[var(--theme-text-subtle)]
            "
          >
            Ubicación / modalidad
          </p>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-[var(--theme-text-secondary)]
            "
          >
            {service.location_text}
          </p>
        </div>
      )}
    </article>
  );
}

/* ============================================
   MODAL
============================================ */

function ConsultingServiceModal({
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
     BODY LOCK + ESC
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
     VALIDATE
  ============================================ */

  const validate = () => {
    if (!form.name.trim()) {
      return "El nombre de la asesoría es obligatorio.";
    }

    const slug =
      createSlug(
        form.slug ||
          form.name
      );

    if (!slug) {
      return "No fue posible generar un slug válido.";
    }

    const minimumDuration =
      Number(
        form.minimum_duration_minutes
      );

    if (
      !Number.isInteger(
        minimumDuration
      ) ||
      minimumDuration < 30 ||
      minimumDuration > 480
    ) {
      return "La duración mínima debe estar entre 30 y 480 minutos.";
    }

    const hourlyRate =
      Number(form.hourly_rate);

    if (
      Number.isNaN(
        hourlyRate
      ) ||
      hourlyRate < 0
    ) {
      return "La tarifa por hora debe ser mayor o igual a 0.";
    }

    const billingIncrement =
      Number(
        form.billing_increment_minutes
      );

    if (
      !BILLING_INCREMENTS.includes(
        billingIncrement
      )
    ) {
      return "El incremento de cobro debe ser de 30 o 60 minutos.";
    }

    if (
      !CONSULTING_MODES.some(
        (item) =>
          item.value ===
          form.mode
      )
    ) {
      return "La modalidad seleccionada no es válida.";
    }

    if (
      !Number.isInteger(
        Number(
          form.display_order
        )
      )
    ) {
      return "El orden debe ser un número entero.";
    }

    return null;
  };

  /* ============================================
     SAVE
  ============================================ */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validate();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildPayload(form);

        if (editing) {
          await updateAdminConsultingService(
            service.id,
            payload
          );
        } else {
          await createAdminConsultingService(
            payload
          );
        }

        await onSaved?.();
      } catch (error) {
        console.error(
          "Error guardando asesoría:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar la asesoría."
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

        await deleteAdminConsultingService(
          service.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando asesoría:",
          error
        );

        setDeleteConfirm(false);

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar la asesoría. Si tiene reservas históricas, desactívala en lugar de eliminarla."
        );
      } finally {
        setDeleting(false);
      }
    };

  const minimumTotal =
    calculatePrice(
      form.hourly_rate,
      form.minimum_duration_minutes
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
                : "Nueva asesoría"}
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
                ? "Editar asesoría"
                : "Crear asesoría"}
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
                placeholder="Asesoría Full Stack"
              />

              <Field
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={
                  handleChange
                }
                placeholder="asesoria-full-stack"
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
                placeholder="Resumen breve para la selección pública."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="consulting-description"
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
                id="consulting-description"
                name="description"
                rows="8"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe el alcance, objetivo y tipo de apoyo que recibirá el cliente."
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
              Modalidad
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor="consulting-mode"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Modalidad
                </label>

                <select
                  id="consulting-mode"
                  name="mode"
                  value={form.mode}
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
                >
                  {CONSULTING_MODES.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <Field
                label="Icono / identificador"
                name="icon"
                value={form.icon}
                onChange={
                  handleChange
                }
                placeholder="code, backend, meeting..."
              />
            </div>

            <div className="mt-4">
              <Field
                label="Ubicación / detalle de modalidad"
                name="location_text"
                value={
                  form.location_text
                }
                onChange={
                  handleChange
                }
                placeholder={
                  form.mode ===
                  "ONLINE"
                    ? "Google Meet"
                    : "Santiago, Chile / dirección por coordinar"
                }
              />
            </div>

            <SectionTitle>
              Tarifa
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-[1fr_160px]
              "
            >
              <NumberField
                label="Tarifa por hora"
                name="hourly_rate"
                value={
                  form.hourly_rate
                }
                onChange={
                  handleChange
                }
                min="0"
                step="1"
                placeholder="50000"
              />

              <Field
                label="Moneda"
                name="currency"
                value={
                  form.currency
                }
                onChange={
                  handleChange
                }
                placeholder="CLP"
              />
            </div>

            <SectionTitle>
              Duración y cobro
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <NumberField
                label="Duración mínima (min)"
                name="minimum_duration_minutes"
                value={
                  form.minimum_duration_minutes
                }
                onChange={
                  handleChange
                }
                min="30"
                max="480"
                step="30"
              />

              <div>
                <label
                  htmlFor="billing-increment"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Incremento de cobro
                </label>

                <select
                  id="billing-increment"
                  name="billing_increment_minutes"
                  value={
                    form.billing_increment_minutes
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
                >
                  {BILLING_INCREMENTS.map(
                    (minutes) => (
                      <option
                        key={minutes}
                        value={minutes}
                      >
                        {minutes} minutos
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div
              className="
                mt-4
                rounded-xl
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-secondary)]
                p-4
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.14em]
                  text-[var(--theme-text-subtle)]
                "
              >
                Ejemplo de cobro
              </p>

              <div
                className="
                  mt-3
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                <CardMeta
                  label="Duración mínima"
                  value={formatDuration(
                    form.minimum_duration_minutes
                  )}
                />

                <CardMeta
                  label="Valor mínimo referencial"
                  value={formatMoney(
                    minimumTotal,
                    form.currency
                  )}
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
                title="Asesoría activa"
                description="Solo las asesorías activas pueden seleccionarse y reservarse públicamente."
              />

              <ToggleCard
                name="is_featured"
                checked={
                  form.is_featured
                }
                onChange={
                  handleChange
                }
                title="Asesoría destacada"
                description="Las destacadas tienen prioridad en la lista pública."
              />
            </div>

            <div className="mt-4">
              <NumberField
                label="Orden"
                name="display_order"
                value={
                  form.display_order
                }
                onChange={
                  handleChange
                }
                step="1"
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

              <ConsultingPreview
                form={form}
              />
            </div>

            {/* IMPORTANT INFO */}

            <div
              className="
                mt-6
                rounded-xl
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-secondary)]
                p-4
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Impacto en reservas
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  leading-6
                  text-[var(--theme-text-subtle)]
                "
              >
                Los cambios de tarifa,
                duración mínima e
                incremento se aplican a
                nuevas reservas. Las
                reservas existentes
                conservan los valores
                registrados al momento
                de su creación.
              </p>
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
                : "Crear asesoría"}
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
                  Eliminar asesoría
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[var(--theme-text-subtle)]
                  "
                >
                  Si esta asesoría ya
                  posee reservas
                  históricas, PostgreSQL
                  puede impedir su
                  eliminación. En ese
                  caso utiliza
                  “Asesoría activa” para
                  desactivarla.
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
                  Eliminar asesoría
                </button>
              </div>
            )}
          </div>
        </form>

        {deleteConfirm &&
          service && (
            <DeleteConsultingModal
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

function ConsultingPreview({
  form,
}) {
  const minimumTotal =
    calculatePrice(
      form.hourly_rate,
      form.minimum_duration_minutes
    );

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
        <ConsultingIcon
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

          <ModeBadge
            mode={form.mode}
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
          "Nombre de la asesoría"}
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
          "La descripción de la asesoría aparecerá aquí."}
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
          label="Tarifa / hora"
          value={formatMoney(
            form.hourly_rate,
            form.currency
          )}
        />

        <CardMeta
          label="Desde"
          value={formatMoney(
            minimumTotal,
            form.currency
          )}
        />

        <CardMeta
          label="Duración mínima"
          value={formatDuration(
            form.minimum_duration_minutes
          )}
        />

        <CardMeta
          label="Incrementos"
          value={`${Number(
            form.billing_increment_minutes
          )} min`}
        />
      </div>

      {form.location_text && (
        <p
          className="
            mt-5
            border-t
            border-[var(--theme-border)]
            pt-4
            text-xs
            leading-5
            text-[var(--theme-text-subtle)]
          "
        >
          {form.location_text}
        </p>
      )}
    </div>
  );
}

/* ============================================
   DELETE
============================================ */

function DeleteConsultingModal({
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
          ¿Eliminar asesoría?
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--theme-text-secondary)]
          "
        >
          Se intentará eliminar
          permanentemente{" "}
          <strong
            className="
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {service.name}
          </strong>
          . Si existen reservas
          asociadas, utiliza la
          desactivación para conservar
          el historial.
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
  compact = false,
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
        className={`
          mt-2
          font-semibold
          tracking-[-0.035em]
          text-[var(--theme-text-primary)]

          ${
            compact
              ? "text-xl"
              : "text-2xl"
          }
        `}
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
        htmlFor={`consulting-${name}`}
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
        id={`consulting-${name}`}
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

function NumberField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = "1",
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={`consulting-${name}`}
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
        id={`consulting-${name}`}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
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

function ConsultingIcon({
  value,
  large = false,
}) {
  const content =
    value
      ? String(value)
          .slice(0, 2)
          .toUpperCase()
      : "AS";

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
        text-xs
        font-semibold
        text-[var(--theme-text-secondary)]

        ${
          large
            ? "h-14 w-14"
            : "h-12 w-12"
        }
      `}
    >
      {content}
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
        ? "Activa"
        : "Inactiva"}
    </span>
  );
}

function ModeBadge({
  mode,
}) {
  return (
    <span
      className="
        inline-flex
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
      {formatMode(mode)}
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
      Destacada
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
          ? "No encontramos asesorías con estos filtros."
          : "Todavía no hay asesorías registradas."}
      </p>

      <p
        className="
          mt-2
          text-xs
          text-[var(--theme-text-subtle)]
        "
      >
        {filtered
          ? "Prueba modificando la modalidad, el estado o la búsqueda."
          : "Crea tu primera asesoría desde Nueva asesoría."}
      </p>
    </div>
  );
}

function ConsultingServicesSkeleton() {
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

    minimum_duration_minutes:
      Number(
        service.minimum_duration_minutes
      ) || 60,

    hourly_rate:
      service.hourly_rate ===
        null ||
      service.hourly_rate ===
        undefined
        ? ""
        : String(
            service.hourly_rate
          ),

    currency:
      service.currency || "CLP",

    mode:
      service.mode || "ONLINE",

    location_text:
      service.location_text ||
      "",

    icon:
      service.icon || "",

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

    billing_increment_minutes:
      Number(
        service.billing_increment_minutes
      ) || 60,
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

    minimum_duration_minutes:
      Number(
        form.minimum_duration_minutes
      ),

    hourly_rate:
      Number(form.hourly_rate),

    currency:
      (
        form.currency ||
        "CLP"
      )
        .trim()
        .toUpperCase(),

    mode:
      form.mode,

    location_text:
      nullable(
        form.location_text
      ),

    icon:
      nullable(form.icon),

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

    billing_increment_minutes:
      Number(
        form.billing_increment_minutes
      ),
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

function formatMode(mode) {
  const labels = {
    ONLINE: "Online",
    IN_PERSON: "Presencial",
    HYBRID: "Híbrida",
  };

  return (
    labels[mode] ||
    mode ||
    "Modalidad"
  );
}

function formatDuration(
  value
) {
  const minutes =
    Number(value);

  if (
    !Number.isFinite(
      minutes
    ) ||
    minutes <= 0
  ) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainder =
    minutes % 60;

  if (!remainder) {
    return hours === 1
      ? "1 hora"
      : `${hours} horas`;
  }

  return `${hours} h ${remainder} min`;
}

function calculatePrice(
  hourlyRate,
  durationMinutes
) {
  const rate =
    Number(hourlyRate);

  const duration =
    Number(
      durationMinutes
    );

  if (
    !Number.isFinite(rate) ||
    !Number.isFinite(duration)
  ) {
    return null;
  }

  return Number(
    (
      rate *
      (duration / 60)
    ).toFixed(2)
  );
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
    return "—";
  }

  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return "—";
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

export default ConsultingServicesAdminPage;
