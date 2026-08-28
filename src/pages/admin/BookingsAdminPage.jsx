import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminBookingById,
  getAdminBookings,
  updateAdminBooking,
  updateAdminBookingStatus,
} from "../../services/bookingsAdminService";

/* ============================================
   BOOKING STATUS
============================================ */

const BOOKING_STATUSES = [
  {
    value: "PENDING",
    label: "Pendiente",
  },
  {
    value: "CONFIRMED",
    label: "Confirmada",
  },
  {
    value: "COMPLETED",
    label: "Completada",
  },
  {
    value: "CANCELLED",
    label: "Cancelada",
  },
  {
    value: "REJECTED",
    label: "Rechazada",
  },
  {
    value: "NO_SHOW",
    label: "No asistió",
  },
];

/*
 * Debe mantenerse alineado con el workflow
 * validado por el backend.
 */
const STATUS_TRANSITIONS = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
    "REJECTED",
  ],

  CONFIRMED: [
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
  ],

  CANCELLED: [
    "CONFIRMED",
  ],

  REJECTED: [
    "CONFIRMED",
  ],

  COMPLETED: [],

  NO_SHOW: [],
};

/* ============================================
   PAGE
============================================ */

function BookingsAdminPage() {
  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("");

  const [
    serviceFilter,
    setServiceFilter,
  ] = useState("ALL");

  const [
    selectedBookingId,
    setSelectedBookingId,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminBookings();

      setBookings(
        Array.isArray(data?.bookings)
          ? data.bookings
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando reservas:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar las reservas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  /* ============================================
     COUNTS
  ============================================ */

  const statusCounts =
    useMemo(() => {
      const counts = {
        ALL: bookings.length,
      };

      BOOKING_STATUSES.forEach(
        ({ value }) => {
          counts[value] =
            bookings.filter(
              (booking) =>
                booking.status ===
                value
            ).length;
        }
      );

      return counts;
    }, [bookings]);

  /* ============================================
     SERVICES
  ============================================ */

  const services =
    useMemo(() => {
      const map =
        new Map();

      bookings.forEach(
        (booking) => {
          const service =
            booking.consulting_service;

          if (
            service?.id &&
            service?.name
          ) {
            map.set(
              service.id,
              service
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "es"
        )
      );
    }, [bookings]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredBookings =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return bookings.filter(
        (booking) => {
          const statusMatches =
            statusFilter === "ALL" ||
            booking.status ===
              statusFilter;

          if (!statusMatches) {
            return false;
          }

          const dateMatches =
            !dateFilter ||
            normalizeDateValue(
              booking.booking_date
            ) === dateFilter;

          if (!dateMatches) {
            return false;
          }

          const serviceMatches =
            serviceFilter === "ALL" ||
            String(
              booking
                .consulting_service
                ?.id ||
                booking.consulting_service_id
            ) ===
              String(
                serviceFilter
              );

          if (!serviceMatches) {
            return false;
          }

          if (!term) {
            return true;
          }

          const searchable =
            [
              booking.client_name,
              booking.client_email,
              booking.client_phone,
              booking.company_name,
              booking.client_message,
              booking.consulting_service
                ?.name,
              booking.status,
              booking.booking_date,
              booking.start_time,
              booking.end_time,
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
      bookings,
      search,
      statusFilter,
      dateFilter,
      serviceFilter,
    ]);

  const hasFilters =
    Boolean(search) ||
    statusFilter !== "ALL" ||
    Boolean(dateFilter) ||
    serviceFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setServiceFilter("ALL");
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
            Agenda
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
            Reservas
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
            Gestiona solicitudes de
            asesoría, confirmaciones,
            reuniones y sincronización
            con Google Calendar.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
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
          label="Pendientes"
          value={
            statusCounts.PENDING || 0
          }
        />

        <MetricCard
          label="Confirmadas"
          value={
            statusCounts.CONFIRMED || 0
          }
        />

        <MetricCard
          label="Completadas"
          value={
            statusCounts.COMPLETED || 0
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
            xl:grid-cols-[minmax(260px,1fr)_180px_220px]
          "
        >
          {/* SEARCH */}

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
              placeholder="Buscar cliente, empresa, correo..."
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

          {/* DATE */}

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              transition
              focus:border-[var(--theme-accent)]/25
            "
          />

          {/* SERVICE */}

          <select
            value={serviceFilter}
            onChange={(event) =>
              setServiceFilter(
                event.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              transition
              focus:border-[var(--theme-accent)]/25
            "
          >
            <option value="ALL">
              Todas las asesorías
            </option>

            {services.map(
              (service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* STATUS FILTERS */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
            border-t
            border-[var(--theme-border)]
            pt-4
          "
        >
          <StatusFilterButton
            active={
              statusFilter === "ALL"
            }
            label="Todas"
            count={
              statusCounts.ALL || 0
            }
            onClick={() =>
              setStatusFilter(
                "ALL"
              )
            }
          />

          {BOOKING_STATUSES.map(
            (status) => (
              <StatusFilterButton
                key={status.value}
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

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="
                ml-auto
                rounded-lg
                px-3
                py-2
                text-xs
                font-medium
                text-[var(--theme-text-muted)]
                transition
                hover:text-[var(--theme-text-primary)]
              "
            >
              Limpiar filtros
            </button>
          )}
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
          <BookingsSkeleton />
        ) : filteredBookings.length ===
          0 ? (
          <EmptyState
            filtered={hasFilters}
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
                      Asesoría
                    </TableHeader>

                    <TableHeader>
                      Fecha y hora
                    </TableHeader>

                    <TableHeader>
                      Valor
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
                  {filteredBookings.map(
                    (booking) => (
                      <BookingRow
                        key={
                          booking.id
                        }
                        booking={
                          booking
                        }
                        onOpen={() =>
                          setSelectedBookingId(
                            booking.id
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
              {filteredBookings.map(
                (
                  booking,
                  index
                ) => (
                  <BookingMobileCard
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                    last={
                      index ===
                      filteredBookings.length -
                        1
                    }
                    onOpen={() =>
                      setSelectedBookingId(
                        booking.id
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

      {selectedBookingId && (
        <BookingDetailModal
          bookingId={
            selectedBookingId
          }
          onClose={() =>
            setSelectedBookingId(
              null
            )
          }
          onUpdated={
            loadBookings
          }
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

function BookingRow({
  booking,
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
          <Initials
            name={
              booking.client_name
            }
          />

          <div className="min-w-0">
            <p
              className="
                max-w-[220px]
                truncate
                text-sm
                font-semibold
                text-[var(--theme-text-primary)]
              "
            >
              {booking.client_name}
            </p>

            <p
              className="
                mt-1
                max-w-[220px]
                truncate
                text-xs
                text-[var(--theme-text-muted)]
              "
            >
              {booking.company_name ||
                booking.client_email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 align-top">
        <p
          className="
            max-w-[220px]
            truncate
            text-sm
            text-[var(--theme-text-primary)]
          "
        >
          {booking
            .consulting_service
            ?.name ||
            "Asesoría"}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {formatDuration(
            booking.duration_minutes
          )}
        </p>
      </td>

      <td className="px-6 py-5 align-top">
        <p
          className="
            text-sm
            text-[var(--theme-text-primary)]
          "
        >
          {formatBookingDate(
            booking.booking_date
          )}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--theme-text-muted)]
          "
        >
          {formatTime(
            booking.start_time
          )}{" "}
          –{" "}
          {formatTime(
            booking.end_time
          )}
        </p>
      </td>

      <td className="px-6 py-5 align-top">
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {formatMoney(
            booking.total_amount,
            booking.currency
          )}
        </p>
      </td>

      <td className="px-6 py-5 align-top">
        <StatusBadge
          status={
            booking.status
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

function BookingMobileCard({
  booking,
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
            name={
              booking.client_name
            }
          />

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
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
                text-[var(--theme-text-muted)]
              "
            >
              {booking
                .consulting_service
                ?.name ||
                "Asesoría"}
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            booking.status
          }
        />
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >
        <SmallInfo
          label="Fecha"
          value={formatBookingDate(
            booking.booking_date
          )}
        />

        <SmallInfo
          label="Horario"
          value={`${formatTime(
            booking.start_time
          )} – ${formatTime(
            booking.end_time
          )}`}
        />

        <SmallInfo
          label="Duración"
          value={formatDuration(
            booking.duration_minutes
          )}
        />

        <SmallInfo
          label="Valor"
          value={formatMoney(
            booking.total_amount,
            booking.currency
          )}
        />
      </div>

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
            booking.created_at
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

function BookingDetailModal({
  bookingId,
  onClose,
  onUpdated,
}) {
  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [savingNotes, setSavingNotes] =
    useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    pendingStatus,
    setPendingStatus,
  ] = useState(null);

  useEffect(() => {
    const loadBooking =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getAdminBookingById(
              bookingId
            );

          setBooking(
            data?.booking ||
              null
          );

          setNotes(
            data?.booking
              ?.admin_notes ||
              ""
          );
        } catch (error) {
          console.error(
            "Error cargando detalle de reserva:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "No fue posible cargar la reserva."
          );
        } finally {
          setLoading(false);
        }
      };

    loadBooking();
  }, [bookingId]);

  /* ============================================
     ESC + BODY LOCK
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
        !pendingStatus
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
  ]);

  /* ============================================
     SAVE NOTES
  ============================================ */

  const handleSaveNotes =
    async () => {
      if (!booking) {
        return;
      }

      try {
        setSavingNotes(true);
        setError("");
        setSuccess("");

        const data =
          await updateAdminBooking(
            booking.id,
            {
              admin_notes:
                notes.trim() ||
                null,
            }
          );

        const refreshed =
          await getAdminBookingById(
            booking.id
          );

        setBooking(
          refreshed.booking
        );

        setNotes(
          refreshed.booking
            ?.admin_notes ||
            ""
        );

        setSuccess(
          data?.message ||
            "Notas guardadas correctamente."
        );

        await onUpdated?.();
      } catch (error) {
        console.error(
          "Error guardando notas:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar las notas."
        );
      } finally {
        setSavingNotes(false);
      }
    };

  /* ============================================
     STATUS
  ============================================ */

  const handleStatusChange =
    async () => {
      if (
        !booking ||
        !pendingStatus
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);
        setError("");
        setSuccess("");

        const data =
          await updateAdminBookingStatus(
            booking.id,
            pendingStatus
          );

        const refreshed =
          await getAdminBookingById(
            booking.id
          );

        setBooking(
          refreshed.booking
        );

        setNotes(
          refreshed.booking
            ?.admin_notes ||
            ""
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

        setError(
          error.response?.data
            ?.message ||
            "No fue posible actualizar el estado."
        );

        setPendingStatus(null);
      } finally {
        setUpdatingStatus(false);
      }
    };

  const allowedTransitions =
    booking
      ? STATUS_TRANSITIONS[
          booking.status
        ] || []
      : [];

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
          !pendingStatus
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
              Reserva
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
              Detalle de la asesoría
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
          !booking ? (
          <div className="p-8">
            <FeedbackBox
              type="error"
            >
              {error}
            </FeedbackBox>
          </div>
        ) : booking ? (
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
              {/* CLIENT */}

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <Initials
                  name={
                    booking.client_name
                  }
                  large
                />

                <div className="min-w-0">
                  <h3
                    className="
                      text-2xl
                      font-semibold
                      tracking-[-0.035em]
                      text-[var(--theme-text-primary)]
                    "
                  >
                    {booking.client_name}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--theme-text-secondary)]
                    "
                  >
                    {booking.company_name ||
                      "Sin empresa informada"}
                  </p>

                  <div className="mt-3">
                    <StatusBadge
                      status={
                        booking.status
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
                    booking.client_email
                  }
                  href={`mailto:${booking.client_email}`}
                />

                <InformationBox
                  label="Teléfono"
                  value={
                    booking.client_phone ||
                    "No informado"
                  }
                  href={
                    booking.client_phone
                      ? `tel:${booking.client_phone}`
                      : null
                  }
                />
              </div>

              {/* BOOKING */}

              <SectionTitle>
                Asesoría
              </SectionTitle>

              <div
                className="
                  mt-4
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                <InformationBox
                  label="Servicio"
                  value={
                    booking
                      .consulting_service
                      ?.name ||
                    "Asesoría"
                  }
                />

                <InformationBox
                  label="Modalidad"
                  value={formatMode(
                    booking
                      .consulting_service
                      ?.mode
                  )}
                />

                <InformationBox
                  label="Fecha"
                  value={formatBookingDate(
                    booking.booking_date
                  )}
                />

                <InformationBox
                  label="Horario"
                  value={`${formatTime(
                    booking.start_time
                  )} – ${formatTime(
                    booking.end_time
                  )}`}
                />

                <InformationBox
                  label="Duración"
                  value={formatDuration(
                    booking.duration_minutes
                  )}
                />

                <InformationBox
                  label="Valor"
                  value={formatMoney(
                    booking.total_amount,
                    booking.currency
                  )}
                />
              </div>

              {/* CLIENT MESSAGE */}

              <SectionTitle>
                Mensaje del cliente
              </SectionTitle>

              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  p-6
                "
              >
                <p
                  className="
                    whitespace-pre-wrap
                    text-sm
                    leading-7
                    text-[var(--theme-text-primary)]
                  "
                >
                  {booking.client_message ||
                    "El cliente no agregó un mensaje."}
                </p>
              </div>

              {/* GOOGLE */}

              <SectionTitle>
                Google Calendar
              </SectionTitle>

              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  p-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
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
                      {booking
                        .google_calendar_event_id
                        ? "Evento sincronizado"
                        : "Sin evento sincronizado"}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[var(--theme-text-muted)]
                      "
                    >
                      {booking
                        .google_calendar_event_id
                        ? "La reserva tiene un evento asociado en Google Calendar."
                        : booking.status ===
                          "PENDING"
                        ? "El evento se crea al confirmar la reserva."
                        : "No hay un evento activo asociado a esta reserva."}
                    </p>
                  </div>

                  {booking.google_meet_url && (
                    <a
                      href={
                        booking.google_meet_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        w-fit
                        items-center
                        justify-center
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
                      Abrir Google Meet ↗
                    </a>
                  )}
                </div>

                {booking.calendar_synced_at && (
                  <p
                    className="
                      mt-4
                      border-t
                      border-[var(--theme-border)]
                      pt-4
                      text-[11px]
                      text-[var(--theme-text-subtle)]
                    "
                  >
                    Última sincronización:{" "}
                    {formatDateTime(
                      booking.calendar_synced_at
                    )}
                  </p>
                )}
              </div>

              {/* HISTORY */}

              <SectionTitle>
                Historial
              </SectionTitle>

              <div
                className="
                  mt-5
                  space-y-4
                "
              >
                <TimelineItem
                  label="Solicitud recibida"
                  date={
                    booking.created_at
                  }
                  active
                />

                <TimelineItem
                  label="Confirmada"
                  date={
                    booking.confirmed_at
                  }
                />

                <TimelineItem
                  label="Completada"
                  date={
                    booking.completed_at
                  }
                />

                <TimelineItem
                  label="Cancelada"
                  date={
                    booking.cancelled_at
                  }
                />

                <TimelineItem
                  label="Rechazada"
                  date={
                    booking.rejected_at
                  }
                />

                <TimelineItem
                  label="No asistió"
                  date={
                    booking.no_show_at
                  }
                />
              </div>
            </div>

            {/* RIGHT */}

            <div
              className="
                p-6
                sm:p-8
              "
            >
              {/* STATUS ACTIONS */}

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
                  Gestión de estado
                </p>

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
                      text-xs
                      text-[var(--theme-text-muted)]
                    "
                  >
                    Estado actual
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={
                        booking.status
                      }
                    />
                  </div>
                </div>

                {allowedTransitions.length >
                0 ? (
                  <div
                    className="
                      mt-4
                      grid
                      gap-2
                    "
                  >
                    {allowedTransitions.map(
                      (nextStatus) => (
                        <StatusActionButton
                          key={
                            nextStatus
                          }
                          status={
                            nextStatus
                          }
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            setPendingStatus(
                              nextStatus
                            );
                          }}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-secondary)]
                      p-4
                      text-xs
                      leading-5
                      text-[var(--theme-text-muted)]
                    "
                  >
                    Esta reserva se
                    encuentra en un estado
                    final y no admite más
                    cambios.
                  </div>
                )}
              </div>

              {/* NOTES */}

              <div
                className="
                  mt-8
                  border-t
                  border-[var(--theme-border)]
                  pt-8
                "
              >
                <label
                  htmlFor="booking-admin-notes"
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
                  id="booking-admin-notes"
                  rows="9"
                  value={notes}
                  onChange={(event) => {
                    setNotes(
                      event.target.value
                    );

                    setSuccess("");
                  }}
                  placeholder="Información interna sobre esta reserva..."
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

                <button
                  type="button"
                  onClick={
                    handleSaveNotes
                  }
                  disabled={
                    savingNotes ||
                    notes ===
                      (booking.admin_notes ||
                        "")
                  }
                  className="
                    mt-4
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
                    disabled:opacity-35
                  "
                >
                  {savingNotes
                    ? "Guardando..."
                    : "Guardar notas"}
                </button>
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

              {/* TECH INFO */}

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
                  Información técnica
                </p>

                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >
                  <TechnicalRow
                    label="Zona horaria"
                    value={
                      booking.timezone ||
                      "America/Santiago"
                    }
                  />

                  <TechnicalRow
                    label="Creada"
                    value={formatDateTime(
                      booking.created_at
                    )}
                  />

                  <TechnicalRow
                    label="Actualizada"
                    value={formatDateTime(
                      booking.updated_at
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* CONFIRM STATUS */}

        {pendingStatus &&
          booking && (
            <StatusConfirmationModal
              booking={booking}
              nextStatus={
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
      </div>
    </div>
  );
}

/* ============================================
   STATUS CONFIRMATION
============================================ */

function StatusConfirmationModal({
  booking,
  nextStatus,
  loading,
  onCancel,
  onConfirm,
}) {
  const config =
    getStatusChangeConfig(
      nextStatus
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
            {booking.client_name}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-[var(--theme-text-muted)]
            "
          >
            {formatBookingDate(
              booking.booking_date
            )}{" "}
            ·{" "}
            {formatTime(
              booking.start_time
            )}
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
   STATUS ACTION BUTTON
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

function SmallInfo({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-3
      "
    >
      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.1em]
          text-[var(--theme-text-subtle)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-xs
          text-[var(--theme-text-secondary)]
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
          max-w-[190px]
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
          ? "No encontramos reservas con estos filtros."
          : "Todavía no hay reservas registradas."}
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
          ? "Prueba cambiando el estado, la fecha, la asesoría o el término de búsqueda."
          : "Las solicitudes enviadas desde el módulo público de asesorías aparecerán aquí."}
      </p>
    </div>
  );
}

/* ============================================
   SKELETONS
============================================ */

function BookingsSkeleton() {
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

    CONFIRMED: {
      label: "Confirmada",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
      dot: "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
    },

    COMPLETED: {
      label: "Completada",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
      dot: "bg-[var(--theme-success)]",
    },

    CANCELLED: {
      label: "Cancelada",
      className:
        "border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
      dot: "bg-[var(--theme-text-secondary)]",
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
        "border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
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

function getStatusActionConfig(
  status
) {
  const configs = {
    CONFIRMED: {
      label:
        "Confirmar reserva",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)] hover:bg-[var(--theme-success-soft)]",
    },

    COMPLETED: {
      label:
        "Marcar como completada",
      className:
        "border-[var(--theme-success)] text-[var(--theme-success)] hover:bg-[var(--theme-success-soft)]",
    },

    CANCELLED: {
      label:
        "Cancelar reserva",
      className:
        "border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)]",
    },

    REJECTED: {
      label:
        "Rechazar reserva",
      className:
        "border-[var(--theme-danger)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]",
    },

    NO_SHOW: {
      label:
        "Marcar no asistencia",
      className:
        "border-[var(--theme-danger)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]",
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
    CONFIRMED: {
      title:
        "¿Confirmar esta reserva?",
      description:
        "Al confirmar, el backend intentará sincronizar la reunión con Google Calendar y crear el enlace de Google Meet.",
      buttonLabel:
        "Confirmar",
      buttonClass:
        "bg-[var(--theme-accent)] text-[var(--theme-bg-page)] hover:bg-[var(--theme-accent-hover)]",
      icon: "✓",
      iconClass:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
    },

    COMPLETED: {
      title:
        "¿Marcar como completada?",
      description:
        "La reserva quedará cerrada como realizada. Este estado es final.",
      buttonLabel:
        "Completar",
      buttonClass:
        "bg-[var(--theme-success)] text-[var(--theme-text-primary)] hover:opacity-90",
      icon: "✓",
      iconClass:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
    },

    CANCELLED: {
      title:
        "¿Cancelar esta reserva?",
      description:
        "Si existe un evento sincronizado, el backend intentará eliminarlo de Google Calendar.",
      buttonLabel:
        "Cancelar reserva",
      buttonClass:
        "bg-[var(--theme-text-secondary)] text-[var(--theme-bg-page)] hover:opacity-90",
      icon: "×",
      iconClass:
        "border-[var(--theme-border)] bg-[var(--theme-border)] text-[var(--theme-text-secondary)]",
    },

    REJECTED: {
      title:
        "¿Rechazar esta reserva?",
      description:
        "La solicitud quedará rechazada. Si tuviera un evento activo, también se retirará de Google Calendar.",
      buttonLabel:
        "Rechazar",
      buttonClass:
        "bg-[var(--theme-danger)] text-[var(--theme-text-primary)] hover:opacity-90",
      icon: "!",
      iconClass:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
    },

    NO_SHOW: {
      title:
        "¿Registrar no asistencia?",
      description:
        "La reserva quedará cerrada como no asistida. Este estado es final.",
      buttonLabel:
        "Registrar",
      buttonClass:
        "bg-[var(--theme-danger)] text-[var(--theme-text-primary)] hover:opacity-90",
      icon: "!",
      iconClass:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
    },
  };

  return (
    configs[status] || {
      title:
        "¿Actualizar estado?",
      description:
        "Se actualizará el estado de la reserva.",
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
   FORMATTERS
============================================ */

function normalizeDateValue(
  value
) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(
      value
    )
  ) {
    return value.slice(0, 10);
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatBookingDate(
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  return String(value).slice(
    0,
    5
  );
}

function formatDuration(
  minutes
) {
  const numeric =
    Number(minutes);

  if (
    !Number.isFinite(numeric) ||
    numeric <= 0
  ) {
    return "—";
  }

  if (numeric < 60) {
    return `${numeric} min`;
  }

  const hours =
    Math.floor(
      numeric / 60
    );

  const remainder =
    numeric % 60;

  if (!remainder) {
    return hours === 1
      ? "1 hora"
      : `${hours} horas`;
  }

  return `${hours} h ${remainder} min`;
}

function formatMoney(
  value,
  currency = "CLP"
) {
  const numeric =
    Number(value);

  if (
    value === undefined ||
    value === null ||
    Number.isNaN(numeric)
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency:
        currency || "CLP",
      maximumFractionDigits: 0,
    }
  ).format(numeric);
}

function formatMode(
  value
) {
  const mode =
    String(value || "")
      .toUpperCase();

  const labels = {
    ONLINE: "Online",
    REMOTE: "Online",
    PRESENTIAL: "Presencial",
    IN_PERSON: "Presencial",
    HYBRID: "Híbrida",
  };

  return (
    labels[mode] ||
    value ||
    "Por definir"
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

export default BookingsAdminPage;
