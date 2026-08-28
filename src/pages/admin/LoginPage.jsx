import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import ThemeToggle from "../../components/common/ThemeToggle";
import Seo from "../../components/common/Seo";

function LoginPage() {
  const {
    user,
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  if (
    user?.role ===
    "ADMIN"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        await login(
          email,
          password
        );

        const destination =
          location.state?.from ||
          "/admin";

        navigate(
          destination,
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Error login:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "No fue posible iniciar sesión"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <Seo
        title="Acceso Admin"
        description="Acceso privado al panel administrativo del portafolio."
        canonicalPath="/admin/login"
        noIndex
      />

      <main
      className="
        theme-page
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        px-6
        py-14
      "
    >
      {/* AMBIENT */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[650px]
          w-[650px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[var(--theme-accent-soft)]
          blur-[150px]
        "
      />

      {/* TOP ACTIONS */}

      <div
        className="
          absolute
          left-6
          right-6
          top-6
          z-20
          flex
          items-center
          justify-between
          sm:left-8
          sm:right-8
          sm:top-8
        "
      >
        <Link
          to="/"
          className="
            theme-link
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
          "
        >
          <span
            aria-hidden="true"
          >
            ←
          </span>

          Volver al portafolio
        </Link>

        <ThemeToggle />
      </div>

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
        "
      >
        {/* BRAND */}

        <div
          className="
            mb-8
            text-center
          "
        >
          <Link
            to="/"
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
          </Link>

          <p
            className="
              theme-eyebrow
              mt-7
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.25em]
            "
          >
            Acceso privado
          </p>

          <h1
            className="
              theme-title
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.045em]
              sm:text-4xl
            "
          >
            Administración
          </h1>

          <p
            className="
              theme-text
              mx-auto
              mt-4
              max-w-sm
              text-sm
              leading-6
            "
          >
            Ingresa tus credenciales
            para administrar el
            contenido y las operaciones
            del portafolio.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            theme-card-elevated
            space-y-5
            rounded-[1.5rem]
            border
            p-6
            shadow-[var(--theme-shadow)]
            sm:p-7
          "
        >
          <Field
            label="Correo electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="email"
            placeholder="correo@ejemplo.cl"
          />

          <Field
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
          />

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
            disabled={loading}
            className="
              theme-btn-primary
              w-full
              rounded-xl
              px-4
              py-3.5
              text-sm
              font-semibold
              transition-all
              duration-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Ingresando..."
              : "Ingresar"}
          </button>

          <p
            className="
              theme-muted
              text-center
              text-[10px]
              leading-5
            "
          >
            Área de acceso restringido
            para administración.
          </p>
        </form>
      </div>
      </main>
    </>
  );
}

function Field({
  label,
  id,
  type,
  value,
  onChange,
  autoComplete,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          theme-text
          mb-2
          block
          text-xs
          font-medium
        "
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        autoComplete={
          autoComplete
        }
        className="
          theme-input
          w-full
          rounded-xl
          border
          px-4
          py-3.5
          text-sm
        "
        placeholder={
          placeholder
        }
      />
    </div>
  );
}

export default LoginPage;
