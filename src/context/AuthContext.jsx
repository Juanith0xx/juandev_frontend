import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* ============================================
     RESTORE SESSION
  ============================================ */

  useEffect(() => {
    const restoreSession =
      async () => {
        const token =
          localStorage.getItem(
            "portfolio_token"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const response =
            await api.get("/auth/me");

          const currentUser =
            response.data.user;

          setUser(currentUser);

          localStorage.setItem(
            "portfolio_user",
            JSON.stringify(
              currentUser
            )
          );
        } catch (error) {
          console.error(
            "Error restaurando sesión:",
            error
          );

          localStorage.removeItem(
            "portfolio_token"
          );

          localStorage.removeItem(
            "portfolio_user"
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, []);

  /* ============================================
     LOGIN
  ============================================ */

  const login = async (
    email,
    password
  ) => {
    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    const {
      token,
      user: authenticatedUser,
    } = response.data;

    localStorage.setItem(
      "portfolio_token",
      token
    );

    localStorage.setItem(
      "portfolio_user",
      JSON.stringify(
        authenticatedUser
      )
    );

    setUser(
      authenticatedUser
    );

    return authenticatedUser;
  };

  /* ============================================
     LOGOUT
  ============================================ */

  const logout = () => {
    localStorage.removeItem(
      "portfolio_token"
    );

    localStorage.removeItem(
      "portfolio_user"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
};