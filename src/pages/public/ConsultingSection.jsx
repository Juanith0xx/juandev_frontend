import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createConsultingBooking,
  getConsultingAvailability,
  getConsultingServices,
} from "../../services/consultingService";

/* ============================================
   INITIAL FORM
============================================ */

const INITIAL_FORM = {
  client_name: "",
  client_email: "",
  client_phone: "",
  company_name: "",
  client_message: "",
};

function ConsultingSection() {
  const [services, setServices] =
    useState([]);

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState("");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState("");

  const [bookingDate, setBookingDate] =
    useState("");

  const [availability, setAvailability] =
    useState(null);

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState(null);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(null);

  /* ============================================
     LOAD CONSULTING SERVICES
  ============================================ */

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        setError("");

        const data =
          await getConsultingServices();

        const list =
          data?.consulting_services ||
          data?.services ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        const active =
          list.filter(
            (service) =>
              service.is_active !== false
          );

        setServices(active);
      } catch (error) {
        console.error(
          "Error cargando asesorías:",
          error
        );

        setError(
          "No fue posible cargar las asesorías disponibles."
        );
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  /* ============================================
     SELECTED SERVICE
  ============================================ */

  const selectedService =
    useMemo(() => {
      return services.find(
        (service) =>
          String(service.id) ===
          String(selectedServiceId)
      );
    }, [
      services,
      selectedServiceId,
    ]);

  /* ============================================
     DURATION OPTIONS
  ============================================ */

  const durationOptions =
    useMemo(() => {
      if (!selectedService) {
        return [];
      }

      const minimum =
        Number(
          selectedService
            .minimum_duration_minutes
        ) || 60;

      const increment =
        Number(
          selectedService
            .billing_increment_minutes
        ) || 60;

      const values = [];

      /*
       * Mostramos hasta 4 opciones para
       * mantener la interfaz simple.
       */

      for (
        let duration = minimum;
        duration <=
        Math.min(
          minimum +
            increment * 3,
          480
        );
        duration += increment
      ) {
        values.push(duration);
      }

      return values;
    }, [selectedService]);

  /* ============================================
     RESET WHEN SERVICE CHANGES
  ============================================ */

  useEffect(() => {
    if (!selectedService) {
      setDurationMinutes("");
      setAvailability(null);
      setSelectedSlot(null);

      return;
    }

    const minimum =
      Number(
        selectedService
          .minimum_duration_minutes
      ) || 60;

    setDurationMinutes(minimum);
    setAvailability(null);
    setSelectedSlot(null);
  }, [selectedService]);

  /* ============================================
     GET AVAILABILITY
  ============================================ */

  useEffect(() => {
    if (
      !selectedServiceId ||
      !bookingDate ||
      !durationMinutes
    ) {
      setAvailability(null);
      setSelectedSlot(null);

      return;
    }

    let active = true;

    const loadAvailability =
      async () => {
        try {
          setLoadingAvailability(true);
          setError("");
          setSelectedSlot(null);

          const data =
            await getConsultingAvailability({
              consultingServiceId:
                selectedServiceId,

              date: bookingDate,

              durationMinutes:
                Number(
                  durationMinutes
                ),
            });

          if (!active) {
            return;
          }

          setAvailability(
            data?.availability ||
              data?.data ||
              data
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Error obteniendo disponibilidad:",
            error
          );

          setAvailability(null);

          setError(
            error.response?.data
              ?.message ||
              "No fue posible consultar la disponibilidad."
          );
        } finally {
          if (active) {
            setLoadingAvailability(
              false
            );
          }
        }
      };

    loadAvailability();

    return () => {
      active = false;
    };
  }, [
    selectedServiceId,
    bookingDate,
    durationMinutes,
  ]);

  /* ============================================
     FORM CHANGE
  ============================================ */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* ============================================
     SUBMIT
  ============================================ */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !selectedServiceId ||
      !bookingDate ||
      !durationMinutes ||
      !selectedSlot
    ) {
      setError(
        "Selecciona servicio, duración, fecha y horario."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess(null);

      const payload = {
        consulting_service_id:
          selectedServiceId,

        client_name:
          form.client_name.trim(),

        client_email:
          form.client_email
            .trim()
            .toLowerCase(),

        client_phone:
          form.client_phone.trim() ||
          null,

        company_name:
          form.company_name.trim() ||
          null,

        booking_date:
          bookingDate,

        start_time:
          selectedSlot.start_time,

        duration_minutes:
          Number(
            durationMinutes
          ),

        client_message:
          form.client_message.trim() ||
          null,
      };

      const data =
        await createConsultingBooking(
          payload
        );

      setSuccess(data);

      setForm(INITIAL_FORM);
      setSelectedSlot(null);

      /*
       * Volvemos a consultar los horarios
       * porque el slot reservado ya no debe
       * seguir disponible.
       */

      const updatedAvailability =
        await getConsultingAvailability({
          consultingServiceId:
            selectedServiceId,

          date: bookingDate,

          durationMinutes:
            Number(
              durationMinutes
            ),
        });

      setAvailability(
        updatedAvailability
          ?.availability ||
          updatedAvailability?.data ||
          updatedAvailability
      );
    } catch (error) {
      console.error(
        "Error creando reserva:",
        error
      );

      const message =
        error.response?.data
          ?.message ||
        "No fue posible enviar la solicitud.";

      setError(message);

      /*
       * 409 significa que el horario pudo
       * haber sido tomado mientras el usuario
       * completaba el formulario.
       */

      if (
        error.response?.status ===
        409
      ) {
        setSelectedSlot(null);

        try {
          const updatedAvailability =
            await getConsultingAvailability({
              consultingServiceId:
                selectedServiceId,

              date: bookingDate,

              durationMinutes:
                Number(
                  durationMinutes
                ),
            });

          setAvailability(
            updatedAvailability
              ?.availability ||
              updatedAvailability
                ?.data ||
              updatedAvailability
          );
        } catch (refreshError) {
          console.error(
            "Error actualizando horarios:",
            refreshError
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const slots =
    availability?.slots || [];

  const totalAmount =
    availability?.total_amount;

  return (
    <section
      id="asesorias"
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
              Asesorías
            </p>

            <h2
              className="
                mt-4
                max-w-xl
                text-3xl
                font-semibold
                tracking-[-0.045em]
                theme-title
                sm:text-4xl
                lg:text-5xl
              "
            >
              Agenda una sesión
              conmigo.
            </h2>
          </div>

          <div
            className="
              flex
              items-end
            "
          >
            <p
              className="
                max-w-xl
                text-sm
                leading-7
                theme-text
                sm:text-base
              "
            >
              Reserva un espacio para
              revisar arquitectura,
              desarrollo, integraciones,
              bases de datos o decisiones
              técnicas de tu proyecto.
            </p>
          </div>
        </div>

        {/* MAIN CARD */}

        <div
          className="
            mt-14
            grid
            theme-card
            overflow-hidden
            rounded-[1.75rem]
            border
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >
          {/* LEFT */}

          <div
            className="
              border-b
              border-[var(--theme-border)]
              p-7
              sm:p-9
              lg:border-b-0
              lg:border-r
              lg:p-10
            "
          >
            <StepTitle
              number="01"
              title="Selecciona la asesoría"
            />

            {loadingServices ? (
              <LoadingBox />
            ) : (
              <div className="mt-7 space-y-3">
                {services.map(
                  (service) => {
                    const active =
                      String(
                        service.id
                      ) ===
                      String(
                        selectedServiceId
                      );

                    return (
                      <button
                        key={
                          service.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedServiceId(
                            service.id
                          )
                        }
                        className={`
                          w-full
                          rounded-xl
                          border
                          p-5
                          text-left
                          transition-all
                          duration-300

                          ${
                            active
                              ? `
                                border-[var(--theme-accent)]
                                bg-[var(--theme-accent-soft)]
                                text-[var(--theme-text-primary)]
                              `
                              : `
                                border-[var(--theme-border)]
                                bg-[var(--theme-bg-card)]
                                text-[var(--theme-text-primary)]
                                hover:border-[var(--theme-accent)]
                                hover:bg-[var(--theme-accent-soft)]
                              `
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
                          <div>
                            <p
                              className="
                                text-sm
                                font-semibold
                              "
                            >
                              {
                                service.name
                              }
                            </p>

                            {service.short_description && (
                              <p
                                className={`
                                  mt-2
                                  text-xs
                                  leading-5

                                  ${
                                    active
                                      ? "theme-muted"
                                      : "theme-muted"
                                  }
                                `}
                              >
                                {
                                  service.short_description
                                }
                              </p>
                            )}
                          </div>

                          {service.hourly_rate && (
                            <span
                              className={`
                                shrink-0
                                text-xs
                                font-medium

                                ${
                                  active
                                    ? "theme-muted"
                                    : "theme-muted"
                                }
                              `}
                            >
                              {formatMoney(
                                service.hourly_rate,
                                service.currency
                              )}
                              /h
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {selectedService && (
              <>
                <div className="mt-10">
                  <StepTitle
                    number="02"
                    title="Duración"
                    small
                  />

                  <div
                    className="
                      mt-5
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {durationOptions.map(
                      (duration) => (
                        <button
                          key={
                            duration
                          }
                          type="button"
                          onClick={() =>
                            setDurationMinutes(
                              duration
                            )
                          }
                          className={`
                            rounded-xl
                            border
                            px-4
                            py-2.5
                            text-sm
                            transition

                            ${
                              Number(
                                durationMinutes
                              ) ===
                              duration
                                ? `
                                  border-[var(--theme-accent)]
                                  bg-[var(--theme-accent-soft)]
                                  text-[var(--theme-text-primary)]
                                `
                                : `
                                  border-[var(--theme-border)]
                                  text-[var(--theme-text-secondary)]
                                  hover:border-[var(--theme-accent)]
                                  hover:text-[var(--theme-accent)]
                                `
                            }
                          `}
                        >
                          {formatDuration(
                            duration
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-10">
                  <StepTitle
                    number="03"
                    title="Fecha"
                    small
                  />

                  <input
                    type="date"
                    value={
                      bookingDate
                    }
                    min={
                      getLocalToday()
                    }
                    onChange={(
                      event
                    ) =>
                      setBookingDate(
                        event.target
                          .value
                      )
                    }
                    className="
                      mt-5
                      w-full
                      rounded-xl
                      theme-input
                      border
                      px-4
                      py-3.5
                      text-sm
                      transition
                    "
                  />
                </div>

                {bookingDate && (
                  <div className="mt-10">
                    <StepTitle
                      number="04"
                      title="Horario"
                      small
                    />

                    {loadingAvailability ? (
                      <div
                        className="
                          mt-5
                          text-sm
                          theme-muted
                        "
                      >
                        Consultando
                        disponibilidad...
                      </div>
                    ) : slots.length >
                      0 ? (
                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-2
                          gap-2
                          sm:grid-cols-3
                        "
                      >
                        {slots.map(
                          (slot) => {
                            const active =
                              selectedSlot
                                ?.start_time ===
                              slot.start_time;

                            return (
                              <button
                                key={`${slot.start_time}-${slot.end_time}`}
                                type="button"
                                onClick={() =>
                                  setSelectedSlot(
                                    slot
                                  )
                                }
                                className={`
                                  rounded-xl
                                  border
                                  px-3
                                  py-3
                                  text-sm
                                  font-medium
                                  transition

                                  ${
                                    active
                                      ? `
                                        border-[var(--theme-accent)]
                                        bg-[var(--theme-accent-soft)]
                                        text-[var(--theme-text-primary)]
                                      `
                                      : `
                                        border-[var(--theme-border)]
                                        text-[var(--theme-text-secondary)]
                                        hover:border-[var(--theme-accent)]
                                        hover:text-[var(--theme-accent)]
                                      `
                                  }
                                `}
                              >
                                {
                                  slot.start_time
                                }
                              </button>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div
                        className="
                          mt-5
                          theme-card
                          rounded-xl
                          border
                          p-4
                          text-sm
                          theme-muted
                        "
                      >
                        No hay horarios
                        disponibles para
                        esta fecha.
                      </div>
                    )}
                  </div>
                )}

                {availability && (
                  <div
                    className="
                      mt-8
                      theme-card
                      rounded-xl
                      border
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
                      <div>
                        <p
                          className="
                            text-xs
                            theme-muted
                          "
                        >
                          Valor estimado
                        </p>

                        <p
                          className="
                            mt-1
                            text-xl
                            font-semibold
                            theme-title
                          "
                        >
                          {formatMoney(
                            totalAmount,
                            availability
                              ?.service
                              ?.currency ||
                              selectedService
                                ?.currency
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          text-right
                        "
                      >
                        <p
                          className="
                            text-xs
                            theme-muted
                          "
                        >
                          Zona horaria
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            theme-text
                          "
                        >
                          {availability.timezone ||
                            "America/Santiago"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT FORM */}

          <div
            className="
              p-7
              sm:p-9
              lg:p-10
            "
          >
            <StepTitle
              number="05"
              title="Tus datos"
            />

            <p
              className="
                mt-4
                max-w-lg
                text-sm
                leading-6
                theme-muted
              "
            >
              La solicitud quedará
              pendiente de confirmación
              antes de agendarse
              definitivamente.
            </p>

            {success ? (
              <BookingSuccess
                data={success}
                onNewBooking={() => {
                  setSuccess(null);
                  setBookingDate("");
                  setSelectedSlot(
                    null
                  );
                  setAvailability(
                    null
                  );
                }}
              />
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  mt-8
                  space-y-5
                "
              >
                <div
                  className="
                    grid
                    gap-5
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
                    placeholder="Tu nombre"
                  />

                  <Field
                    label="Correo"
                    name="client_email"
                    type="email"
                    value={
                      form.client_email
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="correo@ejemplo.cl"
                  />
                </div>

                <div
                  className="
                    grid
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  <Field
                    label="Teléfono"
                    name="client_phone"
                    value={
                      form.client_phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="+56 9..."
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
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client_message"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      theme-text
                    "
                  >
                    ¿Qué necesitas revisar?
                  </label>

                  <textarea
                    id="client_message"
                    name="client_message"
                    rows="5"
                    value={
                      form.client_message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Cuéntame brevemente sobre el proyecto o problema que quieres revisar."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-input)]
                      px-4
                      py-3.5
                      text-sm
                      theme-title
                      outline-none
                      transition
                      placeholder:theme-subtle
                      focus:border-[var(--theme-accent)]
                    "
                  />
                </div>

                {selectedSlot && (
                  <BookingSummary
                    service={
                      selectedService
                    }
                    date={
                      bookingDate
                    }
                    slot={
                      selectedSlot
                    }
                    duration={
                      durationMinutes
                    }
                    total={
                      totalAmount
                    }
                  />
                )}

                {error && (
                  <div
                    className="
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
                  disabled={
                    submitting ||
                    !selectedSlot
                  }
                  className="
                    w-full
                    rounded-xl
                    theme-btn-primary
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    transition-all
                    duration-300
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  {submitting
                    ? "Enviando solicitud..."
                    : "Solicitar asesoría"}
                </button>

                <p
                  className="
                    text-center
                    text-[11px]
                    leading-5
                    theme-subtle
                  "
                >
                  Enviar la solicitud no
                  confirma automáticamente
                  la reunión.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FIELD
============================================ */

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          mb-2
          block
          text-xs
          font-medium
          theme-text
        "
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-input)]
          px-4
          py-3.5
          text-sm
          theme-title
          outline-none
          transition
          placeholder:theme-subtle
          focus:border-[var(--theme-accent)]
        "
      />
    </div>
  );
}

/* ============================================
   SUMMARY
============================================ */

function BookingSummary({
  service,
  date,
  slot,
  duration,
  total,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-5
      "
    >
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.16em]
          theme-muted
        "
      >
        Resumen
      </p>

      <div
        className="
          mt-4
          space-y-3
          text-sm
        "
      >
        <SummaryRow
          label="Asesoría"
          value={
            service?.name || "—"
          }
        />

        <SummaryRow
          label="Fecha"
          value={
            formatDate(date)
          }
        />

        <SummaryRow
          label="Horario"
          value={`${slot.start_time} – ${slot.end_time}`}
        />

        <SummaryRow
          label="Duración"
          value={formatDuration(
            Number(duration)
          )}
        />

        <SummaryRow
          label="Valor"
          value={formatMoney(
            total,
            service?.currency
          )}
          strong
        />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <span
        className="
          theme-muted
        "
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "font-semibold theme-title"
            : "theme-text"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================
   SUCCESS
============================================ */

function BookingSuccess({
  data,
  onNewBooking,
}) {
  const booking =
    data?.booking;

  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-7
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          border
          border-[var(--theme-success)]
          bg-[var(--theme-success-soft)]
          text-[var(--theme-success)]
        "
      >
        ✓
      </div>

      <h3
        className="
          mt-6
          text-2xl
          font-semibold
          tracking-[-0.03em]
          theme-title
        "
      >
        Solicitud enviada
      </h3>

      <p
        className="
          mt-4
          max-w-md
          text-sm
          leading-7
          theme-muted
        "
      >
        {data?.message ||
          "Tu solicitud fue recibida y está pendiente de confirmación."}
      </p>

      {booking && (
        <div
          className="
            mt-6
            border-t
            border-[var(--theme-border)]
            pt-6
          "
        >
          <p
            className="
              text-xs
              theme-muted
            "
          >
            Estado
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              theme-title
            "
          >
            Pendiente de confirmación
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNewBooking}
        className="
          mt-8
          rounded-xl
          border
          border-[var(--theme-border)]
          px-5
          py-3
          text-sm
          font-semibold
          theme-title
          transition
          hover:border-[var(--theme-accent)]
          hover:theme-title
        "
      >
        Solicitar otra asesoría
      </button>
    </div>
  );
}

/* ============================================
   SMALL COMPONENTS
============================================ */

function StepTitle({
  number,
  title,
  small = false,
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
        className="
          text-xs
          font-medium
          theme-accent
        "
      >
        {number}
      </span>

      <h3
        className={
          small
            ? "text-sm font-semibold theme-title"
            : "text-lg font-semibold theme-title"
        }
      >
        {title}
      </h3>
    </div>
  );
}

function LoadingBox() {
  return (
    <div
      className="
        mt-7
        animate-pulse
        space-y-3
      "
    >
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              h-20
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
            "
          />
        )
      )}
    </div>
  );
}

/* ============================================
   HELPERS
============================================ */

function getLocalToday() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "long",
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

function formatDuration(
  minutes
) {
  if (!minutes) {
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

export default ConsultingSection;