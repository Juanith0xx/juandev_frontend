import {
  useTheme,
} from "../../context/ThemeContext";

function ThemeToggle({
  className = "",
}) {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark =
    theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        theme-icon-button
        ${className}
      `}
      aria-label={
        isDark
          ? "Cambiar a tema claro"
          : "Cambiar a tema oscuro"
      }
      title={
        isDark
          ? "Tema claro"
          : "Tema oscuro"
      }
    >
      {isDark ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export default ThemeToggle;
