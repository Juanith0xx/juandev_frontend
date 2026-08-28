import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createLead,
  getLeadServices,
} from "../../services/leadService";

/* ============================================
   INITIAL STATE
============================================ */

const INITIAL_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service_type: "",
  budget_range: "",
  message: "",
};

/* ============================================
   DEFAULT CONTACT OPTIONS
============================================ */

const BASE_SERVICE_OPTIONS = [
  {
    value: "Consulta general",
    label: "Consulta general",
  },
  {
    value:
      "Oportunidad laboral / colaboración",
    label:
      "Oportunidad laboral / colaboración",
  },
];

const BUDGET_OPTIONS = [
  {
    value: "",
    label: "Por definir",
  },
  {
    value: "Menos de $500.000 CLP",
    label: "Menos de $500.000",
  },
  {
    value:
      "$500.000 - $1.000.000 CLP",
    label:
      "$500.000 - $1.000.000",
  },
  {
    value:
      "$1.000.000 - $2.500.000 CLP",
    label:
      "$1.000.000 - $2.500.000",
  },
  {
    value:
      "$2.500.000 - $5.000.000 CLP",
    label:
      "$2.500.000 - $5.000.000",
  },
  {
    value:
      "Más de $5.000.000 CLP",
    label:
      "Más de $5.000.000",
  },
  {
    value:
      "No aplica / oportunidad laboral",
    label:
      "No aplica / oportunidad laboral",
  },
];

/* ============================================
   COMPONENT
============================================ */

