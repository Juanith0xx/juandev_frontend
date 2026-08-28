import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteAdminTestimonial,
  getAdminTestimonialById,
  getAdminTestimonials,
  updateAdminTestimonial,
  updateAdminTestimonialStatus,
} from "../../services/testimonialsAdminService";

/* ============================================
   STATUS
============================================ */

const TESTIMONIAL_STATUSES = [
  {
    value: "PENDING",
    label: "Pendiente",
  },
  {
    value: "APPROVED",
    label: "Aprobado",
  },
  {
    value: "REJECTED",
    label: "Rechazado",
  },
  {
    value: "HIDDEN",
    label: "Oculto",
  },
];

const STATUS_TRANSITIONS = {
  PENDING: [
    "APPROVED",
    "REJECTED",
  ],

  APPROVED: [
    "HIDDEN",
    "REJECTED",
    "PENDING",
  ],

  REJECTED: [
    "PENDING",
    "APPROVED",
  ],

  HIDDEN: [
    "APPROVED",
    "PENDING",
  ],
};

/* ============================================
   PAGE
============================================ */

function TestimonialsAdminPage() {
  const [
    testimonials,
    setTestimonials,
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

  const [
    selectedTestimonialId,
    setSelectedTestimonialId,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadTestimonials =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminTestimonials();

        setTestimonials(
          Array.isArray(
            data?.testimonials
          )
            ? data.testimonials
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando testimonios:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar los testimonios."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadTestimonials();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const statusCounts =
    useMemo(() => {
      const counts = {
        ALL: testimonials.length,
      };

      TESTIMONIAL_STATUSES.forEach(
        ({ value }) => {
          counts[value] =
            testimonials.filter(
              (testimonial) =>
                testimonial.status ===
                value
            ).length;
        }
      );

      return counts;
    }, [testimonials]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredTestimonials =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return testimonials.filter(
        (testimonial) => {
          const statusMatches =
            statusFilter === "ALL" ||
            testimonial.status ===
              statusFilter;

          if (!statusMatches) {
            return false;
          }

          if (!term) {
            return true;
          }

          const searchable =
            [
              testimonial.client_name,
              testimonial.company_name,
              testimonial.position,
              testimonial.project_name,
              testimonial.review,
              testimonial.rating,
              testimonial.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            term
          );
        }
      );
    }, [
      testimonials,
      search,
      statusFilter,
    ]);

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
            Moderación
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
            Testimonios
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
            Revisa, edita y modera
            los testimonios enviados
            antes de publicarlos en
            el portafolio.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadTestimonials
          }
          disabled={loading}
          className="
            inline-flex
            w-fit
            items-center
            justify-center
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
          xl:grid-cols-5
        "
      >
        <MetricCard
          label="Total"
          value={
            statusCounts.ALL || 0
          }
        />

        <MetricCard
          label="Pendientes"
          value={
            statusCounts.PENDING || 0
          }
        />

        <MetricCard
          label="Aprobados"
          value={
            statusCounts.APPROVED || 0
          }
        />

        <MetricCard
          label="Rechazados"
          value={
            statusCounts.REJECTED || 0
          }
        />

        <MetricCard
          label="Ocultos"
          value={
            statusCounts.HIDDEN || 0
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
            gap-4
            xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]
            xl:items-center
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
              placeholder="Buscar cliente, empresa, proyecto..."
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
                transition
                placeholder:text-[var(--theme-text-subtle)]
                focus:border-[var(--theme-accent)]/25
              "
            />
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
              xl:justify-end
            "
          >
            <StatusFilterButton
              active={
                statusFilter ===
                "ALL"
              }
              label="Todos"
              count={
                statusCounts.ALL || 0
              }
              onClick={() =>
                setStatusFilter(
                  "ALL"
                )
              }
            />

            {TESTIMONIAL_STATUSES.map(
              (status) => (
                <StatusFilterButton
                  key={
                    status.value
                  }
                  active={
                    statusFilter ===
                    status.value
                  }
                  label={
                    status.label
                  }
                  count={
                    statusCounts[
                      status.value
                    ] || 0
                  }
                  onClick={() =>
                    setStatusFilter(
                      status.value
                    )
                  }
                />
              )
            )}
          </div>
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
          <TestimonialsSkeleton />
        ) : filteredTestimonials.length ===
          0 ? (
          <EmptyState
            filtered={
              Boolean(search) ||
              statusFilter !==
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
            {/* DESKTOP */}

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
                      Cliente
                    </TableHeader>

                    <TableHeader>
                      Proyecto
                    </TableHeader>

                    <TableHeader>
                      Valoración
                    </TableHeader>

                    <TableHeader>
                      Fecha
                    </TableHeader>

                    <TableHeader>
                      Estado
                    </TableHeader>

                    <TableHeader right>
                      Acción
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredTestimonials.map(
                    (testimonial) => (
                      <TestimonialRow
                        key={
                          testimonial.id
                        }
                        testimonial={
                          testimonial
                        }
                        onOpen={() =>
                          setSelectedTestimonialId(
                            testimonial.id
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="lg:hidden">
              {filteredTestimonials.map(
                (
                  testimonial,
                  index
                ) => (
                  <TestimonialMobileCard
                    key={
                      testimonial.id
                    }
                    testimonial={
                      testimonial
                    }
                    last={
                      index ===
                      filteredTestimonials.length -
                        1
                    }
                    onOpen={() =>
                      setSelectedTestimonialId(
                        testimonial.id
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
          DETAIL
      ======================================== */}

      {selectedTestimonialId && (
        <TestimonialDetailModal
          testimonialId={
            selectedTestimonialId
          }
          onClose={() =>
            setSelectedTestimonialId(
              null
            )
          }
          onUpdated={
            loadTestimonials
          }
          onDeleted={async () => {
            setSelectedTestimonialId(
              null
            );

            await loadTestimonials();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   TABLE
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

function TestimonialRow({
  testimonial,
  onOpen,
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
            items-center
            gap-4
          "
        >
          <Avatar
            testimonial={
              testimonial
            }
          />

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  max-w-[220px]
                  truncate
                  text-sm
                  font-semibold
                  text-[var(--theme-text-primary)]
                "
              >
                {testimonial.client_name}
              </p>

              {testimonial.is_featured && (
                <FeaturedBadge />
              )}
            </div>

            <p
              className="
                mt-1
                max-w-[220px]
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {testimonial.position ||
                testimonial.company_name ||
                "Sin cargo informado"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 align-top">
        <p
          className="
            max-w-[240px]
            truncate
            text-sm
            text-[var(--theme-text-primary)]
          "
        >
          {testimonial.project_name ||
            "Sin proyecto informado"}
        </p>

        <p
          className="
            mt-1
            max-w-[300px]
            truncate
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {testimonial.review}
        </p>
      </td>

      <td className="px-6 py-5 align-top">
        <Rating
          value={
            testimonial.rating
          }
        />
      </td>

      <td
        className="
          px-6
          py-5
          align-top
          text-xs
          text-[var(--theme-text-secondary)]
        "
      >
        {formatDateTime(
          testimonial.created_at
        )}
      </td>

      <td className="px-6 py-5 align-top">
        <StatusBadge
          status={
            testimonial.status
          }
        />
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
          onClick={onOpen}
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
          Ver detalle
        </button>
      </td>
    </tr>
  );
}

/* ============================================
   MOBILE
============================================ */

function TestimonialMobileCard({
  testimonial,
  onOpen,
  last,
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
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <Avatar
            testimonial={
              testimonial
            }
          />

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-[var(--theme-text-primary)]
                "
              >
                {testimonial.client_name}
              </p>

              {testimonial.is_featured && (
                <FeaturedBadge />
              )}
            </div>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {testimonial.company_name ||
                testimonial.position ||
                "Testimonio"}
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            testimonial.status
          }
        />
      </div>

      <div className="mt-5">
        <Rating
          value={
            testimonial.rating
          }
        />
      </div>

      <p
        className="
          mt-4
          text-sm
          leading-6
          text-[var(--theme-text-secondary)]
        "
      >
        {truncateText(
          testimonial.review,
          150
        )}
      </p>

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[11px]
            text-[var(--theme-text-subtle)]
          "
        >
          {formatDateTime(
            testimonial.created_at
          )}
        </span>

        <button
          type="button"
          onClick={onOpen}
          className="
            text-xs
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          Ver detalle →
        </button>
      </div>
    </article>
  );
}

/* ============================================
   DETAIL MODAL
============================================ */

function TestimonialDetailModal({
  testimonialId,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [
    testimonial,
    setTestimonial,
  ] = useState(null);

  const [form, setForm] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    pendingStatus,
    setPendingStatus,
  ] = useState(null);

  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);

  /* ============================================
     LOAD
  ============================================ */

  useEffect(() => {
    const loadTestimonial =
      async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminTestimonialById(
            testimonialId
          );

        const item =
          data?.testimonial ||
          null;

        setTestimonial(item);

        setForm(
          item
            ? testimonialToForm(
                item
              )
            : null
        );
      } catch (error) {
        console.error(
          "Error cargando testimonio:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar el testimonio."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTestimonial();
  }, [testimonialId]);

  /* ============================================
     BODY LOCK + ESC
  ============================================ */

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !pendingStatus &&
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
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    pendingStatus,
    deleteConfirm,
  ]);

  /* ============================================
     FORM
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

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSuccess("");
  };

  /* ============================================
     SAVE CONTENT
  ============================================ */

  const handleSave =
    async () => {
      if (
        !testimonial ||
        !form
      ) {
        return;
      }

      if (
        !form.client_name.trim()
      ) {
        setError(
          "El nombre del cliente es obligatorio."
        );

        return;
      }

      if (!form.review.trim()) {
        setError(
          "La reseña es obligatoria."
        );

        return;
      }

      const rating =
        Number(form.rating);

      if (
        !Number.isInteger(
          rating
        ) ||
        rating < 1 ||
        rating > 5
      ) {
        setError(
          "La valoración debe estar entre 1 y 5."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
          client_name:
            form.client_name.trim(),

          company_name:
            normalizeNullable(
              form.company_name
            ),

          position:
            normalizeNullable(
              form.position
            ),

          project_name:
            normalizeNullable(
              form.project_name
            ),

          review:
            form.review.trim(),

          rating,

          linkedin_url:
            normalizeNullable(
              form.linkedin_url
            ),

          website_url:
            normalizeNullable(
              form.website_url
            ),

          avatar_url:
            normalizeNullable(
              form.avatar_url
            ),

          is_featured:
            Boolean(
              form.is_featured
            ),
        };

        const data =
          await updateAdminTestimonial(
            testimonial.id,
            payload
          );

        const refreshed =
          await getAdminTestimonialById(
            testimonial.id
          );

        setTestimonial(
          refreshed.testimonial
        );

        setForm(
          testimonialToForm(
            refreshed.testimonial
          )
        );

        setSuccess(
          data?.message ||
            "Testimonio actualizado correctamente."
        );

        await onUpdated?.();
      } catch (error) {
        console.error(
          "Error guardando testimonio:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar los cambios."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ============================================
     UPDATE STATUS
  ============================================ */

  const handleStatusChange =
    async () => {
      if (
        !testimonial ||
        !pendingStatus
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);
        setError("");
        setSuccess("");

        const data =
          await updateAdminTestimonialStatus(
            testimonial.id,
            pendingStatus
          );

        const refreshed =
          await getAdminTestimonialById(
            testimonial.id
          );

        setTestimonial(
          refreshed.testimonial
        );

        setForm(
          testimonialToForm(
            refreshed.testimonial
          )
        );

        setPendingStatus(null);

        setSuccess(
          data?.message ||
            "Estado actualizado correctamente."
        );

        await onUpdated?.();
      } catch (error) {
        console.error(
          "Error actualizando estado:",
          error
        );

        setPendingStatus(null);

        setError(
          error.response?.data
            ?.message ||
            "No fue posible actualizar el estado."
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  /* ============================================
     DELETE
  ============================================ */

  const handleDelete =
    async () => {
      if (!testimonial) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteAdminTestimonial(
          testimonial.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando testimonio:",
          error
        );

        setDeleteConfirm(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar el testimonio."
        );
      } finally {
        setDeleting(false);
      }
    };

  const allowedTransitions =
    testimonial
      ? STATUS_TRANSITIONS[
          testimonial.status
        ] || []
      : [];

  const publicVisible =
    testimonial?.status ===
      "APPROVED" &&
    testimonial
      ?.consent_to_publish ===
      true;

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
          !pendingStatus &&
          !deleteConfirm
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          max-h-[92vh]
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
              Testimonio
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
              Revisión y moderación
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

        {/* CONTENT */}

        {loading ? (
          <div className="p-8">
            <DetailSkeleton />
          </div>
        ) : error &&
          !testimonial ? (
          <div className="p-8">
            <FeedbackBox
              type="error"
            >
              {error}
            </FeedbackBox>
          </div>
        ) : testimonial &&
          form ? (
          <div
            className="
              grid
              lg:grid-cols-[1.2fr_0.8fr]
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
              {/* CLIENT */}

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <Avatar
                  testimonial={
                    testimonial
                  }
                  large
                />

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <h3
                      className="
                        text-2xl
                        font-semibold
                        tracking-[-0.035em]
                        text-[var(--theme-text-primary)]
                      "
                    >
                      {
                        testimonial.client_name
                      }
                    </h3>

                    {testimonial.is_featured && (
                      <FeaturedBadge />
                    )}
                  </div>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--theme-text-secondary)]
                    "
                  >
                    {[
                      testimonial.position,
                      testimonial.company_name,
                    ]
                      .filter(Boolean)
                      .join(" · ") ||
                      "Sin información profesional"}
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <StatusBadge
                      status={
                        testimonial.status
                      }
                    />

                    <VisibilityBadge
                      visible={
                        publicVisible
                      }
                    />
                  </div>
                </div>
              </div>

              {/* EDIT FORM */}

              <SectionTitle>
                Información del cliente
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
                  name="client_name"
                  value={
                    form.client_name
                  }
                  onChange={
                    handleChange
                  }
                  required
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
                />

                <Field
                  label="Cargo"
                  name="position"
                  value={
                    form.position
                  }
                  onChange={
                    handleChange
                  }
                />

                <Field
                  label="Proyecto"
                  name="project_name"
                  value={
                    form.project_name
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <SectionTitle>
                Testimonio
              </SectionTitle>

              <div className="mt-4">
                <label
                  htmlFor="testimonial-review"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Reseña
                </label>

                <textarea
                  id="testimonial-review"
                  name="review"
                  rows="8"
                  value={
                    form.review
                  }
                  onChange={
                    handleChange
                  }
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
                    transition
                    focus:border-[var(--theme-accent)]/25
                  "
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
                <div>
                  <label
                    htmlFor="testimonial-rating"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-[var(--theme-text-secondary)]
                    "
                  >
                    Valoración
                  </label>

                  <select
                    id="testimonial-rating"
                    name="rating"
                    value={
                      form.rating
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
                      transition
                      focus:border-[var(--theme-accent)]/25
                    "
                  >
                    {[5, 4, 3, 2, 1].map(
                      (rating) => (
                        <option
                          key={rating}
                          value={rating}
                        >
                          {rating}{" "}
                          {rating === 1
                            ? "estrella"
                            : "estrellas"}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className="
                    flex
                    items-end
                  "
                >
                  <div
                    className="
                      flex
                      min-h-[50px]
                      w-full
                      items-center
                      rounded-xl
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-secondary)]
                      px-4
                    "
                  >
                    <Rating
                      value={
                        form.rating
                      }
                      large
                    />
                  </div>
                </div>
              </div>

              <SectionTitle>
                Enlaces y avatar
              </SectionTitle>

              <div
                className="
                  mt-4
                  grid
                  gap-4
                "
              >
                <Field
                  label="LinkedIn"
                  name="linkedin_url"
                  value={
                    form.linkedin_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://linkedin.com/..."
                />

                <Field
                  label="Sitio web"
                  name="website_url"
                  value={
                    form.website_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />

                <Field
                  label="URL avatar"
                  name="avatar_url"
                  value={
                    form.avatar_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />
              </div>

              {/* FEATURED */}

              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  p-5
                "
              >
                <label
                  className="
                    flex
                    cursor-pointer
                    items-start
                    gap-3
                  "
                >
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={
                      form.is_featured
                    }
                    onChange={
                      handleChange
                    }
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
                      Testimonio destacado
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-[var(--theme-text-muted)]
                      "
                    >
                      Los testimonios
                      destacados tendrán
                      prioridad en el
                      orden público.
                    </p>
                  </div>
                </label>
              </div>

              {/* SAVE */}

              <button
                type="button"
                onClick={
                  handleSave
                }
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
                  : "Guardar cambios"}
              </button>
            </div>

            {/* RIGHT */}

            <div
              className="
                p-6
                sm:p-8
              "
            >
              {/* PUBLICATION */}

              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-[var(--theme-text-muted)]
                  "
                >
                  Publicación
                </p>

                <div
                  className="
                    mt-4
                    rounded-xl
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
                        Estado actual
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={
                            testimonial.status
                          }
                        />
                      </div>
                    </div>

                    <VisibilityBadge
                      visible={
                        publicVisible
                      }
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      border-t
                      border-[var(--theme-border)]
                      pt-5
                    "
                  >
                    <TechnicalRow
                      label="Consentimiento"
                      value={
                        testimonial
                          .consent_to_publish
                          ? "Autorizado"
                          : "No autorizado"
                      }
                    />

                    <div className="mt-3">
                      <TechnicalRow
                        label="Aprobado"
                        value={
                          testimonial
                            .approved_at
                            ? formatDateTime(
                                testimonial.approved_at
                              )
                            : "—"
                        }
                      />
                    </div>
                  </div>
                </div>

                {!testimonial
                  .consent_to_publish && (
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
                      leading-5
                      text-[var(--theme-warning)]
                    "
                  >
                    Este testimonio no
                    tiene autorización de
                    publicación. Aunque
                    sea aprobado, no
                    debería considerarse
                    visible públicamente.
                  </div>
                )}
              </div>

              {/* ACTIONS */}

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
                  Moderación
                </p>

                <div
                  className="
                    mt-4
                    grid
                    gap-2
                  "
                >
                  {allowedTransitions.map(
                    (status) => (
                      <StatusActionButton
                        key={status}
                        status={status}
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setPendingStatus(
                            status
                          );
                        }}
                      />
                    )
                  )}
                </div>
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
                  Vista previa
                </p>

                <TestimonialPreview
                  form={form}
                />
              </div>

              {/* FEEDBACK */}

              {error && (
                <div className="mt-5">
                  <FeedbackBox
                    type="error"
                  >
                    {error}
                  </FeedbackBox>
                </div>
              )}

              {success && (
                <div className="mt-5">
                  <FeedbackBox
                    type="success"
                  >
                    {success}
                  </FeedbackBox>
                </div>
              )}

              {/* METADATA */}

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
                  Información
                </p>

                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >
                  <TechnicalRow
                    label="Creado"
                    value={formatDateTime(
                      testimonial.created_at
                    )}
                  />

                  <TechnicalRow
                    label="Actualizado"
                    value={formatDateTime(
                      testimonial.updated_at
                    )}
                  />
                </div>
              </div>

              {/* DELETE */}

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
                  Eliminar testimonio
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
                  Eliminar testimonio
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* STATUS CONFIRM */}

        {pendingStatus &&
          testimonial && (
            <StatusConfirmationModal
              testimonial={
                testimonial
              }
              status={
                pendingStatus
              }
              loading={
                updatingStatus
              }
              onCancel={() =>
                setPendingStatus(
                  null
                )
              }
              onConfirm={
                handleStatusChange
              }
            />
          )}

        {/* DELETE CONFIRM */}

        {deleteConfirm &&
          testimonial && (
            <DeleteTestimonialModal
              testimonial={
                testimonial
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

function TestimonialPreview({
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
          items-center
          justify-between
          gap-4
        "
      >
        <Rating
          value={
            form.rating
          }
        />

        {form.is_featured && (
          <FeaturedBadge />
        )}
      </div>

      <p
        className="
          mt-5
          text-sm
          leading-7
          text-[var(--theme-text-primary)]
        "
      >
        “
        {form.review ||
          "Vista previa del testimonio."}
        ”
      </p>

      <div
        className="
          mt-6
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          {form.client_name ||
            "Cliente"}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {[
            form.position,
            form.company_name,
          ]
            .filter(Boolean)
            .join(" · ") ||
            "Información profesional"}
        </p>
      </div>
    </div>
  );
}

/* ============================================
   STATUS CONFIRMATION
============================================ */

function StatusConfirmationModal({
  testimonial,
  status,
  loading,
  onCancel,
  onConfirm,
}) {
  const config =
    getStatusChangeConfig(
      status
    );

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
          shadow-2xl
        "
      >
        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border

            ${config.iconClass}
          `}
        >
          {config.icon}
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          {config.title}
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--theme-text-secondary)]
          "
        >
          {config.description}
        </p>

        <div
          className="
            mt-5
            rounded-xl
            border
            border-[var(--theme-border)]
            bg-[var(--theme-bg-secondary)]
            p-4
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {testimonial.client_name}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-[var(--theme-text-muted)]
            "
          >
            {testimonial.company_name ||
              testimonial.project_name ||
              "Testimonio"}
          </p>
        </div>

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
              font-medium
              text-[var(--theme-text-secondary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
              disabled:opacity-40
            "
          >
            Volver
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex-1
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              transition
              disabled:opacity-40

              ${config.buttonClass}
            `}
          >
            {loading
              ? "Procesando..."
              : config.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   DELETE MODAL
============================================ */

function DeleteTestimonialModal({
  testimonial,
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
          shadow-2xl
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
          ¿Eliminar testimonio?
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
          permanentemente el
          testimonio de{" "}
          <strong
            className="
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {testimonial.client_name}
          </strong>
          . Esta acción no se
          puede deshacer.
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
              font-medium
              text-[var(--theme-text-secondary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
              disabled:opacity-40
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
              transition
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
   FORM FIELD
============================================ */

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
        htmlFor={`testimonial-${name}`}
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
        id={`testimonial-${name}`}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
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
          transition
          placeholder:text-[var(--theme-text-subtle)]
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

/* ============================================
   STATUS ACTION
============================================ */

function StatusActionButton({
  status,
  onClick,
}) {
  const config =
    getStatusActionConfig(
      status
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        justify-between
        rounded-xl
        border
        px-4
        py-3.5
        text-left
        text-sm
        font-medium
        transition

        ${config.className}
      `}
    >
      <span>
        {config.label}
      </span>

      <span>→</span>
    </button>
  );
}

/* ============================================
   FILTER BUTTON
============================================ */

function StatusFilterButton({
  active,
  label,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        shrink-0
        items-center
        gap-2
        rounded-lg
        border
        px-3.5
        py-2.5
        text-xs
        font-medium
        transition

        ${
          active
            ? `
              border-[var(--theme-accent)]
              bg-[var(--theme-accent)]
              text-[var(--theme-bg-page)]
            `
            : `
              border-[var(--theme-border)]
              text-[var(--theme-text-secondary)]
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
            `
        }
      `}
    >
      {label}

      <span
        className={`
          rounded-md
          px-1.5
          py-0.5
          text-[10px]

          ${
            active
              ? "bg-[var(--theme-bg-page)] text-[var(--theme-text-primary)]"
              : "bg-[var(--theme-border)] text-[var(--theme-text-muted)]"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}

/* ============================================
   STATUS BADGE
============================================ */

function StatusBadge({
  status,
}) {
  const config =
    getStatusConfig(status);

  return (
    <span
      className={`
        inline-flex
        w-fit
        items-center
        gap-2
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${config.className}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${config.dot}
        `}
      />

      {config.label}
    </span>
  );
}

/* ============================================
   VISIBILITY
============================================ */

function VisibilityBadge({
  visible,
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
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]

        ${
          visible
            ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
            : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-muted)]"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            visible
              ? "bg-[var(--theme-success)]"
              : "bg-[var(--theme-text-muted)]"
          }
        `}
      />

      {visible
        ? "Visible"
        : "No visible"}
    </span>
  );
}

/* ============================================
   FEATURED
============================================ */

function FeaturedBadge() {
  return (
    <span
      className="
        inline-flex
        shrink-0
        items-center
        rounded-md
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        px-1.5
        py-0.5
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-[var(--theme-text-secondary)]
      "
    >
      Destacado
    </span>
  );
}

/* ============================================
   AVATAR
============================================ */

function Avatar({
  testimonial,
  large = false,
}) {
  const initials =
    String(
      testimonial.client_name ||
        "?"
    )
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("");

  const size =
    large
      ? "h-14 w-14"
      : "h-10 w-10";

  if (
    testimonial.avatar_url
  ) {
    return (
      <div
        className={`
          ${size}
          shrink-0
          overflow-hidden
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-border)]
        `}
      >
        <img
          src={
            testimonial.avatar_url
          }
          alt=""
          className="
            h-full
            w-full
            object-cover
          "
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${size}
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
        text-[var(--theme-text-primary)]
      `}
    >
      {initials}
    </div>
  );
}

/* ============================================
   RATING
============================================ */

function Rating({
  value,
  large = false,
}) {
  const rating =
    Math.max(
      0,
      Math.min(
        5,
        Number(value) || 0
      )
    );

  return (
    <div
      className="
        flex
        items-center
        gap-1
      "
      aria-label={`${rating} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <span
            key={star}
            className={`
              ${
                large
                  ? "text-lg"
                  : "text-sm"
              }

              ${
                star <= rating
                  ? "text-[var(--theme-text-primary)]"
                  : "text-[var(--theme-text-subtle)]"
              }
            `}
          >
            ★
          </span>
        )
      )}

      <span
        className="
          ml-2
          text-[10px]
          text-[var(--theme-text-muted)]
        "
      >
        {rating}/5
      </span>
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

function SectionTitle({
  children,
}) {
  return (
    <p
      className="
        mt-8
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

function TechnicalRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-4
        text-xs
      "
    >
      <span
        className="
          text-[var(--theme-text-subtle)]
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[220px]
          break-words
          text-right
          text-[var(--theme-text-secondary)]
        "
      >
        {value || "—"}
      </span>
    </div>
  );
}

function FeedbackBox({
  type,
  children,
}) {
  const className =
    type === "success"
      ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
      : "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]";

  return (
    <div
      className={`
        rounded-xl
        border
        px-4
        py-3
        text-sm

        ${className}
      `}
    >
      {children}
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
   EMPTY
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
          ? "No encontramos testimonios con estos filtros."
          : "Todavía no hay testimonios registrados."}
      </p>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-xs
          leading-5
          text-[var(--theme-text-subtle)]
        "
      >
        {filtered
          ? "Prueba cambiando el estado o el término de búsqueda."
          : "Los testimonios enviados desde el formulario público aparecerán aquí para su moderación."}
      </p>
    </div>
  );
}

/* ============================================
   SKELETONS
============================================ */

function TestimonialsSkeleton() {
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
                  w-40
                  rounded
                  bg-[var(--theme-border)]
                "
              />

              <div
                className="
                  mt-3
                  h-2
                  w-60
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

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="
          h-14
          w-14
          rounded-xl
          bg-[var(--theme-border)]
        "
      />

      <div
        className="
          mt-6
          h-6
          w-52
          rounded
          bg-[var(--theme-border)]
        "
      />

      <div
        className="
          mt-3
          h-3
          w-36
          rounded
          bg-[var(--theme-border)]
        "
      />

      <div
        className="
          mt-10
          h-44
          rounded-2xl
          bg-[var(--theme-bg-secondary)]
        "
      />
    </div>
  );
}

/* ============================================
   STATUS CONFIG
============================================ */

function getStatusConfig(
  status
) {
  const configs = {
    PENDING: {
      label: "Pendiente",
      className:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
      dot: "bg-[var(--theme-warning)]",
    },

    APPROVED: {
      label: "Aprobado",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
      dot: "bg-[var(--theme-success)]",
    },

    REJECTED: {
      label: "Rechazado",
      className:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
      dot: "bg-[var(--theme-danger)]",
    },

    HIDDEN: {
      label: "Oculto",
      className:
        "border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
      dot: "bg-[var(--theme-text-muted)]",
    },
  };

  return (
    configs[status] || {
      label:
        status || "Sin estado",
      className:
        "border-[var(--theme-border)] bg-[var(--theme-border)] text-[var(--theme-text-secondary)]",
      dot: "bg-[var(--theme-text-muted)]",
    }
  );
}

function getStatusActionConfig(
  status
) {
  const configs = {
    APPROVED: {
      label:
        "Aprobar testimonio",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)] hover:bg-[var(--theme-success-soft)]",
    },

    REJECTED: {
      label:
        "Rechazar testimonio",
      className:
        "border-[var(--theme-danger)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]",
    },

    HIDDEN: {
      label:
        "Ocultar testimonio",
      className:
        "border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)]",
    },

    PENDING: {
      label:
        "Volver a pendiente",
      className:
        "border-[var(--theme-warning)] text-[var(--theme-warning)] hover:bg-[var(--theme-warning-soft)]",
    },
  };

  return (
    configs[status] || {
      label: status,
      className:
        "border-[var(--theme-border)] text-[var(--theme-text-secondary)]",
    }
  );
}

function getStatusChangeConfig(
  status
) {
  const configs = {
    APPROVED: {
      title:
        "¿Aprobar este testimonio?",
      description:
        "El testimonio quedará aprobado. Si cuenta con consentimiento de publicación, podrá aparecer en la sección pública.",
      buttonLabel:
        "Aprobar",
      buttonClass:
        "bg-[var(--theme-accent)] text-[var(--theme-bg-page)] hover:bg-[var(--theme-accent-hover)]",
      icon: "✓",
      iconClass:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
    },

    REJECTED: {
      title:
        "¿Rechazar este testimonio?",
      description:
        "El testimonio quedará rechazado y no será visible públicamente.",
      buttonLabel:
        "Rechazar",
      buttonClass:
        "bg-[var(--theme-danger)] text-[var(--theme-text-primary)] hover:opacity-90",
      icon: "!",
      iconClass:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
    },

    HIDDEN: {
      title:
        "¿Ocultar este testimonio?",
      description:
        "El testimonio dejará de mostrarse públicamente, pero permanecerá guardado en el backoffice.",
      buttonLabel:
        "Ocultar",
      buttonClass:
        "bg-[var(--theme-text-secondary)] text-[var(--theme-bg-page)] hover:opacity-90",
      icon: "—",
      iconClass:
        "border-[var(--theme-border)] bg-[var(--theme-border)] text-[var(--theme-text-secondary)]",
    },

    PENDING: {
      title:
        "¿Volver a pendiente?",
      description:
        "El testimonio volverá a la cola de revisión y no se mostrará públicamente.",
      buttonLabel:
        "Volver a pendiente",
      buttonClass:
        "bg-[var(--theme-warning)] text-[var(--theme-bg-page)] hover:opacity-90",
      icon: "↺",
      iconClass:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
    },
  };

  return (
    configs[status] || {
      title:
        "¿Actualizar estado?",
      description:
        "Se actualizará el estado del testimonio.",
      buttonLabel:
        "Continuar",
      buttonClass:
        "bg-[var(--theme-accent)] text-[var(--theme-bg-page)] hover:bg-[var(--theme-accent-hover)]",
      icon: "→",
      iconClass:
        "border-[var(--theme-border)] bg-[var(--theme-border)] text-[var(--theme-text-primary)]",
    }
  );
}

/* ============================================
   HELPERS
============================================ */

function testimonialToForm(
  testimonial
) {
  return {
    client_name:
      testimonial.client_name ||
      "",

    company_name:
      testimonial.company_name ||
      "",

    position:
      testimonial.position ||
      "",

    project_name:
      testimonial.project_name ||
      "",

    review:
      testimonial.review ||
      "",

    rating:
      Number(
        testimonial.rating
      ) || 5,

    linkedin_url:
      testimonial.linkedin_url ||
      "",

    website_url:
      testimonial.website_url ||
      "",

    avatar_url:
      testimonial.avatar_url ||
      "",

    is_featured:
      Boolean(
        testimonial.is_featured
      ),
  };
}

function normalizeNullable(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized ||
    null;
}

function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function truncateText(
  text,
  maxLength
) {
  if (!text) {
    return "";
  }

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength
  )}…`;
}

export default TestimonialsAdminPage;
