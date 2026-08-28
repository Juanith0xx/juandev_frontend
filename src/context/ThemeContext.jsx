import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "portfolio_theme";
const VALID_THEMES = ["dark", "light"];

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme =
    window.localStorage.getItem(STORAGE_KEY);

  if (VALID_THEMES.includes(savedTheme)) {
    return savedTheme;
  }

  return "dark";
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] =
    useState(getInitialTheme);

  useEffect(() => {
    const root =
      document.documentElement;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    window.localStorage.setItem(
      STORAGE_KEY,
      theme
    );
  }, [theme]);

  const setTheme = (nextTheme) => {
    if (
      !VALID_THEMES.includes(nextTheme)
    ) {
      return;
    }

    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider"
    );
  }

  return context;
}