function ContactSection() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [services, setServices] =
    useState([]);

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(null);

  /* ============================================
     LOAD SERVICES
  ============================================ */

  useEffect(() => {
    let active = true;

    const loadServices =
      async () => {
        try {
          setLoadingServices(true);

          const data =
            await getLeadServices();

          if (!active) {
            return;
          }

          const serviceList =
            data?.services ||
            data?.data ||
            (Array.isArray(data)
              ? data
              : []);

          setServices(
            Array.isArray(serviceList)
              ? serviceList
              : []
          );
        } catch (error) {
          /*
           * El formulario puede seguir
           * funcionando aunque falle
           * la carga de servicios.
           */

          console.error(
            "Error cargando servicios para contacto:",
            error
          );

          setServices([]);
        } finally {
          if (active) {
            setLoadingServices(
              false
            );
          }
        }
      };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  /* ============================================
     SERVICE OPTIONS
  ============================================ */

  const serviceOptions =
    useMemo(() => {
      const databaseOptions =
        services
          .filter(
            (service) =>
              service?.name
          )
          .map((service) => ({
            value: service.name,
            label: service.name,
          }));

      /*
       * Evitamos servicios duplicados
       * por nombre.
       */

      const map =
        new Map();

      [
        ...BASE_SERVICE_OPTIONS,
        ...databaseOptions,
      ].forEach((option) => {
        map.set(
          option.value,
          option
        );
      });

      return Array.from(
        map.values()
      );
    }, [services]);

  /* ============================================
     CHANGE
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

    if (error) {
      setError("");
    }
  };

  /* ============================================
     VALIDATION
  ============================================ */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Ingresa tu nombre.";
    }

    if (!form.email.trim()) {
      return "Ingresa tu correo electrónico.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        form.email
          .trim()
          .toLowerCase()
      )
    ) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!form.message.trim()) {
      return "Cuéntame brevemente sobre tu proyecto o consulta.";
    }

    return null;
  };

  /* ============================================
     SUBMIT
  ============================================ */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess(null);

      const payload = {
        name:
          form.name.trim(),

        company:
          form.company.trim() ||
          null,

        email:
          form.email
            .trim()
            .toLowerCase(),

        phone:
          form.phone.trim() ||
          null,

        service_type:
          form.service_type ||
          null,

        budget_range:
          form.budget_range ||
          null,

        message:
          form.message.trim(),
      };

      const data =
        await createLead(
          payload
        );

      setSuccess(data);

      setForm(
        INITIAL_FORM
      );
    } catch (error) {
      console.error(
        "Error enviando contacto:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "No fue posible enviar tu mensaje. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contacto"
      className="
        theme-section
        theme-border
        relative
        overflow-hidden
        border-t
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* AMBIENT LIGHT */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-250px]
          left-[-150px]
          h-[600px]
          w-[600px]
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[150px]
        "
      />

      <div
        className="
          relative
          z-10
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
            lg:grid-cols-[0.85fr_1.15fr]
            lg:gap-16
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.24em]
                theme-eyebrow
              "
            >
              Contacto
            </p>

            <h2
              className="
                mt-5
                max-w-xl
                text-4xl
                font-semibold
                tracking-[-0.05em]
                theme-title
                sm:text-5xl
                lg:text-6xl
              "
            >
              Construyamos algo
              que genere valor.
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
                text-base
                leading-8
                theme-text
              "
            >
              Si tienes un proyecto,
              necesitas mejorar una
              plataforma existente,
              buscas colaboración técnica
              o quieres conversar sobre una
              oportunidad profesional,
              puedes escribirme desde aquí.
            </p>
          </div>
        </div>

        {/* CONTENT */}

        <div
          className="
            mt-16
            grid
            gap-12
            lg:grid-cols-[0.75fr_1.25fr]
            lg:gap-20
          "
        >
          {/* ======================================
              LEFT INFORMATION
          ====================================== */}

          <div>
            <div
              className="
                space-y-3
              "
            >
              <ContactItem
                number="01"
                title="Proyectos"
                description="
                  Desarrollo de aplicaciones web,
                  plataformas SaaS y soluciones
                  empresariales.
                "
              />

              <ContactItem
                number="02"
                title="Asesorías"
                description="
                  Revisión técnica, arquitectura,
                  backend, frontend, bases de datos
                  e integraciones.
                "
              />

              <ContactItem
                number="03"
                title="Colaboraciones"
                description="
                  Participación en proyectos,
                  equipos de desarrollo y nuevas
                  oportunidades profesionales.
                "
              />
            </div>

            {/* PROCESS */}

            <div
              className="
                mt-10
                theme-card
                rounded-2xl
                border
                p-6
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  theme-eyebrow
                "
              >
                Qué ocurre después
              </p>

              <div
                className="
                  mt-6
                  space-y-5
                "
              >
                <ProcessItem
                  number="1"
                  text="Recibo tu solicitud."
                />

                <ProcessItem
                  number="2"
                  text="Reviso el contexto y requerimiento."
                />

                <ProcessItem
                  number="3"
                  text="Me contacto contigo para continuar."
                />
              </div>
            </div>
          </div>

          {/* ======================================
              FORM
          ====================================== */}

          <div
            className="
              theme-card-elevated
              rounded-[2rem]
              border
              p-6
              sm:p-8
              lg:p-10
            "
          >
            {success ? (
              <SuccessMessage
                data={success}
                onReset={() => {
                  setSuccess(null);
                  setError("");
                }}
              />
            ) : (
              <>
                <div>
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-[0.2em]
                      theme-eyebrow
                    "
                  >
                    Nueva consulta
                  </p>

                  <h3
                    className="
                      mt-3
                      text-2xl
                      font-semibold
                      tracking-[-0.03em]
                      theme-title
                    "
                  >
                    Cuéntame sobre lo
                    que necesitas.
                  </h3>
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="
                    mt-8
                    space-y-5
                  "
                >
                  {/* NAME + COMPANY */}

                  <div
                    className="
                      grid
                      gap-5
                      sm:grid-cols-2
                    "
                  >
                    <Field
                      label="Nombre"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Tu nombre"
                      required
                    />

                    <Field
                      label="Empresa"
                      name="company"
                      value={
                        form.company
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Empresa o proyecto"
                    />
                  </div>

                  {/* EMAIL + PHONE */}

                  <div
                    className="
                      grid
                      gap-5
                      sm:grid-cols-2
                    "
                  >
                    <Field
                      label="Correo"
                      name="email"
                      type="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="correo@ejemplo.cl"
                      required
                    />

                    <Field
                      label="Teléfono"
                      name="phone"
                      type="tel"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="+56 9..."
                    />
                  </div>

                  {/* SERVICE */}

                  <div>
                    <label
                      htmlFor="service_type"
                      className="
                        mb-2
                        block
                        text-xs
                        font-medium
                        theme-text
                      "
                    >
                      Tipo de consulta
                    </label>

                    <select
                      id="service_type"
                      name="service_type"
                      value={
                        form.service_type
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        theme-input
                        border
                        px-4
                        py-3.5
                        text-sm
                        transition
                      "
                    >
                      <option value="">
                        {loadingServices
                          ? "Cargando opciones..."
                          : "Selecciona una opción"}
                      </option>

                      {serviceOptions.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* BUDGET */}

                  <div>
                    <label
                      htmlFor="budget_range"
                      className="
                        mb-2
                        block
                        text-xs
                        font-medium
                        theme-text
                      "
                    >
                      Presupuesto aproximado
                    </label>

                    <select
                      id="budget_range"
                      name="budget_range"
                      value={
                        form.budget_range
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        theme-input
                        border
                        px-4
                        py-3.5
                        text-sm
                        transition
                      "
                    >
                      {BUDGET_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.label
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <label
                      htmlFor="message"
                      className="
                        mb-2
                        block
                        text-xs
                        font-medium
                        theme-text
                      "
                    >
                      Proyecto o consulta
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={
                        form.message
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="
Cuéntame qué necesitas desarrollar, mejorar o resolver.
                      "
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
                        leading-6
                        theme-title
                        outline-none
                        transition
                        placeholder:theme-subtle
                        focus:border-[var(--theme-accent)]
                      "
                    />
                  </div>

                  {/* ERROR */}

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

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-xl
                      theme-btn-primary
                      px-6
                      py-4
                      text-sm
                      font-semibold
                      transition-all
                      duration-300
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <span>
                      {submitting
                        ? "Enviando..."
                        : "Enviar mensaje"}
                    </span>

                    {!submitting && (
                      <span
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      >
                        →
                      </span>
                    )}
                  </button>

                  <p
                    className="
                      text-center
                      text-[11px]
                      leading-5
                      theme-subtle
                    "
                  >
                    Los datos serán utilizados
                    únicamente para responder
                    a tu solicitud.
                  </p>
                </form>
              </>
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
  placeholder,
  required = false,
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
        placeholder={placeholder}
        required={required}
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
   CONTACT ITEM
============================================ */

function ContactItem({
  number,
  title,
  description,
}) {
  return (
    <div
      className="
        group
        border-b
        border-[var(--theme-border)]
        py-6
        first:pt-0
      "
    >
      <div
        className="
          flex
          gap-5
        "
      >
        <span
          className="
            pt-1
            text-xs
            font-medium
            theme-accent
          "
        >
          {number}
        </span>

        <div>
          <h3
            className="
              text-lg
              font-semibold
              tracking-[-0.02em]
              theme-title
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              theme-muted
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PROCESS ITEM
============================================ */

function ProcessItem({
  number,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
      "
    >
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-[var(--theme-accent)]
          bg-[var(--theme-accent-soft)]
          text-[10px]
          font-semibold
          theme-accent
        "
      >
        {number}
      </div>

      <p
        className="
          text-sm
          theme-muted
        "
      >
        {text}
      </p>
    </div>
  );
}

/* ============================================
   SUCCESS
============================================ */

function SuccessMessage({
  data,
  onReset,
}) {
  return (
    <div
      className="
        flex
        min-h-[560px]
        flex-col
        justify-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          border
          border-[var(--theme-success)]
          bg-[var(--theme-success-soft)]
          text-xl
          font-semibold
          text-[var(--theme-success)]
        "
      >
        ✓
      </div>

      <p
        className="
          mt-8
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          theme-muted
        "
      >
        Mensaje recibido
      </p>

      <h3
        className="
          mt-4
          max-w-lg
          text-3xl
          font-semibold
          tracking-[-0.04em]
          theme-title
        "
      >
        Gracias por
        contactarme.
      </h3>

      <p
        className="
          mt-5
          max-w-lg
          text-sm
          leading-7
          theme-muted
        "
      >
        {data?.message ||
          "Tu solicitud fue enviada correctamente. Revisaré la información y me pondré en contacto contigo."}
      </p>

      {data?.lead?.id && (
        <div
          className="
            mt-8
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
              theme-muted
            "
          >
            Estado de la solicitud
          </p>

          <div
            className="
              mt-2
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[var(--theme-success)]
              "
            />

            <p
              className="
                text-sm
                font-medium
                theme-title
              "
            >
              Recibida
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="
          mt-8
          w-fit
          rounded-xl
          border
          border-[var(--theme-border)]
          px-5
          py-3
          text-sm
          font-medium
          theme-text
          transition
          hover:border-[var(--theme-accent)]
          hover:theme-title
        "
      >
        Enviar otro mensaje
      </button>
    </div>
  );
}

export default ContactSection;