import {
  Link,
} from "react-router-dom";

import Footer from "../../components/public/Footer";
import Navbar from "../../components/public/Navbar";
import Seo from "../../components/common/Seo";

function NotFoundPage() {
  return (
    <div
      className="
        theme-page
        min-h-screen
      "
    >
      <Seo
        title="Página no encontrada"
        description="La página solicitada no existe."
        noIndex
      />

      <Navbar />

      <main
        className="
          flex
          min-h-[78vh]
          items-center
          px-6
          pb-16
          pt-32
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-2xl
            text-center
          "
        >
          <p
            className="
              theme-eyebrow
              text-xs
              font-semibold
              uppercase
              tracking-[0.22em]
            "
          >
            Error 404
          </p>

          <h1
            className="
              theme-title
              mt-5
              text-4xl
              font-semibold
              tracking-[-0.05em]
              sm:text-5xl
            "
          >
            Esta página no existe
            <span
              className="theme-accent"
            >
              .
            </span>
          </h1>

          <p
            className="
              theme-text
              mx-auto
              mt-5
              max-w-lg
              text-sm
              leading-7
              sm:text-base
            "
          >
            El enlace puede haber cambiado
            o la dirección ingresada no es
            válida. Puedes volver al inicio
            o revisar todos los proyectos.
          </p>

          <div
            className="
              mt-8
              flex
              flex-col
              justify-center
              gap-3
              sm:flex-row
            "
          >
            <Link
              to="/"
              className="
                theme-btn-primary
                rounded-xl
                px-6
                py-3.5
                text-sm
                font-semibold
              "
            >
              Volver al inicio
            </Link>

            <Link
              to="/projects"
              className="
                theme-btn-accent
                rounded-xl
                px-6
                py-3.5
                text-sm
                font-semibold
              "
            >
              Ver proyectos
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFoundPage;
