import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteAdminLead,
  getAdminLeadById,
  getAdminLeads,
  updateAdminLead,
  updateAdminLeadStatus,
} from "../../services/leadsAdminService";

/* ============================================
   STATUSES
============================================ */

const LEAD_STATUSES = [
  {
    value: "NEW",
    label: "Nuevo",
  },
  {
    value: "CONTACTED",
    label: "Contactado",
  },
  {
    value: "MEETING",
    label: "Reunión",
  },
  {
    value: "QUOTATION",
    label: "Cotización",
  },
  {
    value: "WON",
    label: "Ganado",
  },
  {
    value: "LOST",
    label: "Perdido",
  },
];

/* ============================================
   PAGE
============================================ */

function LeadsAdminPage() {
  const [leads, setLeads] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedLeadId, setSelectedLeadId] =
    useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminLeads();

      setLeads(
        Array.isArray(data?.leads)
          ? data.leads
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando leads:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar los contactos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  /* ============================================
     COUNTS
  ============================================ */

  const statusCounts =
    useMemo(() => {
      const counts = {
        ALL: leads.length,
      };

      LEAD_STATUSES.forEach(
        ({ value }) => {
          counts[value] =
            leads.filter(
              (lead) =>
                lead.status ===
                value
            ).length;
        }
      );

      return counts;
    }, [leads]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredLeads =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return leads.filter(
        (lead) => {
          const statusMatches =
            statusFilter === "ALL" ||
            lead.status ===
              statusFilter;

          if (!statusMatches) {
            return false;
          }

          if (!term) {
            return true;
          }

          const searchable =
            [
              lead.name,
              lead.company,
              lead.email,
              lead.phone,
              lead.service_type,
              lead.budget_range,
              lead.message,
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
      leads,
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
            CRM
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
            Leads
          </h1>

          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-[var(--theme-text-secondary)]
            "
          >
            Gestiona las consultas,
            oportunidades comerciales
            y contactos recibidos desde
            el portafolio.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeads}
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
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Total"
          value={
            statusCounts.ALL || 0
          }
        />

        <MetricCard
          label="Nuevos"
          value={
            statusCounts.NEW || 0
          }
        />

        <MetricCard
          label="En gestión"
          value={
            (statusCounts.CONTACTED ||
              0) +
            (statusCounts.MEETING ||
              0) +
            (statusCounts.QUOTATION ||
              0)
          }
        />

        <MetricCard
          label="Ganados"
          value={
            statusCounts.WON || 0
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
            xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]
            xl:items-center
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              w-full
            "
          >
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar nombre, empresa, correo..."
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

          {/* STATUS FILTERS */}

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

            {LEAD_STATUSES.map(
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
          <LeadsSkeleton />
        ) : filteredLeads.length ===
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
            {/* DESKTOP TABLE */}

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
                    <th
                      className="
                        px-6
                        py-4
                        font-medium
                      "
                    >
                      Contacto
                    </th>

                    <th
                      className="
                        px-6
                        py-4
                        font-medium
                      "
                    >
                      Consulta
                    </th>

                    <th
                      className="
                        px-6
                        py-4
                        font-medium
                      "
                    >
                      Fecha
                    </th>

                    <th
                      className="
                        px-6
                        py-4
                        font-medium
                      "
                    >
                      Estado
                    </th>

                    <th
                      className="
                        px-6
                        py-4
                        text-right
                        font-medium
                      "
                    >
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map(
                    (lead) => (
                      <LeadRow
                        key={
                          lead.id
                        }
                        lead={
                          lead
                        }
                        onOpen={() =>
                          setSelectedLeadId(
                            lead.id
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
              {filteredLeads.map(
                (lead, index) => (
                  <LeadMobileCard
                    key={lead.id}
                    lead={lead}
                    last={
                      index ===
                      filteredLeads.length -
                        1
                    }
                    onOpen={() =>
                      setSelectedLeadId(
                        lead.id
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
          DETAIL MODAL
      ======================================== */}

      {selectedLeadId && (
        <LeadDetailModal
          leadId={
            selectedLeadId
          }
          onClose={() =>
            setSelectedLeadId(
              null
            )
          }
          onUpdated={async () => {
            await loadLeads();
          }}
          onDeleted={async () => {
            setSelectedLeadId(
              null
            );

            await loadLeads();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   DESKTOP ROW
============================================ */

function LeadRow({
  lead,
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
      <td
        className="
          px-6
          py-5
          align-top
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <Initials
            name={lead.name}
          />

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                max-w-[230px]
                truncate
                text-sm
                font-semibold
                text-[var(--theme-text-primary)]
              "
            >
              {lead.name}
            </p>

            <p
              className="
                mt-1
                max-w-[230px]
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {lead.company ||
                lead.email}
            </p>
          </div>
        </div>
      </td>

      <td
        className="
          px-6
          py-5
          align-top
        "
      >
        <p
          className="
            text-sm
            text-[var(--theme-text-primary)]
          "
        >
          {lead.service_type ||
            "Consulta general"}
        </p>

        <p
          className="
            mt-1
            max-w-[330px]
            truncate
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {lead.message}
        </p>
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
          lead.created_at
        )}
      </td>

      <td
        className="
          px-6
          py-5
          align-top
        "
      >
        <StatusBadge
          status={
            lead.status
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
   MOBILE CARD
============================================ */

function LeadMobileCard({
  lead,
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
          <Initials
            name={lead.name}
          />

          <div
            className="
              min-w-0
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
              {lead.name}
            </p>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {lead.company ||
                lead.email}
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            lead.status
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
        {lead.service_type ||
          "Consulta general"}
      </p>

      <p
        className="
          mt-2
          text-xs
          leading-6
          text-[var(--theme-text-muted)]
        "
      >
        {truncateText(
          lead.message,
          130
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
            lead.created_at
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

function LeadDetailModal({
  leadId,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [lead, setLead] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* ============================================
     LOAD DETAIL
  ============================================ */

  useEffect(() => {
    const loadLead =
      async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminLeadById(
            leadId
          );

        const item =
          data?.lead;

        setLead(item);

        setStatus(
          item?.status || "NEW"
        );

        setNotes(
          item?.notes || ""
        );
      } catch (error) {
        console.error(
          "Error obteniendo lead:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar el lead."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [leadId]);

  /* ============================================
     ESC CLOSE
  ============================================ */

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
          "Escape" &&
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
     SAVE
  ============================================ */

  const handleSave =
    async () => {
      if (!lead) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        /*
         * Estado y notas usan endpoints
         * diferentes en el backend.
         */

        if (
          status !==
          lead.status
        ) {
          await updateAdminLeadStatus(
            lead.id,
            status
          );
        }

        if (
          notes !==
          (lead.notes || "")
        ) {
          await updateAdminLead(
            lead.id,
            {
              notes:
                notes.trim() ||
                null,
            }
          );
        }

        /*
         * Recuperamos nuevamente el lead
         * para traer las fechas de tracking
         * actualizadas por PostgreSQL.
         */

        const refreshed =
          await getAdminLeadById(
            lead.id
          );

        setLead(
          refreshed.lead
        );

        setStatus(
          refreshed.lead.status
        );

        setNotes(
          refreshed.lead.notes ||
            ""
        );

        setSuccess(
          "Cambios guardados correctamente."
        );

        await onUpdated?.();
      } catch (error) {
        console.error(
          "Error guardando lead:",
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
     DELETE
  ============================================ */

  const handleDelete =
    async () => {
      try {
        setDeleting(true);
        setError("");

        await deleteAdminLead(
          lead.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando lead:",
          error
        );

        setDeleteConfirm(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar el lead."
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
          event.currentTarget
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
          max-w-4xl
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
              Lead
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
              Detalle del contacto
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
          !lead ? (
          <div className="p-8">
            <div
              className="
                rounded-xl
                border
                border-[var(--theme-danger)]
                bg-[var(--theme-danger-soft)]
                p-5
                text-sm
                text-[var(--theme-danger)]
              "
            >
              {error}
            </div>
          </div>
        ) : lead ? (
          <div
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
              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <Initials
                  name={lead.name}
                  large
                />

                <div
                  className="
                    min-w-0
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
                    {lead.name}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--theme-text-secondary)]
                    "
                  >
                    {lead.company ||
                      "Sin empresa informada"}
                  </p>

                  <div className="mt-3">
                    <StatusBadge
                      status={
                        lead.status
                      }
                    />
                  </div>
                </div>
              </div>

              {/* CONTACT */}

              <div
                className="
                  mt-8
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                <InformationBox
                  label="Correo"
                  value={
                    lead.email
                  }
                  href={`mailto:${lead.email}`}
                />

                <InformationBox
                  label="Teléfono"
                  value={
                    lead.phone ||
                    "No informado"
                  }
                  href={
                    lead.phone
                      ? `tel:${lead.phone}`
                      : null
                  }
                />

                <InformationBox
                  label="Servicio"
                  value={
                    lead.service_type ||
                    "Consulta general"
                  }
                />

                <InformationBox
                  label="Presupuesto"
                  value={
                    lead.budget_range ||
                    "Por definir"
                  }
                />
              </div>

              {/* MESSAGE */}

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  p-6
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
                  Mensaje
                </p>

                <p
                  className="
                    mt-4
                    whitespace-pre-wrap
                    text-sm
                    leading-7
                    text-[var(--theme-text-primary)]
                  "
                >
                  {lead.message}
                </p>
              </div>

              {/* DATES */}

              <div className="mt-8">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-[var(--theme-text-muted)]
                  "
                >
                  Historial
                </p>

                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >
                  <TimelineItem
                    label="Solicitud recibida"
                    date={
                      lead.created_at
                    }
                    active
                  />

                  <TimelineItem
                    label="Contactado"
                    date={
                      lead.contacted_at
                    }
                  />

                  <TimelineItem
                    label="Reunión"
                    date={
                      lead.meeting_at
                    }
                  />

                  <TimelineItem
                    label="Cotización"
                    date={
                      lead.quotation_at
                    }
                  />

                  <TimelineItem
                    label="Cierre"
                    date={
                      lead.closed_at
                    }
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
              {/* STATUS */}

              <div>
                <label
                  htmlFor="lead-status"
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-[var(--theme-text-muted)]
                  "
                >
                  Estado
                </label>

                <select
                  id="lead-status"
                  value={status}
                  onChange={(
                    event
                  ) => {
                    setStatus(
                      event.target
                        .value
                    );

                    setSuccess("");
                  }}
                  className="
                    mt-3
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
                  {LEAD_STATUSES.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* NOTES */}

              <div className="mt-7">
                <label
                  htmlFor="lead-notes"
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-[var(--theme-text-muted)]
                  "
                >
                  Notas internas
                </label>

                <textarea
                  id="lead-notes"
                  rows="9"
                  value={notes}
                  onChange={(
                    event
                  ) => {
                    setNotes(
                      event.target
                        .value
                    );

                    setSuccess("");
                  }}
                  placeholder="Agrega información interna sobre este contacto..."
                  className="
                    mt-3
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[var(--theme-border)]
                    bg-[var(--theme-bg-secondary)]
                    px-4
                    py-3.5
                    text-sm
                    leading-6
                    text-[var(--theme-text-primary)]
                    outline-none
                    transition
                    placeholder:text-[var(--theme-text-subtle)]
                    focus:border-[var(--theme-accent)]/25
                  "
                />
              </div>

              {/* FEEDBACK */}

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

              {success && (
                <div
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-[var(--theme-success)]
                    bg-[var(--theme-success-soft)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--theme-success)]
                  "
                >
                  {success}
                </div>
              )}

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
                  Eliminar contacto
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
                  registro del lead.
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
                  Eliminar lead
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* DELETE CONFIRM */}

        {deleteConfirm &&
          lead && (
            <DeleteLeadModal
              lead={lead}
              deleting={
                deleting
              }
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
   DELETE MODAL
============================================ */

function DeleteLeadModal({
  lead,
  deleting,
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
        bg-black/85
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
          ¿Eliminar este lead?
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
          contacto de{" "}
          <strong
            className="
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {lead.name}
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
            disabled={deleting}
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
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
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
            {deleting
              ? "Eliminando..."
              : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   STATUS FILTER BUTTON
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
   METRIC
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

/* ============================================
   INITIALS
============================================ */

function Initials({
  name,
  large = false,
}) {
  const initials =
    String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("");

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
        text-[var(--theme-text-primary)]

        ${
          large
            ? "h-14 w-14 text-sm"
            : "h-10 w-10 text-xs"
        }
      `}
    >
      {initials}
    </div>
  );
}

/* ============================================
   INFORMATION
============================================ */

function InformationBox({
  label,
  value,
  href = null,
}) {
  const content = (
    <>
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
          mt-2
          break-words
          text-sm
          text-[var(--theme-text-primary)]
        "
      >
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          p-4
          transition
          hover:border-[var(--theme-border-strong)]
        "
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-4
      "
    >
      {content}
    </div>
  );
}

/* ============================================
   TIMELINE
============================================ */

function TimelineItem({
  label,
  date,
  active = false,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
      "
    >
      <span
        className={`
          h-2
          w-2
          shrink-0
          rounded-full

          ${
            date || active
              ? "bg-[var(--theme-accent)]"
              : "bg-[var(--theme-bg-elevated)]"
          }
        `}
      />

      <div
        className="
          flex
          min-w-0
          flex-1
          items-center
          justify-between
          gap-4
        "
      >
        <p
          className={`
            text-xs

            ${
              date || active
                ? "text-[var(--theme-text-secondary)]"
                : "text-[var(--theme-text-subtle)]"
            }
          `}
        >
          {label}
        </p>

        <span
          className="
            shrink-0
            text-[10px]
            text-[var(--theme-text-subtle)]
          "
        >
          {date
            ? formatDateTime(
                date
              )
            : "—"}
        </span>
      </div>
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
          ? "No encontramos leads con estos filtros."
          : "Todavía no hay leads registrados."}
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
          : "Los nuevos contactos enviados desde el portafolio aparecerán aquí automáticamente."}
      </p>
    </div>
  );
}

/* ============================================
   SKELETONS
============================================ */

function LeadsSkeleton() {
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
          h-40
          rounded-2xl
          bg-[var(--theme-bg-secondary)]
        "
      />
    </div>
  );
}

/* ============================================
   HELPERS
============================================ */

function getStatusConfig(
  status
) {
  const configs = {
    NEW: {
      label: "Nuevo",
      className:
        "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] text-[var(--theme-accent)]",
      dot: "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] text-[var(--theme-accent)]",
    },

    CONTACTED: {
      label: "Contactado",
      className:
        "border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
      dot: "border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
    },

    MEETING: {
      label: "Reunión",
      className:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
      dot: "bg-[var(--theme-warning)]",
    },

    QUOTATION: {
      label: "Cotización",
      className:
        "border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] text-[var(--theme-warning)]",
      dot: "bg-[var(--theme-warning)]",
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
    configs[status] || {
      label:
        status || "Sin estado",
      className:
        "border-[var(--theme-border)] bg-[var(--theme-border)] text-[var(--theme-text-secondary)]",
      dot: "bg-[var(--theme-text-muted)]",
    }
  );
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

export default LeadsAdminPage;