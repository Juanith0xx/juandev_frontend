import {
  useEffect,
  useState,
} from "react";

import api from "../../api/axios";

import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Seo from "../../components/common/Seo";

import {
  buildPersonSchema,
  buildWebsiteSchema,
} from "../../config/site";
import ProjectsSection from "../public/ProjectsSection";
import ExperienceSection from "../public/ExperienceSection";
import TechnologiesSection from "../public/TechnologiesSection";
import AboutSection from "../public/AboutSection";
import CertificationsSection from "../public/CertificationsSection";
import TestimonialsSection from "../public/TestimonialsSection";
import ServicesSection from "../public/ServicesSection";
import ConsultingSection from "../public/ConsultingSection";
import ContactSection from "../public/ContactSection";

function HomePage() {
  const [
    apiStatus,
    setApiStatus,
  ] = useState(
    "Comprobando API..."
  );

  /* ============================================
     COMPROBAR BACKEND
  ============================================ */

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response =
          await api.get(
            "/health"
          );

        if (
          response.data.success
        ) {
          setApiStatus(
            "Sistema conectado"
          );
        }
      } catch (error) {
        console.error(
          "Error comprobando API:",
          error
        );

        setApiStatus(
          "API no disponible"
        );
      }
    };

    checkApi();
  }, []);

  return (
    <div
      className="
        theme-page
        min-h-screen
      "
    >
      <Seo
        structuredData={[
          buildPersonSchema(),
          buildWebsiteSchema(),
        ]}
      />

      {/* ============================================
          NAVBAR
      ============================================ */}

      <Navbar />

      <main>
        {/* ============================================
            HERO
        ============================================ */}

        <section
          id="inicio"
          className="
            relative
            overflow-hidden
            pb-10
            pt-32
          "
        >
          {/* Luz ambiental champagne */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[35%]
              h-[650px]
              w-[650px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[var(--theme-accent-soft)]
              blur-[140px]
            "
          />

          <div
            className="
              relative
              z-10
              mx-auto
              w-full
              max-w-7xl
              px-6
              lg:px-8
            "
          >
            {/* ============================================
                HERO PRINCIPAL
            ============================================ */}

            <div
              className="
                grid
                items-center
                gap-14
                lg:grid-cols-[1.15fr_0.85fr]
                xl:gap-20
              "
            >
              {/* ============================================
                  COLUMNA IZQUIERDA
              ============================================ */}

              <div
                data-motion-hero-copy
              >
                {/* Disponibilidad */}

                <div
                  className="
                    theme-card
                    mb-10
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-4
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
                      theme-text
                      text-xs
                      font-medium
                    "
                  >
                    Disponible para
                    nuevos proyectos
                  </span>
                </div>

                {/* Introducción */}

                <p
                  className="
                    theme-muted
                    mb-4
                    text-sm
                    font-medium
                  "
                >
                  Hola, soy
                </p>

                {/* Nombre */}

                <h1
                  className="
                    theme-title
                    text-5xl
                    font-semibold
                    tracking-[-0.055em]
                    sm:text-6xl
                    lg:text-7xl
                    xl:text-[5rem]
                    xl:leading-[0.98]
                  "
                >
                  Juan Estay
                  <span className="theme-accent">
                    .
                  </span>
                </h1>

                {/* Cargo */}

                <h2
                  className="
                    theme-accent
                    mt-5
                    text-xl
                    font-medium
                    tracking-[-0.02em]
                    sm:text-2xl
                  "
                >
                  Full Stack Developer
                </h2>

                {/* Descripción */}

                <p
                  className="
                    theme-text
                    mt-7
                    max-w-2xl
                    text-base
                    leading-8
                    sm:text-lg
                  "
                >
                  Desarrollo soluciones
                  web y plataformas
                  digitales orientadas
                  a resolver problemas
                  reales, optimizar
                  procesos y generar
                  valor para empresas y
                  usuarios.
                </p>

                {/* Datos */}

                <div
                  className="
                    theme-muted
                    mt-9
                    flex
                    flex-wrap
                    items-center
                    gap-x-6
                    gap-y-3
                    text-sm
                  "
                >
                  <span>
                    Santiago, Chile
                  </span>

                  <span
                    className="
                      theme-subtle
                      hidden
                      sm:inline
                    "
                  >
                    /
                  </span>

                  <span>
                    React · Node.js ·
                    PostgreSQL
                  </span>
                </div>

                {/* Botones */}

                <div
                  className="
                    mt-10
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <a
                    href="#proyectos"
                    className="
                      theme-btn-primary
                      inline-flex
                      items-center
                      justify-center
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
                    Ver proyectos

                    <span className="ml-4">
                      →
                    </span>
                  </a>

                  <a
                    href="#contacto"
                    className="
                      theme-btn-accent
                      inline-flex
                      items-center
                      justify-center
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
                    Hablemos
                  </a>
                </div>
              </div>

              {/* ============================================
                  COLUMNA DERECHA
              ============================================ */}

              <div
                data-motion-hero-visual
                className="
                  relative
                  mx-auto
                  hidden
                  w-full
                  max-w-[430px]
                  lg:block
                "
              >
                <div
                  className="
                    theme-card-elevated
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border-[1.5px]
                    border-[var(--theme-border)]
                  "
                >
                  {/* Luz superior */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-br
                      from-[var(--theme-accent-soft)]
                      via-transparent
                      to-transparent
                      opacity-70
                    "
                  />

                  {/* Decoración técnica */}

                  <div
                    className="
                      absolute
                      left-8
                      top-8
                      z-20
                      h-[2px]
                      w-16
                      rounded-full
                      bg-[var(--theme-accent)]
                      opacity-70
                    "
                  />

                  <div
                    className="
                      absolute
                      right-8
                      top-8
                      z-20
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-[var(--theme-accent)]
                    "
                  />

                  {/* ============================================
                      FOTO + CONTENIDO
                  ============================================ */}

                  <div
                    className="
                      relative
                      z-10
                      p-6
                      pt-12
                    "
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-[1.5rem]
                        border
                        border-[var(--theme-border)]
                        bg-[var(--theme-bg-card)]
                      "
                    >
                      {/* FOTO PERSONAL */}

                      <div
                        className="
                          relative
                          aspect-[4/4.15]
                          overflow-hidden
                          bg-[var(--theme-bg-secondary)]
                        "
                      >
                        <img
                          src="/juan-estay.png"
                          alt="Juan Estay"
                          className="
                            h-full
                            w-full
                            select-none
                            object-cover
                            object-center
                            grayscale
                            contrast-110
                            brightness-95
                          "
                          draggable="false"
                        />

                        {/* Overlay inferior suave */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                          "
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in srgb, var(--theme-bg-card) 32%, transparent) 0%, transparent 46%)",
                          }}
                        />
                      </div>

                      {/* CONTENIDO INFERIOR */}

                      <div
                        className="
                          relative
                          bg-[var(--theme-bg-card)]
                          p-6
                        "
                      >
                        <p
                          className="
                            theme-eyebrow
                            text-xs
                            uppercase
                            tracking-[0.25em]
                          "
                        >
                          Full Stack
                        </p>

                        <p
                          className="
                            theme-title
                            mt-3
                            text-xl
                            font-semibold
                            tracking-[-0.02em]
                          "
                        >
                          Diseño · Desarrollo ·
                          Integración
                        </p>

                        <p
                          className="
                            theme-muted
                            mt-4
                            text-sm
                            leading-6
                          "
                        >
                          Soluciones digitales
                          modernas, mantenibles
                          y orientadas a
                          resultados.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalle exterior */}

                <div
                  className="
                    absolute
                    -bottom-4
                    -right-4
                    h-24
                    w-24
                    rounded-[1.5rem]
                    border-[1.5px]
                    border-[var(--theme-accent)]
                    opacity-20
                  "
                />
              </div>
            </div>

            {/* ============================================
                MÉTRICAS
            ============================================ */}

            <div
              data-motion-hero-metrics
              className="
                theme-card
                mt-16
                grid
                overflow-hidden
                rounded-2xl
                border-[1.5px]
                border-[var(--theme-border)]
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <Stat
                value="Full Stack"
                label="Desarrollo web"
              />

              <Stat
                value="MERN"
                label="Stack principal"
              />

              <Stat
                value="SaaS"
                label="Sistemas empresariales"
              />

              <Stat
                value={
                  apiStatus ===
                  "Sistema conectado"
                    ? "Online"
                    : "—"
                }
                label="Portfolio API"
                last
                online={
                  apiStatus ===
                  "Sistema conectado"
                }
              />
            </div>
          </div>
        </section>

        {/* ============================================
            SECCIONES
        ============================================ */}

        <ProjectsSection />
        <ExperienceSection />
        <TechnologiesSection />
        <AboutSection />
        <CertificationsSection />
        <TestimonialsSection />
        <ServicesSection />
        <ConsultingSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}

/* ============================================
   MÉTRICA
============================================ */

function Stat({
  value,
  label,
  last = false,
  online = false,
}) {
  return (
    <div
      className={`
        px-8
        py-6

        ${
          !last
            ? `
              border-b-[1.5px]
              border-[var(--theme-border)]
              sm:border-r-[1.5px]
              lg:border-b-0
            `
            : ""
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        {online && (
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-[var(--theme-success)]
            "
          />
        )}

        <p
          className="
            theme-title
            text-lg
            font-semibold
            tracking-[-0.02em]
          "
        >
          {value}
        </p>
      </div>

      <p
        className="
          theme-muted
          mt-1.5
          text-xs
        "
      >
        {label}
      </p>
    </div>
  );
}

export default HomePage;