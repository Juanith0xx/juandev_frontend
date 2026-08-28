import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import ThemeToggle from "../common/ThemeToggle";

function Navbar() {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const links = [
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
      label: "Certificaciones",
      href: "/#certificaciones",
    },
    {
      label: "Sobre mí",
      href: "/#sobre-mi",
    },
    {
      label: "Contacto",
      href: "/#contacto",
    },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      data-motion-navbar
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================
            NAVBAR
        ===================================== */}

        <div
          className="
            theme-card-elevated
            mt-4
            flex
            h-[72px]
            items-center
            justify-between
            rounded-2xl
            border
            px-3
            backdrop-blur-xl
            sm:px-4
            lg:px-5
          "
        >
          {/* ===================================
              BRAND / LOGO
          =================================== */}

          <a
            href="/#inicio"
            className="
              group
              flex
              min-w-0
              items-center
              gap-3
            "
            aria-label="Juan Estay — Inicio"
          >
            <span
              className="
                flex
                h-11
                w-11
                sm:h-12
                sm:w-12
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-card)]
                transition-all
                duration-300
                group-hover:border-[var(--theme-accent)]
                group-hover:shadow-[0_0_0_3px_var(--theme-accent-soft)]
              "
            >
              <img
                src="/logo-portfolio.png"
                alt=""
                className="
                  h-full
                  w-full
                  scale-[1.10]
                  object-contain
                "
                width="48"
                height="48"
                draggable="false"
              />
            </span>

            <span
              className="
                theme-title
                truncate
                text-sm
                font-bold
                tracking-tight
                sm:text-base
              "
            >
              Juan Estay Rodríguez
              <span className="theme-accent">
                .
              </span>
            </span>
          </a>

          {/* ===================================
              DESKTOP LINKS
          =================================== */}

          <nav
            className="
              hidden
              items-center
              gap-7
              lg:flex
            "
            aria-label="Navegación principal"
          >
            {links.map(
              (link) => (
                <a
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className="
                    theme-text
                    text-xs
                    font-medium
                    transition-colors
                    duration-300
                    hover:text-[var(--theme-accent)]
                  "
                >
                  {
                    link.label
                  }
                </a>
              )
            )}
          </nav>

          {/* ===================================
              DESKTOP ACTIONS
          =================================== */}

          <div
            className="
              hidden
              items-center
              gap-2
              lg:flex
            "
          >
            <ThemeToggle />

            <Link
              to="/admin/login"
              className="
                theme-btn-secondary
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-2.5
                text-xs
                font-semibold
              "
            >
              <AdminIcon />
              Admin
            </Link>

            <a
              href="/#contacto"
              className="
                theme-btn-primary
                inline-flex
                items-center
                justify-center
                rounded-xl
                px-4
                py-2.5
                text-xs
                font-semibold
              "
            >
              Trabajemos juntos
            </a>
          </div>

          {/* ===================================
              MOBILE ACTIONS
          =================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              lg:hidden
            "
          >
            <ThemeToggle />

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (value) =>
                    !value
                )
              }
              className="
                theme-icon-button
              "
              aria-label={
                menuOpen
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
              aria-expanded={
                menuOpen
              }
            >
              {menuOpen ? (
                <CloseIcon />
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
        </div>

        {/* =====================================
            MOBILE MENU
        ===================================== */}

        {menuOpen && (
          <div
            className="
              theme-card-elevated
              mt-2
              rounded-2xl
              border
              p-4
              backdrop-blur-xl
              lg:hidden
            "
          >
            <nav
              className="
                flex
                flex-col
              "
              aria-label="Navegación móvil"
            >
              {links.map(
                (link) => (
                  <a
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    onClick={
                      closeMenu
                    }
                    className="
                      theme-text
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition
                      hover:bg-[var(--theme-accent-soft)]
                      hover:text-[var(--theme-accent)]
                    "
                  >
                    {
                      link.label
                    }
                  </a>
                )
              )}
            </nav>

            <div
              className="
                theme-border
                my-4
                border-t
              "
            />

            <div
              className="
                grid
                gap-3
              "
            >
              <Link
                to="/admin/login"
                onClick={
                  closeMenu
                }
                className="
                  theme-btn-secondary
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                "
              >
                <AdminIcon />
                Iniciar sesión Admin
              </Link>

              <a
                href="/#contacto"
                onClick={
                  closeMenu
                }
                className="
                  theme-btn-primary
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                "
              >
                Trabajemos juntos
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ============================================
   ICONS
============================================ */

function AdminIcon() {
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

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="
        h-5
        w-5
      "
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="
        h-5
        w-5
      "
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default Navbar;
