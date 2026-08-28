import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPublicTestimonial,
  getPublicTestimonials,
} from "../../services/testimonialsPublicService";

/* ============================================
   INITIAL FORM
============================================ */

const INITIAL_FORM = {
  client_name: "",
  company_name: "",
  position: "",
  project_name: "",
  review: "",
  rating: 5,
  linkedin_url: "",
  website_url: "",
  consent_to_publish: false,
};

/* ============================================
   SECTION
============================================ */

function TestimonialsSection() {
  const [
    testimonials,
    setTestimonials,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const loadTestimonials =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicTestimonials();

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
    }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const featuredTestimonials =
    useMemo(() => {
      return testimonials.slice(
        0,
        6
      );
    }, [testimonials]);

  return (
    <section
      id="testimonios"
      className="
        relative
        overflow-hidden
        theme-page
        theme-border
        border-y
        py-24
        sm:py-28
      "
    >
      {/* ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[600px]
          w-[600px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[140px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-6
          lg:px-8
        "
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <div
          className="
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-3xl">
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                theme-eyebrow
              "
            >
              Testimonios
            </p>

            <h2
              className="
                mt-4
                text-4xl
                font-semibold
                tracking-[-0.045em]
                theme-title
                sm:text-5xl
              "
            >
              Lo que dicen mis clientes
            </h2>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-8
                theme-text
              "
            >
              Experiencias reales de
              personas y empresas con
              las que he trabajado.
              Cada testimonio es
              revisado antes de
              publicarse.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalOpen(true)
            }
            className="
              inline-flex
              w-fit
              items-center
              justify-center
              gap-3
              theme-btn-primary
              rounded-xl
              px-5
              py-3.5
              text-sm
              font-semibold
              transition
            "
          >
            Dejar un testimonio

            <span
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div
            className="
              mt-10
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
            TESTIMONIALS
        ======================================== */}

        <div className="mt-14">
          {loading ? (
            <TestimonialsSkeleton />
          ) : featuredTestimonials.length ===
            0 ? (
            <EmptyTestimonials
              onCreate={() =>
                setModalOpen(true)
              }
            />
          ) : (
            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {featuredTestimonials.map(
                (testimonial) => (
                  <TestimonialCard
                    key={
                      testimonial.id
                    }
                    testimonial={
                      testimonial
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* ========================================
            BOTTOM CTA
        ======================================== */}

        {!loading &&
          featuredTestimonials.length >
            0 && (
          <div
            className="
              mt-12
              flex
              flex-col
              gap-5
              rounded-2xl
              border
              theme-card
              px-6
              py-6
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
                  theme-title
                "
              >
                ¿Trabajamos juntos?
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  theme-muted
                "
              >
                Puedes compartir tu
                experiencia. El
                testimonio quedará
                pendiente de revisión
                antes de aparecer
                públicamente.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalOpen(true)
              }
              className="
                shrink-0
                theme-btn-accent
                rounded-xl
                px-5
                py-3
                text-sm
                font-medium
                transition
              "
            >
              Compartir experiencia
            </button>
          </div>
        )}
      </div>

      {/* ========================================
          MODAL
      ======================================== */}

      {modalOpen && (
        <TestimonialFormModal
          onClose={() =>
            setModalOpen(false)
          }
        />
      )}
    </section>
  );
}

/* ============================================
   CARD
============================================ */

function TestimonialCard({
  testimonial,
}) {
  return (
    <article
      className="
        flex
        min-h-[330px]
        flex-col
        rounded-2xl
        border
        theme-card-hover
        p-6
        sm:p-7
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
        <QuoteIcon />

        <StarRating
          value={
            testimonial.rating
          }
          compact
        />
      </div>

      <blockquote
        className="
          mt-8
          flex-1
          text-base
          leading-8
          theme-text
        "
      >
        “{testimonial.review}”
      </blockquote>

      <div
        className="
          mt-8
          flex
          items-center
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <Avatar
          testimonial={
            testimonial
          }
        />

        <div className="min-w-0">
          <p
            className="
              truncate
              text-sm
              font-semibold
              theme-title
            "
          >
            {
              testimonial.client_name
            }
          </p>

          <p
            className="
              mt-1
              truncate
              text-xs
              theme-muted
            "
          >
            {buildClientLine(
              testimonial
            )}
          </p>

          {testimonial.project_name && (
            <p
              className="
                mt-1
                truncate
                text-[11px]
                theme-subtle
              "
            >
              {
                testimonial.project_name
              }
            </p>
          )}
        </div>
      </div>

      {(testimonial.linkedin_url ||
        testimonial.website_url) && (
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          {testimonial.linkedin_url && (
            <ExternalLink
              href={
                testimonial.linkedin_url
              }
            >
              LinkedIn
            </ExternalLink>
          )}

          {testimonial.website_url && (
            <ExternalLink
              href={
                testimonial.website_url
              }
            >
              Sitio web
            </ExternalLink>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================
   PUBLIC FORM MODAL
============================================ */

function TestimonialFormModal({
  onClose,
}) {
  const [form, setForm] =
    useState({
      ...INITIAL_FORM,
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

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
        !submitting
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
    submitting,
  ]);

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

  const setRating = (
    rating
  ) => {
    setForm((current) => ({
      ...current,
      rating,
    }));

    setError("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validation =
        validateForm(form);

      if (validation) {
        setError(validation);
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        await createPublicTestimonial(
          buildPayload(form)
        );

        setSuccess(true);
      } catch (error) {
        console.error(
          "Error enviando testimonio:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible enviar el testimonio. Intenta nuevamente."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/85
        p-4
        backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-[1.75rem]
          border
          theme-card-elevated
          shadow-2xl
        "
      >
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
            bg-[var(--theme-bg-elevated)]
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
                font-semibold
                uppercase
                tracking-[0.18em]
                theme-eyebrow
              "
            >
              Testimonios
            </p>

            <h3
              className="
                mt-1
                text-xl
                font-semibold
                tracking-[-0.03em]
                theme-title
              "
            >
              {success
                ? "Testimonio recibido"
                : "Comparte tu experiencia"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              theme-icon-button
              rounded-xl
              transition
              disabled:opacity-40
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {success ? (
          <SuccessState
            onClose={onClose}
          />
        ) : (
          <form
            onSubmit={
              handleSubmit
            }
            className="p-6 sm:p-8"
          >
            <div
              className="
                rounded-2xl
                border
                theme-card
                p-5
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  theme-title
                "
              >
                Tu testimonio no se
                publica automáticamente.
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  leading-6
                  theme-muted
                "
              >
                Primero quedará
                pendiente de revisión.
                Una vez aprobado,
                aparecerá en esta
                sección del portafolio.
              </p>
            </div>

            {/* ==================================
                PERSONAL DATA
            ================================== */}

            <FormSectionTitle>
              Información
            </FormSectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <TextField
                label="Nombre"
                name="client_name"
                value={
                  form.client_name
                }
                onChange={
                  handleChange
                }
                placeholder="Tu nombre"
                maxLength={150}
                required
              />

              <TextField
                label="Empresa"
                name="company_name"
                value={
                  form.company_name
                }
                onChange={
                  handleChange
                }
                placeholder="Empresa (opcional)"
                maxLength={200}
              />

              <TextField
                label="Cargo"
                name="position"
                value={
                  form.position
                }
                onChange={
                  handleChange
                }
                placeholder="Cargo (opcional)"
                maxLength={200}
              />

              <TextField
                label="Proyecto / servicio"
                name="project_name"
                value={
                  form.project_name
                }
                onChange={
                  handleChange
                }
                placeholder="Proyecto o servicio"
                maxLength={200}
              />
            </div>

            {/* ==================================
                RATING
            ================================== */}

            <FormSectionTitle>
              Valoración
            </FormSectionTitle>

            <div
              className="
                mt-4
                rounded-xl
                border
                theme-card
                p-5
              "
            >
              <p
                className="
                  text-xs
                  theme-muted
                "
              >
                ¿Cómo evaluarías tu
                experiencia?
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                {[1, 2, 3, 4, 5].map(
                  (rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setRating(
                          rating
                        )
                      }
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[var(--theme-border)]
                        bg-[var(--theme-bg-card)]
                        text-xl
                        transition
                        hover:border-[var(--theme-accent)]
                      "
                      aria-label={`${rating} estrellas`}
                    >
                      <span
                        className={
                          rating <=
                          Number(
                            form.rating
                          )
                            ? "theme-accent"
                            : "text-[var(--theme-border-strong)]"
                        }
                      >
                        ★
                      </span>
                    </button>
                  )
                )}

                <span
                  className="
                    ml-2
                    text-xs
                    theme-muted
                  "
                >
                  {form.rating}/5
                </span>
              </div>
            </div>

            {/* ==================================
                REVIEW
            ================================== */}

            <FormSectionTitle>
              Testimonio
            </FormSectionTitle>

            <div className="mt-4">
              <label
                htmlFor="testimonial-review"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  theme-text
                "
              >
                Cuéntame tu experiencia
              </label>

              <textarea
                id="testimonial-review"
                name="review"
                rows="7"
                value={form.review}
                onChange={
                  handleChange
                }
                required
                placeholder="¿Cómo fue trabajar conmigo? ¿Qué problema resolvimos? ¿Qué destacarías del proceso o resultado?"
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  theme-input
                  px-4
                  py-3.5
                  text-sm
                  leading-7
                "
              />

              <div
                className="
                  mt-2
                  flex
                  justify-end
                "
              >
                <span
                  className="
                    text-[10px]
                    theme-subtle
                  "
                >
                  {
                    form.review
                      .length
                  }{" "}
                  caracteres
                </span>
              </div>
            </div>

            {/* ==================================
                OPTIONAL LINKS
            ================================== */}

            <FormSectionTitle>
              Enlaces opcionales
            </FormSectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <TextField
                label="LinkedIn"
                name="linkedin_url"
                value={
                  form.linkedin_url
                }
                onChange={
                  handleChange
                }
                placeholder="https://linkedin.com/in/..."
              />

              <TextField
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
            </div>

            {/* ==================================
                CONSENT
            ================================== */}

            <FormSectionTitle>
              Autorización
            </FormSectionTitle>

            <label
              className="
                mt-4
                flex
                cursor-pointer
                items-start
                gap-3
                rounded-xl
                border
                theme-card
                p-4
              "
            >
              <input
                type="checkbox"
                name="consent_to_publish"
                checked={
                  form.consent_to_publish
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

              <span
                className="
                  text-xs
                  leading-6
                  theme-muted
                "
              >
                Autorizo que este
                testimonio, mi nombre y
                los datos profesionales
                que ingresé puedan ser
                publicados en este
                portafolio una vez
                revisados y aprobados.
              </span>
            </label>

            {/* ==================================
                ERROR
            ================================== */}

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

            {/* ==================================
                ACTIONS
            ================================== */}

            <div
              className="
                mt-7
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  px-5
                  py-3.5
                  text-sm
                  font-medium
                  theme-text
                  transition
                  hover:border-[var(--theme-border-strong)]
                  hover:theme-title
                  disabled:opacity-40
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  theme-btn-primary
                  rounded-xl
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {submitting
                  ? "Enviando..."
                  : "Enviar testimonio"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================================
   SUCCESS
============================================ */

function SuccessState({
  onClose,
}) {
  return (
    <div
      className="
        px-6
        py-14
        text-center
        sm:px-10
        sm:py-16
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-[var(--theme-success)]
          bg-[var(--theme-success-soft)]
          text-xl
          text-[var(--theme-success)]
        "
      >
        ✓
      </div>

      <h4
        className="
          mt-7
          text-2xl
          font-semibold
          tracking-[-0.035em]
          theme-title
        "
      >
        Gracias por compartir tu
        experiencia.
      </h4>

      <p
        className="
          mx-auto
          mt-4
          max-w-md
          text-sm
          leading-7
          theme-text
        "
      >
        El testimonio fue enviado
        correctamente y quedó
        pendiente de revisión. No se
        mostrará públicamente hasta
        que sea aprobado.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="
          mt-8
          theme-btn-primary
          rounded-xl
          px-6
          py-3.5
          text-sm
          font-semibold
          transition
        "
      >
        Cerrar
      </button>
    </div>
  );
}

/* ============================================
   EMPTY
============================================ */

function EmptyTestimonials({
  onCreate,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        theme-card-hover
        px-6
        py-16
        text-center
      "
    >
      <QuoteIcon centered />

      <h3
        className="
          mt-6
          text-lg
          font-semibold
          theme-title
        "
      >
        Próximamente habrá
        testimonios publicados.
      </h3>

      <p
        className="
          mx-auto
          mt-3
          max-w-lg
          text-sm
          leading-7
          theme-muted
        "
      >
        Si ya trabajamos juntos,
        puedes ser la primera persona
        en compartir su experiencia.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="
          mt-7
          theme-btn-accent
          rounded-xl
          px-5
          py-3
          text-sm
          font-medium
          transition
        "
      >
        Dejar testimonio
      </button>
    </div>
  );
}

/* ============================================
   GENERIC COMPONENTS
============================================ */

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  maxLength,
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
          theme-text
        "
      >
        {label}
      </label>

      <input
        id={`testimonial-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="
          w-full
          rounded-xl
          border
          theme-input
          px-4
          py-3.5
          text-sm
        "
      />
    </div>
  );
}

function FormSectionTitle({
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
        theme-eyebrow
      "
    >
      {children}
    </p>
  );
}

function QuoteIcon({
  centered = false,
}) {
  return (
    <div
      className={`
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        text-xl
        font-semibold
        theme-accent

        ${
          centered
            ? "mx-auto"
            : ""
        }
      `}
    >
      “
    </div>
  );
}

function StarRating({
  value,
  compact = false,
}) {
  const rating =
    Number(value) || 0;

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
                compact
                  ? "text-xs"
                  : "text-base"
              }

              ${
                star <= rating
                  ? "theme-accent"
                  : "text-[var(--theme-border-strong)]"
              }
            `}
          >
            ★
          </span>
        )
      )}
    </div>
  );
}

function Avatar({
  testimonial,
}) {
  if (testimonial.avatar_url) {
    return (
      <div
        className="
          h-10
          w-10
          shrink-0
          overflow-hidden
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
        "
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
        theme-muted
      "
    >
      {getInitials(
        testimonial.client_name
      )}
    </div>
  );
}

function ExternalLink({
  href,
  children,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        rounded-lg
        border
        border-[var(--theme-border)]
        px-3
        py-2
        text-[10px]
        font-medium
        theme-link
        transition
        hover:border-[var(--theme-accent)]
      "
    >
      {children} ↗
    </a>
  );
}

function TestimonialsSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              h-[330px]
              animate-pulse
              rounded-2xl
              border
              theme-card
              p-6
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-xl
                bg-[var(--theme-border-strong)]
              "
            />

            <div
              className="
                mt-8
                h-3
                w-full
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-3
                h-3
                w-5/6
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-3
                h-3
                w-3/4
                rounded
                bg-[var(--theme-border)]
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

function validateForm(form) {
  if (
    !form.client_name.trim()
  ) {
    return "El nombre es obligatorio.";
  }

  if (!form.review.trim()) {
    return "El testimonio es obligatorio.";
  }

  if (
    form.review.trim().length <
    20
  ) {
    return "Cuéntame un poco más sobre tu experiencia (mínimo 20 caracteres).";
  }

  const rating =
    Number(form.rating);

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return "La valoración debe estar entre 1 y 5 estrellas.";
  }

  if (
    form.linkedin_url &&
    !isValidUrl(
      form.linkedin_url
    )
  ) {
    return "La URL de LinkedIn no es válida.";
  }

  if (
    form.website_url &&
    !isValidUrl(
      form.website_url
    )
  ) {
    return "La URL del sitio web no es válida.";
  }

  if (
    !form.consent_to_publish
  ) {
    return "Debes autorizar la publicación del testimonio.";
  }

  return null;
}

function buildPayload(form) {
  return {
    client_name:
      form.client_name.trim(),

    company_name:
      nullable(
        form.company_name
      ),

    position:
      nullable(
        form.position
      ),

    project_name:
      nullable(
        form.project_name
      ),

    review:
      form.review.trim(),

    rating:
      Number(form.rating),

    linkedin_url:
      nullable(
        form.linkedin_url
      ),

    website_url:
      nullable(
        form.website_url
      ),

    consent_to_publish: true,
  };
}

function nullable(value) {
  const normalized =
    String(value || "").trim();

  return normalized || null;
}

function isValidUrl(value) {
  try {
    const url =
      new URL(value);

    return [
      "http:",
      "https:",
    ].includes(url.protocol);
  } catch {
    return false;
  }
}

function getInitials(value) {
  return String(value || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) =>
      item
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}

function buildClientLine(
  testimonial
) {
  return [
    testimonial.position,
    testimonial.company_name,
  ]
    .filter(Boolean)
    .join(" · ") ||
    "Cliente";
}

export default TestimonialsSection;
