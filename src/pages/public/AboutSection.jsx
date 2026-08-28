function AboutSection() {
  return (
    <section
      id="sobre-mi"
      className="
        theme-page
        theme-border
        border-y
        py-24
        sm:py-28
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          lg:px-8
        "
      >
        <div
          className="
            grid
            gap-16
            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-24
          "
        >
          {/* IZQUIERDA */}

          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.22em]
                theme-eyebrow
              "
            >
              Sobre mí
            </p>

            <h2
              className="
                mt-5
                max-w-xl
                text-3xl
                font-semibold
                leading-tight
                tracking-[-0.045em]
                theme-title
                sm:text-4xl
                lg:text-5xl
              "
            >
              Desarrollo tecnología
              pensando primero en el
              problema.
            </h2>

            <p
              className="
                mt-8
                max-w-xl
                text-base
                leading-8
                theme-text
              "
            >
              Soy desarrollador Full Stack
              enfocado en crear soluciones
              web funcionales, escalables y
              orientadas a las necesidades
              reales de cada proyecto.
            </p>

            <p
              className="
                mt-5
                max-w-xl
                text-base
                leading-8
                theme-muted
              "
            >
              Mi trabajo combina desarrollo
              frontend, backend, bases de
              datos, integraciones y
              despliegue, permitiéndome
              abordar una solución de forma
              integral desde su diseño hasta
              su puesta en producción.
            </p>

            <a
              href="#contacto"
              className="
                mt-10
                inline-flex
                items-center
                gap-3
                text-sm
                font-semibold
                theme-link
                transition
              "
            >
              Conversemos sobre tu proyecto
              <span>→</span>
            </a>
          </div>

          {/* DERECHA */}

          <div>
            <div
              className="
                overflow-hidden
                rounded-[1.75rem]
                border
                theme-card
              "
            >
              <AboutItem
                number="01"
                title="Entender"
                description="
                  Analizar el problema, los
                  procesos y los objetivos antes
                  de tomar decisiones técnicas.
                "
              />

              <AboutItem
                number="02"
                title="Diseñar"
                description="
                  Definir una arquitectura clara,
                  mantenible y preparada para
                  evolucionar junto al proyecto.
                "
              />

              <AboutItem
                number="03"
                title="Construir"
                description="
                  Transformar la solución en una
                  experiencia rápida, estable y
                  fácil de utilizar.
                "
              />

              <AboutItem
                number="04"
                title="Mejorar"
                description="
                  Medir, detectar oportunidades y
                  continuar optimizando el producto
                  después de su implementación.
                "
                last
              />
            </div>
          </div>
        </div>

        {/* BLOQUE INFERIOR */}

        <div
          className="
            mt-20
            grid
            gap-px
            overflow-hidden
            rounded-2xl
            border
            border-[var(--theme-border)]
            bg-[var(--theme-border)]
            sm:grid-cols-3
          "
        >
          <AboutStat
            title="Full Stack"
            description="Frontend + Backend"
          />

          <AboutStat
            title="Producto"
            description="Enfoque en negocio"
          />

          <AboutStat
            title="Escalabilidad"
            description="Arquitecturas mantenibles"
          />
        </div>
      </div>
    </section>
  );
}

function AboutItem({
  number,
  title,
  description,
  last = false,
}) {
  return (
    <article
      className={`
        grid
        gap-5
        p-7
        sm:grid-cols-[60px_1fr]
        sm:p-8

        ${
          !last
            ? "border-b border-[var(--theme-border)]"
            : ""
        }
      `}
    >
      <span
        className="
          text-xs
          font-medium
          theme-accent
        "
      >
        {number}
      </span>

      <div>
        <h3
          className="
            text-lg
            font-semibold
            tracking-[-0.025em]
            theme-title
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            max-w-lg
            text-sm
            leading-7
            theme-text
          "
        >
          {description}
        </p>
      </div>
    </article>
  );
}

function AboutStat({
  title,
  description,
}) {
  return (
    <div
      className="
        bg-[var(--theme-bg-card)]
        px-7
        py-6
      "
    >
      <p
        className="
          text-base
          font-semibold
          tracking-[-0.02em]
          theme-title
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xs
          theme-muted
        "
      >
        {description}
      </p>
    </div>
  );
}

export default AboutSection;