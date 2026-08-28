import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPublicServices,
} from "../../services/servicesService";

function ServicesSection() {
  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================
     CARGAR SERVICIOS
  ============================================ */

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicServices();

        const list =
          data?.services ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        const publicServices =
          list.filter(
            (service) =>
              service.is_active !==
                false &&
              service.is_published !==
                false
          );

        setServices(
          publicServices
        );
      } catch (error) {
        console.error(
          "Error cargando servicios:",
          error
        );

        setError(
          "No fue posible cargar los servicios."
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  /* ============================================
     ORDEN
  ============================================ */

  const orderedServices =
    useMemo(() => {
      return [...services].sort(
        (a, b) => {
          const orderA =
            Number(
              a.display_order ??
                a.sort_order ??
                a.order ??
                999
            );

          const orderB =
            Number(
              b.display_order ??
                b.sort_order ??
                b.order ??
                999
            );

          return orderA - orderB;
        }
      );
    }, [services]);

  return (
    <section
      id="servicios"
      className="
        theme-section
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
        {/* ============================================
            HEADER
        ============================================ */}

        <div
          className="
            grid
            gap-10
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
              Servicios
            </p>

            <h2
              className="
                mt-4
                max-w-lg
                text-3xl
                font-semibold
                tracking-[-0.045em]
                theme-title
                sm:text-4xl
                lg:text-5xl
              "
            >
              Soluciones digitales
              pensadas para cada
              necesidad.
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
              Desde el desarrollo de
              aplicaciones y plataformas
              empresariales hasta
              integraciones y asesoría
              técnica, cada solución se
              diseña de acuerdo con los
              objetivos del proyecto.
            </p>
          </div>
        </div>

        {/* ============================================
            LOADING
        ============================================ */}

        {loading && (
          <ServicesSkeleton />
        )}

        {/* ============================================
            ERROR
        ============================================ */}

        {!loading &&
          error && (
            <div
              className="
                mt-14
                theme-card
                rounded-2xl
                border
                p-7
              "
            >
              <p
                className="
                  text-sm
                  theme-text
                "
              >
                {error}
              </p>
            </div>
          )}

        {/* ============================================
            SIN SERVICIOS
        ============================================ */}

        {!loading &&
          !error &&
          orderedServices.length ===
            0 && (
            <div
              className="
                mt-14
                theme-card
                rounded-2xl
                border
                p-7
              "
            >
              <p
                className="
                  text-sm
                  theme-text
                "
              >
                Próximamente se
                publicarán los servicios
                disponibles.
              </p>
            </div>
          )}

        {/* ============================================
            SERVICIOS
        ============================================ */}

        {!loading &&
          !error &&
          orderedServices.length >
            0 && (
            <div
              className="
                mt-16
                theme-card
                overflow-hidden
                rounded-[1.75rem]
                border
              "
            >
              {orderedServices.map(
                (
                  service,
                  index
                ) => (
                  <ServiceItem
                    key={
                      service.id ||
                      `${service.name}-${index}`
                    }
                    service={
                      service
                    }
                    number={
                      index + 1
                    }
                    last={
                      index ===
                      orderedServices.length -
                        1
                    }
                  />
                )
              )}
            </div>
          )}

        {/* ============================================
            CTA
        ============================================ */}

        <div
          className="
            mt-16
            theme-card-elevated
            overflow-hidden
            rounded-[1.75rem]
            border
            border-[var(--theme-accent)]
          "
        >
          <div
            className="
              grid
              gap-10
              p-8
              sm:p-10
              lg:grid-cols-[1fr_auto]
              lg:items-center
              lg:p-12
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  theme-eyebrow
                "
              >
                ¿Tienes un proyecto?
              </p>

              <h3
                className="
                  theme-title
                  mt-4
                  max-w-2xl
                  text-3xl
                  font-semibold
                  tracking-[-0.045em]
                  sm:text-4xl
                "
              >
                Conversemos sobre lo
                que necesitas construir.
              </h3>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-7
                  theme-text
                  sm:text-base
                "
              >
                Podemos revisar tu idea,
                proceso o necesidad y
                definir una solución
                tecnológica adecuada.
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                lg:justify-end
              "
            >
              <a
                href="#contacto"
                className="
                  inline-flex
                  items-center
                  justify-center
                  theme-btn-primary
                  rounded-xl
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                "
              >
                Iniciar conversación

                <span className="ml-4">
                  →
                </span>
              </a>

              <a
                href="#asesorias"
                className="
                  inline-flex
                  items-center
                  justify-center
                  theme-btn-accent
                  rounded-xl
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                "
              >
                Agendar asesoría
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SERVICIO
============================================ */

function ServiceItem({
  service,
  number,
  last,
}) {
  const name =
    service.name ||
    service.title ||
    "Servicio";

  const description =
    service.description ||
    service.short_description ||
    service.summary ||
    "";

  const price =
    service.hourly_rate ||
    service.price ||
    service.base_price ||
    null;

  const unit =
    service.price_unit ||
    service.billing_unit ||
    "";

  const features =
    normalizeFeatures(
      service.features ||
        service.items ||
        service.includes
    );

  return (
    <article
      className={`
        group
        grid
        gap-7
        p-7
        transition-colors
        duration-300
        hover:bg-[var(--theme-accent-soft)]
        sm:p-8
        lg:grid-cols-[80px_0.8fr_1.2fr]

        ${
          !last
            ? "border-b border-[var(--theme-border)]"
            : ""
        }
      `}
    >
      {/* NÚMERO */}

      <div>
        <span
          className="
            text-xs
            font-medium
            theme-accent
          "
        >
          {String(
            number
          ).padStart(
            2,
            "0"
          )}
        </span>
      </div>

      {/* NOMBRE */}

      <div>
        <h3
          className="
            text-xl
            font-semibold
            tracking-[-0.03em]
            theme-title
            sm:text-2xl
          "
        >
          {name}
        </h3>

        {price && (
          <p
            className="
              mt-3
              text-xs
              theme-muted
            "
          >
            Desde{" "}
            {formatPrice(
              price
            )}

            {unit
              ? ` / ${unit}`
              : ""}
          </p>
        )}
      </div>

      {/* DETALLE */}

      <div>
        {description && (
          <p
            className="
              max-w-2xl
              text-sm
              leading-7
              theme-text
            "
          >
            {description}
          </p>
        )}

        {features.length >
          0 && (
          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-2
            "
          >
            {features
              .slice(0, 6)
              .map(
                (
                  feature,
                  index
                ) => (
                  <span
                    key={`${feature}-${index}`}
                    className="
                      rounded-lg
                      border
                      border-[var(--theme-border)]
                      bg-[var(--theme-bg-secondary)]
                      px-3
                      py-1.5
                      text-[11px]
                      theme-muted
                    "
                  >
                    {feature}
                  </span>
                )
              )}
          </div>
        )}

        <a
          href="#contacto"
          className="
            mt-7
            inline-flex
            items-center
            gap-3
            theme-link
            text-sm
            font-semibold
            transition
          "
        >
          Consultar servicio

          <span
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          >
            →
          </span>
        </a>
      </div>
    </article>
  );
}

/* ============================================
   FEATURES
============================================ */

function normalizeFeatures(
  value
) {
  if (!value) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) => {
        if (
          typeof item ===
          "string"
        ) {
          return item;
        }

        return (
          item.name ||
          item.label ||
          item.title ||
          ""
        );
      })
      .filter(Boolean);
  }

  if (
    typeof value ===
    "string"
  ) {
    return value
      .split(/[,;\n]/)
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

/* ============================================
   PRECIO
============================================ */

function formatPrice(
  value
) {
  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return value;
  }

  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }
  ).format(numeric);
}

/* ============================================
   SKELETON
============================================ */

function ServicesSkeleton() {
  return (
    <div
      className="
        mt-16
        theme-card
        overflow-hidden
        rounded-[1.75rem]
        border
      "
    >
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              grid
              animate-pulse
              gap-7
              border-b
              border-[var(--theme-border)]
              p-8
              lg:grid-cols-[80px_0.8fr_1.2fr]
            "
          >
            <div
              className="
                h-3
                w-6
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div>
              <div
                className="
                  h-6
                  w-40
                  rounded
                  bg-[var(--theme-border-strong)]
                "
              />

              <div
                className="
                  mt-3
                  h-3
                  w-20
                  rounded
                  bg-[var(--theme-border)]
                "
              />
            </div>

            <div>
              <div
                className="
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
                  w-4/5
                  rounded
                  bg-[var(--theme-border)]
                "
              />

              <div
                className="
                  mt-7
                  flex
                  gap-2
                "
              >
                <div
                  className="
                    h-7
                    w-20
                    rounded
                    bg-[var(--theme-border)]
                  "
                />

                <div
                  className="
                    h-7
                    w-24
                    rounded
                    bg-[var(--theme-border)]
                  "
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default ServicesSection;