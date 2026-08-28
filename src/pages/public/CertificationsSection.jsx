import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPublicCertifications,
} from "../../services/certificationsService";

function CertificationsSection() {
  const [certifications, setCertifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================
     CARGAR CERTIFICACIONES
  ============================================ */

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicCertifications();

        const list =
          data?.certifications ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        const activeCertifications =
          list.filter(
            (certification) =>
              certification.is_active !== false &&
              certification.is_published !== false
          );

        setCertifications(
          activeCertifications
        );
      } catch (error) {
        console.error(
          "Error cargando certificaciones:",
          error
        );

        setError(
          "No fue posible cargar las certificaciones."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, []);

  /* ============================================
     ORDENAR POR FECHA
  ============================================ */

  const orderedCertifications =
    useMemo(() => {
      return [...certifications].sort(
        (a, b) => {
          const dateA =
            getCertificationDate(a);

          const dateB =
            getCertificationDate(b);

          return (
            new Date(dateB || 0) -
            new Date(dateA || 0)
          );
        }
      );
    }, [certifications]);

  return (
    <section
      id="certificaciones"
      className="
        theme-section
        theme-border
        border-t
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
        {/* ============================================
            HEADER
        ============================================ */}

        <div
          className="
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
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
              Formación continua
            </p>

            <h2
              className="
                mt-4
                text-3xl
                font-semibold
                tracking-[-0.04em]
                theme-title
                sm:text-4xl
              "
            >
              Certificaciones
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-7
                theme-text
                sm:text-base
              "
            >
              Certificaciones y formación
              complementaria que respaldan
              conocimientos técnicos y
              profesionales.
            </p>
          </div>

          {!loading &&
            !error &&
            certifications.length > 0 && (
              <div
                className="
                  text-sm
                  theme-muted
                "
              >
                {certifications.length}{" "}
                {certifications.length === 1
                  ? "certificación"
                  : "certificaciones"}
              </div>
            )}
        </div>

        {/* ============================================
            CARGANDO
        ============================================ */}

        {loading && (
          <CertificationsSkeleton />
        )}

        {/* ============================================
            ERROR
        ============================================ */}

        {!loading && error && (
          <div
            className="
              mt-12
              rounded-2xl
              border
              theme-card
              p-7
              text-sm
              theme-text
            "
          >
            {error}
          </div>
        )}

        {/* ============================================
            SIN CERTIFICACIONES
        ============================================ */}

        {!loading &&
          !error &&
          orderedCertifications.length ===
            0 && (
            <div
              className="
                mt-12
                rounded-2xl
                border
                theme-card
                p-7
              "
            >
              <p
                className="
                  text-sm
                  theme-text
                "
              >
                Próximamente se publicarán
                certificaciones.
              </p>
            </div>
          )}

        {/* ============================================
            GRID
        ============================================ */}

        {!loading &&
          !error &&
          orderedCertifications.length >
            0 && (
            <div
              className="
                mt-12
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {orderedCertifications.map(
                (
                  certification,
                  index
                ) => (
                  <CertificationCard
                    key={
                      certification.id ||
                      `${certification.title}-${index}`
                    }
                    certification={
                      certification
                    }
                    number={index + 1}
                  />
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}

/* ============================================
   CARD
============================================ */

function CertificationCard({
  certification,
  number,
}) {
  const title =
    certification.title ||
    certification.name ||
    certification.certification_name ||
    "Certificación";

  const institution =
    certification.issuer ||
    certification.institution ||
    certification.organization ||
    certification.issued_by ||
    "";

  const date =
    getCertificationDate(
      certification
    );

  const credentialId =
    certification.credential_id ||
    certification.credential_code ||
    certification.certificate_code ||
    certification.code ||
    "";

  const credentialUrl =
    certification.credential_url ||
    certification.verification_url ||
    certification.certificate_url ||
    certification.url ||
    "";

  const image =
    certification.image_url ||
    certification.logo_url ||
    certification.image ||
    certification.logo ||
    null;

  const description =
    certification.description ||
    "";

  return (
    <article
      className="
        group
        relative
        flex
        min-h-[350px]
        flex-col
        overflow-hidden
        rounded-[1.5rem]
        border
        theme-card-hover
        p-7
        transition-all
        duration-300
        hover:-translate-y-1
      "
    >
      {/* NÚMERO */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        {/* LOGO / ICONO */}

        <div
          className="
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            border
            border-[var(--theme-border)]
            bg-[var(--theme-bg-secondary)]
          "
        >
          {image ? (
            <img
              src={image}
              alt={institution || title}
              className="
                h-full
                w-full
                object-contain
                p-2
              "
            />
          ) : (
            <CertificateIcon />
          )}
        </div>

        <span
          className="
            text-xs
            font-medium
            theme-accent
          "
        >
          {String(number).padStart(
            2,
            "0"
          )}
        </span>
      </div>

      {/* INFORMACIÓN */}

      <div className="mt-8">
        {institution && (
          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.14em]
              theme-eyebrow
            "
          >
            {institution}
          </p>
        )}

        <h3
          className="
            mt-3
            text-xl
            font-semibold
            leading-7
            tracking-[-0.03em]
            theme-title
          "
        >
          {title}
        </h3>

        {date && (
          <p
            className="
              mt-3
              text-xs
              theme-muted
            "
          >
            Emitida en{" "}
            {formatCertificationDate(
              date
            )}
          </p>
        )}

        {description && (
          <p
            className="
              mt-5
              line-clamp-3
              text-sm
              leading-7
              theme-text
            "
          >
            {description}
          </p>
        )}
      </div>

      {/* FOOTER */}

      <div className="mt-auto pt-8">
        {credentialId && (
          <div
            className="
              mb-5
              border-t
              border-[var(--theme-border)]
              pt-5
            "
          >
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.15em]
                theme-subtle
              "
            >
              ID credencial
            </p>

            <p
              className="
                mt-1.5
                truncate
                text-xs
                theme-muted
              "
            >
              {credentialId}
            </p>
          </div>
        )}

        {credentialUrl ? (
          <a
            href={credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-3
              text-sm
              font-semibold
              theme-link
              transition-colors
              duration-300
            "
          >
            Ver credencial

            <span
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              ↗
            </span>
          </a>
        ) : (
          <span
            className="
              text-xs
              theme-subtle
            "
          >
            Certificación profesional
          </span>
        )}
      </div>
    </article>
  );
}

/* ============================================
   ICONO
============================================ */

function CertificateIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="theme-muted"
      aria-hidden="true"
    >
      <path
        d="
          M6 3.75h12
          a1.5 1.5 0 0 1
          1.5 1.5v9
          a1.5 1.5 0 0 1
          -1.5 1.5H6
          a1.5 1.5 0 0 1
          -1.5-1.5v-9
          A1.5 1.5 0 0 1
          6 3.75Z
        "
      />

      <path d="M8 8h8" />
      <path d="M8 11h5" />

      <path
        d="
          M9 15.75v4.5l3-1.5
          3 1.5v-4.5
        "
      />
    </svg>
  );
}

/* ============================================
   FECHA
============================================ */

function getCertificationDate(
  certification
) {
  return (
    certification.issue_date ||
    certification.issued_at ||
    certification.date_issued ||
    certification.date ||
    certification.created_at ||
    null
  );
}

function formatCertificationDate(
  date
) {
  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      "es-CL",
      {
        month: "long",
        year: "numeric",
      }
    ).format(new Date(date));
  } catch {
    return "";
  }
}

/* ============================================
   SKELETON
============================================ */

function CertificationsSkeleton() {
  return (
    <div
      className="
        mt-12
        grid
        gap-4
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="
              min-h-[350px]
              animate-pulse
              rounded-[1.5rem]
              border
              theme-card
              p-7
            "
          >
            <div
              className="
                h-14
                w-14
                rounded-xl
                bg-[var(--theme-border-strong)]
              "
            />

            <div
              className="
                mt-8
                h-3
                w-28
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-4
                h-6
                w-4/5
                rounded
                bg-[var(--theme-border-strong)]
              "
            />

            <div
              className="
                mt-3
                h-3
                w-32
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-8
                h-3
                w-full
                rounded
                bg-[var(--theme-border)]
              "
            />

            <div
              className="
                mt-2
                h-3
                w-3/4
                rounded
                bg-[var(--theme-border)]
              "
            />
          </div>
        )
      )}
    </div>
  );
}

export default CertificationsSection;