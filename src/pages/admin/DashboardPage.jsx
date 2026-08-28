import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getAdminDashboard,
} from "../../services/dashboardAdminService";

/* ============================================
   CONSTANTS
============================================ */

const EMPTY_DATA = {
  projects: [],
  bookings: [],
  leads: [],
  testimonials: [],
  services: [],
  consultingServices: [],
  experiences: [],
  certifications: [],
  failedSources: [],
};

const BOOKING_STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
];

const BOOKING_LABELS = {
  PENDING: "Pendientes",
  CONFIRMED: "Confirmadas",
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  REJECTED: "Rechazadas",
  NO_SHOW: "No asistió",
};

const LEAD_LABELS = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  MEETING: "Reunión",
  QUOTATION: "Cotización",
  WON: "Ganado",
  LOST: "Perdido",
};

/* ============================================
   PAGE
============================================ */

function DashboardPage() {
  const [data, setData] =
    useState(EMPTY_DATA);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminDashboard();

        setData({
          ...EMPTY_DATA,
          ...response,
        });
      } catch (error) {
        console.error(
          "Error cargando dashboard:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar el dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ============================================
     CORE METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      const publishedProjects =
        data.projects.filter(
          (item) =>
            item.is_published
        ).length;

      const pendingBookings =
        data.bookings.filter(
          (item) =>
            item.status ===
            "PENDING"
        ).length;

      const newLeads =
        data.leads.filter(
          (item) =>
            item.status === "NEW"
        ).length;

      const pendingTestimonials =
        data.testimonials.filter(
          (item) =>
            item.status ===
            "PENDING"
        ).length;

      return {
        publishedProjects,
        totalProjects:
          data.projects.length,
        pendingBookings,
        newLeads,
        pendingTestimonials,
      };
    }, [data]);

  /* ============================================
     CONTENT METRICS
  ============================================ */

  const contentMetrics =
    useMemo(() => {
      return [
        {
          label: "Servicios",
          value:
            data.services.filter(
              (item) =>
                item.is_active
            ).length,
          total:
            data.services.length,
          to: "/admin/services",
          suffix: "activos",
        },
        {
          label: "Asesorías",
          value:
            data.consultingServices.filter(
              (item) =>
                item.is_active
            ).length,
          total:
            data.consultingServices.length,
          to: "/admin/consulting-services",
          suffix: "activas",
        },
        {
          label: "Experiencia",
          value:
            data.experiences.filter(
              (item) =>
                item.is_published
            ).length,
          total:
            data.experiences.length,
          to: "/admin/experiences",
          suffix: "publicadas",
        },
        {
          label: "Certificaciones",
          value:
            data.certifications.filter(
              (item) =>
                item.is_published
            ).length,
          total:
            data.certifications.length,
          to: "/admin/certifications",
          suffix: "publicadas",
        },
      ];
    }, [data]);

  /* ============================================
     BOOKING STATUS
  ============================================ */

  const bookingStatus =
    useMemo(() => {
      const total =
        data.bookings.length;

      return BOOKING_STATUS_ORDER.map(
        (status) => {
          const count =
            data.bookings.filter(
              (booking) =>
                booking.status ===
                status
            ).length;

          return {
            status,
            label:
              BOOKING_LABELS[
                status
              ],
            count,
            percentage:
              total > 0
                ? Math.round(
                    (count /
                      total) *
                      100
                  )
                : 0,
          };
        }
      );
    }, [data.bookings]);

  /* ============================================
     UPCOMING BOOKINGS
  ============================================ */

  const upcomingBookings =
    useMemo(() => {
      const now =
        new Date();

      return data.bookings
        .filter(
          (booking) =>
            [
              "PENDING",
              "CONFIRMED",
            ].includes(
              booking.status
            )
        )
        .map((booking) => ({
          ...booking,
          _date:
            bookingDateTime(
              booking
            ),
        }))
        .filter(
          (booking) =>
            booking._date &&
            booking._date >= now
        )
        .sort(
          (a, b) =>
            a._date -
            b._date
        )
        .slice(0, 5);
    }, [data.bookings]);

  /* ============================================
     RECENT LEADS
  ============================================ */

  const recentLeads =
    useMemo(() => {
      return [...data.leads]
        .sort(
          (a, b) =>
            safeTimestamp(
              b.created_at
            ) -
            safeTimestamp(
              a.created_at
            )
        )
        .slice(0, 5);
    }, [data.leads]);

  /* ============================================
     RECENT ACTIVITY
  ============================================ */

  const recentActivity =
    useMemo(() => {
      const leadActivity =
        data.leads.map(
          (lead) => ({
            id:
              `lead-${lead.id}`,
            type: "LEAD",
            title:
              lead.name ||
              "Nuevo contacto",
            description:
              lead.service_type ||
              "Consulta general",
            status:
              lead.status,
            date:
              lead.created_at,
            to: "/admin/leads",
          })
        );

      const bookingActivity =
        data.bookings.map(
          (booking) => ({
            id:
              `booking-${booking.id}`,
            type: "BOOKING",
            title:
              booking.client_name ||
              "Nueva reserva",
            description:
              booking
                .consulting_service
                ?.name ||
              "Asesoría",
            status:
              booking.status,
            date:
              booking.created_at,
            to: "/admin/bookings",
          })
        );

      const testimonialActivity =
        data.testimonials.map(
          (testimonial) => ({
            id:
              `testimonial-${testimonial.id}`,
            type:
              "TESTIMONIAL",
            title:
              testimonial.client_name ||
              testimonial.name ||
              "Nuevo testimonio",
            description:
              "Testimonio",
            status:
              testimonial.status,
            date:
              testimonial.created_at,
            to: "/admin/testimonials",
          })
        );

      return [
        ...leadActivity,
        ...bookingActivity,
        ...testimonialActivity,
      ]
        .filter(
          (item) =>
            item.date
        )
        .sort(
          (a, b) =>
            safeTimestamp(
              b.date
            ) -
            safeTimestamp(
              a.date
            )
        )
        .slice(0, 7);
    }, [
      data.leads,
      data.bookings,
      data.testimonials,
    ]);

  const attentionItems =
    useMemo(
      () => [
        {
          label:
            "Reservas pendientes",
          value:
            metrics.pendingBookings,
          description:
            "Solicitudes esperando confirmación.",
          to: "/admin/bookings",
        },
        {
          label: "Leads nuevos",
          value:
            metrics.newLeads,
          description:
            "Contactos todavía sin gestionar.",
          to: "/admin/leads",
        },
        {
          label:
            "Testimonios pendientes",
          value:
            metrics.pendingTestimonials,
          description:
            "Reseñas esperando moderación.",
          to: "/admin/testimonials",
        },
      ],
      [metrics]
    );

  return (
    <div className="min-h-full text-[var(--theme-text-primary)]">
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
              theme-eyebrow
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
            "
          >
            Administración
          </p>

          <h1
            className="
              theme-title
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.04em]
            "
          >
            Dashboard
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
            Resumen operativo del
            portafolio, reservas,
            oportunidades comerciales
            y contenido público.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          <div
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-card)]
              px-4
              py-3
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
              Última carga
            </p>

            <p
              className="
                mt-1
                text-xs
                text-[var(--theme-text-secondary)]
              "
            >
              {loading
                ? "Actualizando..."
                : formatNow()}
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadDashboard
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
        </div>
      </div>

      {/* ========================================
          PARTIAL SOURCE WARNING
      ======================================== */}

      {!loading &&
        data.failedSources.length >
          0 && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-[var(--theme-warning)]
              bg-[var(--theme-warning-soft)]
              px-5
              py-4
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-[var(--theme-warning)]
              "
            >
              El dashboard se cargó
              parcialmente.
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[var(--theme-warning)]
              "
            >
              No respondieron:{" "}
              {data.failedSources
                .map(
                  (item) =>
                    item.name
                )
                .join(", ")}
              .
            </p>
          </div>
        )}

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
          MAIN KPI
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
        <MainMetric
          label="Proyectos publicados"
          value={
            loading
              ? "—"
              : metrics.publishedProjects
          }
          secondary={
            loading
              ? ""
              : `de ${metrics.totalProjects}`
          }
          to="/admin/projects"
        />

        <MainMetric
          label="Reservas pendientes"
          value={
            loading
              ? "—"
              : metrics.pendingBookings
          }
          secondary="requieren revisión"
          to="/admin/bookings"
          attention={
            metrics.pendingBookings >
            0
          }
        />

        <MainMetric
          label="Leads nuevos"
          value={
            loading
              ? "—"
              : metrics.newLeads
          }
          secondary="sin gestionar"
          to="/admin/leads"
          attention={
            metrics.newLeads > 0
          }
        />

        <MainMetric
          label="Testimonios pendientes"
          value={
            loading
              ? "—"
              : metrics.pendingTestimonials
          }
          secondary="por moderar"
          to="/admin/testimonials"
          attention={
            metrics.pendingTestimonials >
            0
          }
        />
      </div>

      {/* ========================================
          ATTENTION
      ======================================== */}

      <section className="mt-10">
        <SectionHeader
          eyebrow="Prioridad"
          title="Requiere atención"
          description="Elementos que conviene revisar antes que el resto."
        />

        <div
          className="
            mt-5
            grid
            gap-3
            lg:grid-cols-3
          "
        >
          {attentionItems.map(
            (item) => (
              <AttentionCard
                key={item.label}
                {...item}
                loading={loading}
              />
            )
          )}
        </div>
      </section>

      {/* ========================================
          RESERVATIONS + LEADS
      ======================================== */}

      <section
        className="
          mt-10
          grid
          gap-5
          xl:grid-cols-2
        "
      >
        <Panel>
          <PanelHeader
            eyebrow="Agenda"
            title="Próximas reservas"
            to="/admin/bookings"
            action="Ver reservas"
          />

          {loading ? (
            <ListSkeleton />
          ) : upcomingBookings.length ===
            0 ? (
            <SmallEmpty
              title="Sin próximas reservas"
              description="No hay reservas pendientes o confirmadas en fechas futuras."
            />
          ) : (
            <div className="mt-5">
              {upcomingBookings.map(
                (
                  booking,
                  index
                ) => (
                  <BookingRow
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                    last={
                      index ===
                      upcomingBookings.length -
                        1
                    }
                  />
                )
              )}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="CRM"
            title="Leads recientes"
            to="/admin/leads"
            action="Ver leads"
          />

          {loading ? (
            <ListSkeleton />
          ) : recentLeads.length ===
            0 ? (
            <SmallEmpty
              title="Sin leads"
              description="Todavía no se han recibido consultas desde el portafolio."
            />
          ) : (
            <div className="mt-5">
              {recentLeads.map(
                (
                  lead,
                  index
                ) => (
                  <LeadRow
                    key={
                      lead.id
                    }
                    lead={lead}
                    last={
                      index ===
                      recentLeads.length -
                        1
                    }
                  />
                )
              )}
            </div>
          )}
        </Panel>
      </section>

      {/* ========================================
          BOOKING STATUS + CONTENT
      ======================================== */}

      <section
        className="
          mt-5
          grid
          gap-5
          xl:grid-cols-[1.15fr_0.85fr]
        "
      >
        <Panel>
          <PanelHeader
            eyebrow="Reservas"
            title="Estado general"
            to="/admin/bookings"
            action="Administrar"
          />

          <div
            className="
              mt-7
              space-y-5
            "
          >
            {bookingStatus.map(
              (item) => (
                <StatusProgress
                  key={
                    item.status
                  }
                  {...item}
                  loading={loading}
                />
              )
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Contenido"
            title="Publicación"
          />

          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              xl:grid-cols-1
            "
          >
            {contentMetrics.map(
              (item) => (
                <ContentRow
                  key={item.label}
                  {...item}
                  loading={loading}
                />
              )
            )}
          </div>
        </Panel>
      </section>

      {/* ========================================
          ACTIVITY + QUICK LINKS
      ======================================== */}

      <section
        className="
          mt-5
          grid
          gap-5
          xl:grid-cols-[1.15fr_0.85fr]
        "
      >
        <Panel>
          <PanelHeader
            eyebrow="Actividad"
            title="Movimiento reciente"
          />

          {loading ? (
            <ListSkeleton />
          ) : recentActivity.length ===
            0 ? (
            <SmallEmpty
              title="Sin actividad reciente"
              description="La actividad aparecerá a medida que ingresen reservas, leads o testimonios."
            />
          ) : (
            <div className="mt-5">
              {recentActivity.map(
                (
                  activity,
                  index
                ) => (
                  <ActivityRow
                    key={
                      activity.id
                    }
                    activity={
                      activity
                    }
                    last={
                      index ===
                      recentActivity.length -
                        1
                    }
                  />
                )
              )}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Navegación"
            title="Accesos rápidos"
          />

          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              xl:grid-cols-1
            "
          >
            <QuickLink
              to="/admin/projects"
              title="Proyectos"
              description="Contenido y tecnologías"
            />

            <QuickLink
              to="/admin/consulting-services"
              title="Asesorías"
              description="Tarifas y duración"
            />

            <QuickLink
              to="/admin/availability"
              title="Disponibilidad"
              description="Horarios y excepciones"
            />

            <QuickLink
              to="/admin/testimonials"
              title="Testimonios"
              description="Moderación de reseñas"
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}

/* ============================================
   MAIN METRIC
============================================ */

function MainMetric({
  label,
  value,
  secondary,
  to,
  attention = false,
}) {
  return (
    <Link
      to={to}
      className="
        group
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
        transition
        hover:border-[var(--theme-border-strong)]
        hover:bg-[var(--theme-accent-soft)]
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
        <p
          className="
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {label}
        </p>

        {attention && (
          <span
            className="
              mt-1
              h-2
              w-2
              rounded-full
              bg-[var(--theme-warning)]
            "
          />
        )}
      </div>

      <div
        className="
          mt-5
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <p
          className="
            text-3xl
            font-semibold
            tracking-[-0.05em]
            text-[var(--theme-text-primary)]
          "
        >
          {value}
        </p>

        <span
          className="
            text-xs
            text-[var(--theme-text-subtle)]
            transition
            group-hover:text-[var(--theme-text-secondary)]
          "
        >
          →
        </span>
      </div>

      <p
        className="
          mt-2
          text-[11px]
          text-[var(--theme-text-subtle)]
        "
      >
        {secondary}
      </p>
    </Link>
  );
}

/* ============================================
   ATTENTION
============================================ */

function AttentionCard({
  label,
  value,
  description,
  to,
  loading,
}) {
  const resolvedValue =
    loading ? "—" : value;

  const hasAttention =
    !loading &&
    Number(value) > 0;

  return (
    <Link
      to={to}
      className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
        transition
        hover:border-[var(--theme-border-strong)]
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          text-sm
          font-semibold

          ${
            hasAttention
              ? "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]"
              : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]"
          }
        `}
      >
        {resolvedValue}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[var(--theme-text-subtle)]
          "
        >
          {description}
        </p>
      </div>
    </Link>
  );
}

/* ============================================
   PANELS
============================================ */

function Panel({
  children,
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
        sm:p-6
      "
    >
      {children}
    </article>
  );
}

function PanelHeader({
  eyebrow,
  title,
  to,
  action,
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-5
      "
    >
      <div>
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-[var(--theme-text-subtle)]
          "
        >
          {eyebrow}
        </p>

        <h2
          className="
            mt-2
            text-lg
            font-semibold
            tracking-[-0.025em]
            text-[var(--theme-text-primary)]
          "
        >
          {title}
        </h2>
      </div>

      {to && action && (
        <Link
          to={to}
          className="
            shrink-0
            text-xs
            font-medium
            text-[var(--theme-text-muted)]
            transition
            hover:text-[var(--theme-text-primary)]
          "
        >
          {action} →
        </Link>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-[var(--theme-text-subtle)]
        "
      >
        {eyebrow}
      </p>

      <h2
        className="
          mt-2
          text-lg
          font-semibold
          tracking-[-0.025em]
          text-[var(--theme-text-primary)]
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          text-xs
          text-[var(--theme-text-muted)]
        "
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================
   BOOKINGS
============================================ */

function BookingRow({
  booking,
  last,
}) {
  return (
    <Link
      to="/admin/bookings"
      className={`
        flex
        items-center
        justify-between
        gap-4
        py-4
        transition
        hover:bg-[var(--theme-accent-soft)]

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
          min-w-0
          items-center
          gap-3
        "
      >
        <Initials
          name={
            booking.client_name
          }
        />

        <div className="min-w-0">
          <p
            className="
              truncate
              text-sm
              font-medium
              text-[var(--theme-text-primary)]
            "
          >
            {booking.client_name}
          </p>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-[var(--theme-text-subtle)]
            "
          >
            {booking
              .consulting_service
              ?.name ||
              "Asesoría"}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <StatusBadge
          status={
            booking.status
          }
          type="booking"
        />

        <p
          className="
            mt-2
            text-[10px]
            text-[var(--theme-text-subtle)]
          "
        >
          {formatBookingDate(
            booking
          )}
        </p>
      </div>
    </Link>
  );
}

/* ============================================
   LEADS
============================================ */

function LeadRow({
  lead,
  last,
}) {
  return (
    <Link
      to="/admin/leads"
      className={`
        flex
        items-center
        justify-between
        gap-4
        py-4
        transition
        hover:bg-[var(--theme-accent-soft)]

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
          min-w-0
          items-center
          gap-3
        "
      >
        <Initials
          name={lead.name}
        />

        <div className="min-w-0">
          <p
            className="
              truncate
              text-sm
              font-medium
              text-[var(--theme-text-primary)]
            "
          >
            {lead.name}
          </p>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-[var(--theme-text-subtle)]
            "
          >
            {lead.company ||
              lead.service_type ||
              lead.email}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <StatusBadge
          status={lead.status}
          type="lead"
        />

        <p
          className="
            mt-2
            text-[10px]
            text-[var(--theme-text-subtle)]
          "
        >
          {formatDateTime(
            lead.created_at
          )}
        </p>
      </div>
    </Link>
  );
}

/* ============================================
   STATUS PROGRESS
============================================ */

function StatusProgress({
  label,
  count,
  percentage,
  loading,
}) {
  return (
    <div>
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <p
          className="
            text-xs
            text-[var(--theme-text-secondary)]
          "
        >
          {label}
        </p>

        <p
          className="
            text-xs
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {loading
            ? "—"
            : `${count} · ${percentage}%`}
        </p>
      </div>

      <div
        className="
          mt-2.5
          h-1.5
          overflow-hidden
          rounded-full
          bg-[var(--theme-border)]
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-[var(--theme-accent)]
            transition-all
            duration-500
          "
          style={{
            width: loading
              ? "0%"
              : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================
   CONTENT
============================================ */

function ContentRow({
  label,
  value,
  total,
  suffix,
  to,
  loading,
}) {
  return (
    <Link
      to={to}
      className="
        flex
        items-center
        justify-between
        gap-5
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        px-4
        py-4
        transition
        hover:border-[var(--theme-border-strong)]
      "
    >
      <div>
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          {loading
            ? "Actualizando..."
            : `${value} ${suffix}`}
        </p>
      </div>

      <div className="text-right">
        <p
          className="
            text-lg
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          {loading
            ? "—"
            : `${value}/${total}`}
        </p>

        <p
          className="
            mt-1
            text-[10px]
            text-[var(--theme-text-subtle)]
          "
        >
          →
        </p>
      </div>
    </Link>
  );
}

/* ============================================
   ACTIVITY
============================================ */

function ActivityRow({
  activity,
  last,
}) {
  return (
    <Link
      to={activity.to}
      className={`
        flex
        items-center
        gap-4
        py-4

        ${
          !last
            ? "border-b border-[var(--theme-border)]"
            : ""
        }
      `}
    >
      <ActivityIcon
        type={activity.type}
      />

      <div className="min-w-0 flex-1">
        <p
          className="
            truncate
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {activity.title}
        </p>

        <p
          className="
            mt-1
            truncate
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          {activity.description}
        </p>
      </div>

      <div
        className="
          shrink-0
          text-right
        "
      >
        <StatusBadge
          status={
            activity.status
          }
          type={
            activity.type ===
            "LEAD"
              ? "lead"
              : activity.type ===
                "BOOKING"
              ? "booking"
              : "testimonial"
          }
        />

        <p
          className="
            mt-2
            text-[10px]
            text-[var(--theme-text-subtle)]
          "
        >
          {formatDateTime(
            activity.date
          )}
        </p>
      </div>
    </Link>
  );
}

function ActivityIcon({
  type,
}) {
  const labels = {
    LEAD: "LD",
    BOOKING: "RS",
    TESTIMONIAL: "TS",
  };

  return (
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
        bg-[var(--theme-bg-secondary)]
        text-[10px]
        font-semibold
        text-[var(--theme-text-secondary)]
      "
    >
      {labels[type] || "•"}
    </div>
  );
}

/* ============================================
   QUICK LINKS
============================================ */

function QuickLink({
  to,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        px-4
        py-4
        transition
        hover:border-[var(--theme-border-strong)]
      "
    >
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
            text-[var(--theme-text-subtle)]
          "
        >
          {description}
        </p>
      </div>

      <span
        className="
          text-[var(--theme-text-subtle)]
          transition
          group-hover:text-[var(--theme-text-primary)]
        "
      >
        →
      </span>
    </Link>
  );
}

/* ============================================
   BADGES
============================================ */

function StatusBadge({
  status,
  type,
}) {
  const config =
    getStatusConfig(
      status,
      type
    );

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.07em]
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

function getStatusConfig(
  status,
  type
) {
  if (type === "lead") {
    const lead = {
      NEW: {
        label: "Nuevo",
        className:
          "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
        dot: "bg-[var(--theme-warning)]",
      },
      CONTACTED: {
        label: "Contactado",
        className:
          "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
        dot: "bg-[var(--theme-text-muted)]",
      },
      MEETING: {
        label: "Reunión",
        className:
          "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)]",
        dot: "bg-[var(--theme-text-secondary)]",
      },
      QUOTATION: {
        label: "Cotización",
        className:
          "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)]",
        dot: "bg-[var(--theme-text-secondary)]",
      },
      WON: {
        label: "Ganado",
        className:
          "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
        dot: "bg-[var(--theme-success)]",
      },
      LOST: {
        label: "Perdido",
        className:
          "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
        dot: "bg-[var(--theme-danger)]",
      },
    };

    return (
      lead[status] ||
      neutralStatus(
        LEAD_LABELS[status] ||
          status
      )
    );
  }

  if (
    type === "testimonial"
  ) {
    const testimonial = {
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
          "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
        dot: "bg-[var(--theme-text-subtle)]",
      },
    };

    return (
      testimonial[status] ||
      neutralStatus(status)
    );
  }

  const booking = {
    PENDING: {
      label: "Pendiente",
      className:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
      dot: "bg-[var(--theme-warning)]",
    },
    CONFIRMED: {
      label: "Confirmada",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
      dot: "bg-[var(--theme-success)]",
    },
    COMPLETED: {
      label: "Completada",
      className:
        "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)]",
      dot: "bg-[var(--theme-accent)]",
    },
    CANCELLED: {
      label: "Cancelada",
      className:
        "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
      dot: "bg-[var(--theme-text-subtle)]",
    },
    REJECTED: {
      label: "Rechazada",
      className:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
      dot: "bg-[var(--theme-danger)]",
    },
    NO_SHOW: {
      label: "No asistió",
      className:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
      dot: "bg-[var(--theme-danger)]",
    },
  };

  return (
    booking[status] ||
    neutralStatus(status)
  );
}

function neutralStatus(label) {
  return {
    label:
      label ||
      "Sin estado",
    className:
      "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
    dot: "bg-[var(--theme-text-subtle)]",
  };
}

/* ============================================
   GENERIC UI
============================================ */

function Initials({
  name,
}) {
  const initials =
    String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((item) =>
        item
          .charAt(0)
          .toUpperCase()
      )
      .join("");

  return (
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
        bg-[var(--theme-bg-secondary)]
        text-[10px]
        font-semibold
        text-[var(--theme-text-secondary)]
      "
    >
      {initials}
    </div>
  );
}

function SmallEmpty({
  title,
  description,
}) {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-dashed
        border-[var(--theme-border)]
        px-5
        py-10
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
        {title}
      </p>

      <p
        className="
          mt-2
          text-xs
          leading-5
          text-[var(--theme-text-subtle)]
        "
      >
        {description}
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div
      className="
        mt-5
        space-y-3
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              h-16
              animate-pulse
              rounded-xl
              bg-[var(--theme-bg-secondary)]
            "
          />
        )
      )}
    </div>
  );
}

/* ============================================
   DATE HELPERS
============================================ */

function bookingDateTime(
  booking
) {
  if (!booking?.booking_date) {
    return null;
  }

  const date =
    String(
      booking.booking_date
    ).slice(0, 10);

  const time =
    String(
      booking.start_time ||
        "00:00"
    ).slice(0, 5);

  const parsed =
    new Date(
      `${date}T${time}:00`
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

function formatBookingDate(
  booking
) {
  const date =
    bookingDateTime(
      booking
    );

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function safeTimestamp(
  value
) {
  if (!value) {
    return 0;
  }

  const parsed =
    new Date(value);

  return Number.isNaN(
    parsed.getTime()
  )
    ? 0
    : parsed.getTime();
}

function formatDateTime(
  value
) {
  const timestamp =
    safeTimestamp(value);

  if (!timestamp) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(timestamp)
  );
}

function formatNow() {
  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date());
}

export default DashboardPage;
