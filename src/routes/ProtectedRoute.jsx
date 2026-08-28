import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

function ProtectedRoute() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div
        className="
          theme-page
          flex
          min-h-screen
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-2
              border-[var(--theme-border-strong)]
              border-t-[var(--theme-accent)]
            "
          />

          <p
            className="
              theme-muted
              mt-4
              text-sm
            "
          >
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
