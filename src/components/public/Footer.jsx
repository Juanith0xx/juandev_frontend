import {
  Link,
} from "react-router-dom";

function Footer() {
  const year =
    new Date().getFullYear();

  const navigation = [
    {
      label: "Inicio",
      href: "/#inicio",
    },
    {
      label: "Proyectos",
      href: "/#proyectos",
    },
    {
      label: "Experiencia",
      href: "/#experiencia",
    },
    {
      label: "Servicios",
      href: "/#servicios",
    },
    {
      label: "Asesorías",
      href: "/#asesorias",
    },
    {
      label: "Contacto",
      href: "/#contacto",
    },
  ];

  return (
    <footer
      data-motion-footer
      className="
        theme-page
        theme-border
        border-t
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-14
          lg:px-8
          lg:py-16
        "
      >
        <div
          className="
            grid
            gap-12
            md:grid-cols-[1.2fr_0.8fr]
            lg:grid-cols-[1.3fr_0.7fr_0.7fr]
          "
        >
          {/* BRAND */}

          <div>
            <a
              href="/#inicio"
              className="
                theme-title
                inline-flex
                items-center
                text-lg
                font-bold
                tracking-[-0.03em]
              "
            >
              Juan Estay

              <span className="theme-accent">
                .
              </span>
            </a>

            <p
              className="
                theme-text
                mt-5
                max-w-md
                text-sm
                leading-7
              "
            >
              Desarrollo soluciones web,
              plataformas empresariales e
              integraciones orientadas a
              resolver problemas reales.
            </p>

            <div
              className="
                theme-card
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-3.5
                py-2
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

              <span
                className="
                  theme-muted
                  text-[11px]
                  font-medium
                "
              >
                Disponible para nuevos proyectos
              </span>
            </div>
          </div>

          {/* NAVIGATION */}

          <div>
            <p
              className="
                theme-eyebrow
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
              "
            >
              Navegación
            </p>

            <nav
              className="
                mt-5
                flex
                flex-col
                gap-3
              "
              aria-label="Navegación del pie de página"
            >
              {navigation.map(
                (item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="
                      theme-text
                      w-fit
                      text-sm
                      transition-colors
                      hover:text-[var(--theme-accent)]
                    "
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>
          </div>

          {/* ACCESS */}

          <div>
            <p
              className="
                theme-eyebrow
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
              "
            >
              Acceso
            </p>

            <div
              className="
                mt-5
                flex
                flex-col
                items-start
                gap-3
              "
            >
              <Link
                to="/projects"
                className="
                  theme-text
                  text-sm
                  transition-colors
                  hover:text-[var(--theme-accent)]
                "
              >
                Todos los proyectos
              </Link>

              <Link
                to="/admin/login"
                className="
                  theme-btn-accent
                  mt-2
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                "
              >
                <LockIcon />

                Iniciar sesión Admin
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
            theme-border
            mt-12
            flex
            flex-col
            gap-4
            border-t
            pt-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              theme-muted
              text-xs
            "
          >
            © {year} Juan Estay.
            Todos los derechos reservados.
          </p>

          <a
            href="/#inicio"
            className="
              theme-link
              inline-flex
              w-fit
              items-center
              gap-2
              text-xs
              font-medium
            "
          >
            Volver arriba

            <span aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="
        h-4
        w-4
      "
      aria-hidden="true"
    >
      <rect
        width="14"
        height="11"
        x="5"
        y="11"
        rx="2"
      />

      <path
        d="
          M8 11
          V7
          a4 4 0 0 1
          8 0
          v4
        "
      />
    </svg>
  );
}

export default Footer;
