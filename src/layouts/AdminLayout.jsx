import {
  useState,
} from "react";

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import ThemeToggle from "../components/common/ThemeToggle";
import Seo from "../components/common/Seo";

const NAVIGATION = [
  {
    to: "/admin",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/admin/projects",
    label: "Proyectos",
  },
  {
    to: "/admin/bookings",
    label: "Reservas",
  },
  {
    to: "/admin/testimonials",
    label: "Testimonios",
  },
  {
    to: "/admin/leads",
    label: "Leads",
  },
  {
    to: "/admin/experiences",
    label: "Experiencias",
  },
  {
    to: "/admin/certifications",
    label: "Certificaciones",
  },
  {
    to: "/admin/services",
    label: "Servicios",
  },
  {
    to: "/admin/consulting-services",
    label: "Asesorías",
  },
  {
    to: "/admin/availability",
    label: "Disponibilidad",
  },
];

function AdminLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const handleLogout = () => {
    logout();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  };

  const closeMobile =
    () => {
      setMobileOpen(false);
    };

  return (
    <div
      className="
        theme-page
        min-h-screen
      "
    >
      <Seo
        title="Administración"
        description="Panel privado de administración del portafolio."
        canonicalPath="/admin"
        noIndex
      />

      {/* DESKTOP SIDEBAR */}

      <aside
        className="
          theme-border
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-64
          border-r
          bg-[var(--theme-bg-secondary)]
          lg:flex
          lg:flex-col
        "
      >
        <SidebarContent
          onNavigate={() => {}}
        />
      </aside>

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-[80]
            lg:hidden
          "
        >
          <button
            type="button"
            className="
              absolute
              inset-0
              bg-black/55
              backdrop-blur-sm
            "
            aria-label="Cerrar navegación"
            onClick={
              closeMobile
            }
          />

          <aside
            className="
              theme-border
              absolute
              inset-y-0
              left-0
              flex
              w-[min(84vw,300px)]
              flex-col
              border-r
              bg-[var(--theme-bg-secondary)]
              shadow-2xl
            "
          >
            <SidebarContent
              onNavigate={
                closeMobile
              }
              mobile
            />
          </aside>
        </div>
      )}

      {/* CONTENT */}

      <div className="lg:pl-64">
        <header
          className="
            theme-border
            sticky
            top-0
            z-30
            flex
            h-16
            items-center
            justify-between
            border-b
            bg-[var(--theme-bg-page)]
            px-4
            backdrop-blur-xl
            sm:px-6
          "
          style={{
            background:
              "color-mix(in srgb, var(--theme-bg-page) 88%, transparent)",
          }}
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="
                theme-icon-button
                lg:hidden
              "
              aria-label="Abrir navegación"
            >
              <MenuIcon />
            </button>

            <div>
              <p
                className="
                  theme-muted
                  text-[10px]
                  uppercase
                  tracking-[0.16em]
                "
              >
                Portfolio
              </p>

              <p
                className="
                  theme-title
                  text-sm
                  font-semibold
                "
              >
                Panel administrativo
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
            "
          >
            <ThemeToggle />

            <span
              className="
                theme-muted
                hidden
                text-sm
                md:block
              "
            >
              {user?.first_name}
            </span>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="
                theme-btn-secondary
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-semibold
                sm:px-4
              "
            >
              <span
                className="hidden sm:inline"
              >
                Cerrar sesión
              </span>

              <span
                className="sm:hidden"
              >
                Salir
              </span>
            </button>
          </div>
        </header>

        <main
          className="
            p-4
            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onNavigate,
  mobile = false,
}) {
  return (
    <>
      <div
        className="
          flex
          items-start
          justify-between
          p-6
        "
      >
        <div>
          <Link
            to="/"
            onClick={
              onNavigate
            }
            className="
              theme-title
              inline-flex
              items-center
              text-base
              font-bold
              tracking-[-0.03em]
            "
          >
            Juan Estay

            <span className="theme-accent">
              .
            </span>
          </Link>

          <p
            className="
              theme-eyebrow
              mt-3
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.2em]
            "
          >
            Administración
          </p>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={
              onNavigate
            }
            className="
              theme-icon-button
            "
            aria-label="Cerrar navegación"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <nav
        className="
          flex-1
          space-y-1
          overflow-y-auto
          px-3
          pb-6
        "
      >
        {NAVIGATION.map(
          (item) => (
            <AdminLink
              key={item.to}
              {...item}
              onClick={
                onNavigate
              }
            />
          )
        )}
      </nav>

      <div
        className="
          theme-border
          border-t
          p-4
        "
      >
        <Link
          to="/"
          onClick={
            onNavigate
          }
          className="
            theme-text
            flex
            items-center
            justify-between
            rounded-xl
            px-3
            py-3
            text-xs
            font-medium
            transition
            hover:bg-[var(--theme-accent-soft)]
            hover:text-[var(--theme-accent)]
          "
        >
          Ver portafolio

          <span aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
    </>
  );
}

function AdminLink({
  to,
  label,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({
        isActive,
      }) =>
        `
          block
          rounded-xl
          border
          px-4
          py-3
          text-sm
          font-medium
          transition-all
          duration-200

          ${
            isActive
              ? `
                border-[var(--theme-accent)]
                bg-[var(--theme-accent-soft)]
                text-[var(--theme-accent)]
              `
              : `
                border-transparent
                text-[var(--theme-text-secondary)]
                hover:bg-[var(--theme-bg-card)]
                hover:text-[var(--theme-text-primary)]
              `
          }
        `
      }
    >
      {label}
    </NavLink>
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
      className="h-5 w-5"
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
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default AdminLayout;
