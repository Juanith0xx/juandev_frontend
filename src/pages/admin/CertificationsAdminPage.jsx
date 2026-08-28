import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAdminCertification,
  deleteAdminCertification,
  getAdminCertifications,
  updateAdminCertification,
} from "../../services/certificationsAdminService";

/* ============================================
   INITIAL FORM
============================================ */

const INITIAL_FORM = {
  title: "",
  institution: "",
  description: "",
  issued_date: "",
  expiration_date: "",
  credential_id: "",
  credential_url: "",
  certificate_url: "",
  logo_url: "",
  is_featured: false,
  is_published: true,
  display_order: 0,
};

/* ============================================
   PAGE
============================================ */

function CertificationsAdminPage() {
  const [
    certifications,
    setCertifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    publicationFilter,
    setPublicationFilter,
  ] = useState("ALL");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("ALL");

  const [
    modalMode,
    setModalMode,
  ] = useState(null);

  const [
    selectedCertification,
    setSelectedCertification,
  ] = useState(null);

  /* ============================================
     LOAD
  ============================================ */

  const loadCertifications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminCertifications();

        setCertifications(
          Array.isArray(
            data?.certifications
          )
            ? data.certifications
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando certificaciones:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible cargar las certificaciones."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCertifications();
  }, []);

  /* ============================================
     METRICS
  ============================================ */

  const metrics =
    useMemo(() => {
      return {
        total:
          certifications.length,

        published:
          certifications.filter(
            (item) =>
              item.is_published
          ).length,

        featured:
          certifications.filter(
            (item) =>
              item.is_featured
          ).length,

        expiring:
          certifications.filter(
            (item) =>
              Boolean(
                item.expiration_date
              )
          ).length,
      };
    }, [certifications]);

  /* ============================================
     FILTER
  ============================================ */

  const filteredCertifications =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return certifications.filter(
        (certification) => {
          const publicationMatches =
            publicationFilter ===
              "ALL" ||
            (
              publicationFilter ===
                "PUBLISHED" &&
              certification.is_published
            ) ||
            (
              publicationFilter ===
                "DRAFT" &&
              !certification.is_published
            );

          if (
            !publicationMatches
          ) {
            return false;
          }

          const typeMatches =
            typeFilter === "ALL" ||
            (
              typeFilter ===
                "FEATURED" &&
              certification.is_featured
            ) ||
            (
              typeFilter ===
                "WITH_EXPIRATION" &&
              Boolean(
                certification.expiration_date
              )
            ) ||
            (
              typeFilter ===
                "NO_EXPIRATION" &&
              !certification.expiration_date
            );

          if (!typeMatches) {
            return false;
          }

          if (!term) {
            return true;
          }

          return [
            certification.title,
            certification.institution,
            certification.description,
            certification.credential_id,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term);
        }
      );
    }, [
      certifications,
      search,
      publicationFilter,
      typeFilter,
    ]);

  const openCreate = () => {
    setSelectedCertification(
      null
    );

    setModalMode("create");
  };

  const openEdit = (
    certification
  ) => {
    setSelectedCertification(
      certification
    );

    setModalMode("edit");
  };

  const closeModal = () => {
    setSelectedCertification(
      null
    );

    setModalMode(null);
  };

  return (
    <div className="min-h-full">
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        className="
          flex
          flex-col
          gap-6
          border-b
          border-[var(--theme-border)]
          pb-8
          xl:flex-row
          xl:items-end
          xl:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--theme-text-secondary)]
            "
          >
            Formación
          </p>

          <h1
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-[var(--theme-text-primary)]
            "
          >
            Certificaciones
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-[var(--theme-text-secondary)]
            "
          >
            Administra las
            certificaciones,
            credenciales y formación
            verificable que se muestra
            en el portafolio.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          <button
            type="button"
            onClick={
              loadCertifications
            }
            disabled={loading}
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              px-5
              py-3
              text-sm
              font-medium
              text-[var(--theme-text-primary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:bg-[var(--theme-accent-soft)]
              hover:text-[var(--theme-text-primary)]
              disabled:opacity-40
            "
          >
            {loading
              ? "Actualizando..."
              : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="
              rounded-xl
              bg-[var(--theme-accent)]
              px-5
              py-3
              text-sm
              font-semibold
              text-[var(--theme-bg-page)]
              transition
              hover:bg-[var(--theme-accent-hover)]
            "
          >
            Nueva certificación
          </button>
        </div>
      </div>

      {/* ========================================
          METRICS
      ======================================== */}

      <div
        className="
          mt-8
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Total"
          value={metrics.total}
        />

        <MetricCard
          label="Publicadas"
          value={
            metrics.published
          }
        />

        <MetricCard
          label="Destacadas"
          value={
            metrics.featured
          }
        />

        <MetricCard
          label="Con vencimiento"
          value={
            metrics.expiring
          }
        />
      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          p-4
        "
      >
        <div
          className="
            grid
            gap-3
            xl:grid-cols-[minmax(280px,1fr)_200px_220px]
          "
        >
          <div className="relative">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar certificación, institución, credencial..."
              className="
                w-full
                rounded-xl
                border
                border-[var(--theme-border)]
                bg-[var(--theme-bg-secondary)]
                py-3
                pl-11
                pr-4
                text-sm
                text-[var(--theme-text-primary)]
                outline-none
                placeholder:text-[var(--theme-text-subtle)]
                focus:border-[var(--theme-accent)]/25
              "
            />
          </div>

          <select
            value={
              publicationFilter
            }
            onChange={(event) =>
              setPublicationFilter(
                event.target.value
              )
            }
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              focus:border-[var(--theme-accent)]/25
            "
          >
            <option value="ALL">
              Todas
            </option>

            <option value="PUBLISHED">
              Publicadas
            </option>

            <option value="DRAFT">
              Borradores
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="
              rounded-xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-secondary)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-primary)]
              outline-none
              focus:border-[var(--theme-accent)]/25
            "
          >
            <option value="ALL">
              Todas las categorías
            </option>

            <option value="FEATURED">
              Destacadas
            </option>

            <option value="WITH_EXPIRATION">
              Con vencimiento
            </option>

            <option value="NO_EXPIRATION">
              Sin vencimiento
            </option>
          </select>
        </div>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            px-5
            py-4
            text-sm
            text-[var(--theme-danger)]
          "
        >
          {error}
        </div>
      )}

      {/* ========================================
          LIST
      ======================================== */}

      <div className="mt-6">
        {loading ? (
          <CertificationsSkeleton />
        ) : filteredCertifications.length ===
          0 ? (
          <EmptyState
            filtered={
              Boolean(search) ||
              publicationFilter !==
                "ALL" ||
              typeFilter !== "ALL"
            }
          />
        ) : (
          <div
            className="
              grid
              gap-4
              xl:grid-cols-2
            "
          >
            {filteredCertifications.map(
              (certification) => (
                <CertificationCard
                  key={
                    certification.id
                  }
                  certification={
                    certification
                  }
                  onEdit={() =>
                    openEdit(
                      certification
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ========================================
          MODAL
      ======================================== */}

      {modalMode && (
        <CertificationModal
          mode={modalMode}
          certification={
            selectedCertification
          }
          onClose={closeModal}
          onSaved={async () => {
            await loadCertifications();
            closeModal();
          }}
          onDeleted={async () => {
            await loadCertifications();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

/* ============================================
   CERTIFICATION CARD
============================================ */

function CertificationCard({
  certification,
  onEdit,
}) {
  const status =
    getExpirationStatus(
      certification
    );

  return (
    <article
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-6
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-5
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-4
          "
        >
          <InstitutionLogo
            certification={
              certification
            }
          />

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              <PublicationBadge
                published={
                  certification.is_published
                }
              />

              {certification.is_featured && (
                <FeaturedBadge />
              )}

              <ExpirationBadge
                status={status}
              />
            </div>

            <h2
              className="
                mt-4
                text-lg
                font-semibold
                leading-6
                tracking-[-0.025em]
                text-[var(--theme-text-primary)]
              "
            >
              {certification.title}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[var(--theme-text-secondary)]
              "
            >
              {certification.institution}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="
            shrink-0
            rounded-xl
            border
            border-[var(--theme-border)]
            px-4
            py-2.5
            text-xs
            font-medium
            text-[var(--theme-text-secondary)]
            transition
            hover:border-[var(--theme-border-strong)]
            hover:bg-[var(--theme-accent-soft)]
            hover:text-[var(--theme-text-primary)]
          "
        >
          Administrar
        </button>
      </div>

      {certification.description && (
        <p
          className="
            mt-5
            min-h-[48px]
            text-sm
            leading-6
            text-[var(--theme-text-muted)]
          "
        >
          {truncateText(
            certification.description,
            180
          )}
        </p>
      )}

      <div
        className="
          mt-6
          grid
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
          sm:grid-cols-3
        "
      >
        <CardMeta
          label="Emisión"
          value={formatDate(
            certification.issued_date
          )}
        />

        <CardMeta
          label="Vencimiento"
          value={
            certification.expiration_date
              ? formatDate(
                  certification.expiration_date
                )
              : "Sin vencimiento"
          }
        />

        <CardMeta
          label="Orden"
          value={
            Number(
              certification.display_order
            ) || 0
          }
        />
      </div>

      {(certification.credential_url ||
        certification.certificate_url) && (
        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {certification.credential_url && (
            <ExternalLink
              href={
                certification.credential_url
              }
            >
              Ver credencial
            </ExternalLink>
          )}

          {certification.certificate_url && (
            <ExternalLink
              href={
                certification.certificate_url
              }
            >
              Ver certificado
            </ExternalLink>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================
   MODAL
============================================ */

function CertificationModal({
  mode,
  certification,
  onClose,
  onSaved,
  onDeleted,
}) {
  const editing =
    mode === "edit" &&
    Boolean(certification);

  const [form, setForm] =
    useState(
      editing
        ? certificationToForm(
            certification
          )
        : {
            ...INITIAL_FORM,
          }
    );

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    deleteConfirm,
    setDeleteConfirm,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /* ============================================
     BODY LOCK + ESC
  ============================================ */

  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !deleteConfirm
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previous;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    deleteConfirm,
  ]);

  /* ============================================
     CHANGE
  ============================================ */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* ============================================
     SAVE
  ============================================ */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!form.title.trim()) {
        setError(
          "El título de la certificación es obligatorio."
        );

        return;
      }

      if (
        !form.institution.trim()
      ) {
        setError(
          "La institución es obligatoria."
        );

        return;
      }

      if (
        form.issued_date &&
        form.expiration_date &&
        form.expiration_date <
          form.issued_date
      ) {
        setError(
          "La fecha de expiración no puede ser anterior a la fecha de emisión."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildPayload(form);

        if (editing) {
          await updateAdminCertification(
            certification.id,
            payload
          );
        } else {
          await createAdminCertification(
            payload
          );
        }

        await onSaved?.();
      } catch (error) {
        console.error(
          "Error guardando certificación:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible guardar la certificación."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ============================================
     DELETE
  ============================================ */

  const handleDelete =
    async () => {
      if (!certification) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await deleteAdminCertification(
          certification.id
        );

        await onDeleted?.();
      } catch (error) {
        console.error(
          "Error eliminando certificación:",
          error
        );

        setDeleteConfirm(
          false
        );

        setError(
          error.response?.data
            ?.message ||
            "No fue posible eliminar la certificación."
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleteConfirm
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          max-h-[94vh]
          w-full
          max-w-6xl
          overflow-y-auto
          rounded-[1.75rem]
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-elevated)]
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            border-b
            border-[var(--theme-border)]
            bg-[var(--theme-bg-elevated)]/95
            px-6
            py-5
            backdrop-blur
            sm:px-8
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-[var(--theme-text-muted)]
              "
            >
              {editing
                ? "Administración"
                : "Nueva credencial"}
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-semibold
                tracking-[-0.025em]
                text-[var(--theme-text-primary)]
              "
            >
              {editing
                ? "Editar certificación"
                : "Crear certificación"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--theme-border)]
              text-[var(--theme-text-secondary)]
              transition
              hover:border-[var(--theme-border-strong)]
              hover:text-[var(--theme-text-primary)]
            "
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="
            grid
            lg:grid-cols-[1.15fr_0.85fr]
          "
        >
          {/* LEFT */}

          <div
            className="
              border-b
              border-[var(--theme-border)]
              p-6
              sm:p-8
              lg:border-b-0
              lg:border-r
            "
          >
            <SectionTitle>
              Información principal
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <Field
                label="Certificación"
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Nombre de la certificación"
              />

              <Field
                label="Institución / emisor"
                name="institution"
                value={
                  form.institution
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Institución"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="certification-description"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Descripción
              </label>

              <textarea
                id="certification-description"
                name="description"
                rows="7"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe brevemente el alcance de esta certificación."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  px-4
                  py-3.5
                  text-sm
                  leading-7
                  text-[var(--theme-text-primary)]
                  outline-none
                  placeholder:text-[var(--theme-text-subtle)]
                  focus:border-[var(--theme-accent)]/25
                "
              />
            </div>

            <SectionTitle>
              Fechas
            </SectionTitle>

            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <DateField
                label="Fecha de emisión"
                name="issued_date"
                value={
                  form.issued_date
                }
                onChange={
                  handleChange
                }
              />

              <DateField
                label="Fecha de expiración"
                name="expiration_date"
                value={
                  form.expiration_date
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <SectionTitle>
              Credencial
            </SectionTitle>

            <div
              className="
                mt-4
                space-y-4
              "
            >
              <Field
                label="ID de credencial"
                name="credential_id"
                value={
                  form.credential_id
                }
                onChange={
                  handleChange
                }
                placeholder="ID / código verificable"
              />

              <Field
                label="URL de credencial"
                name="credential_url"
                value={
                  form.credential_url
                }
                onChange={
                  handleChange
                }
                placeholder="https://..."
              />

              <Field
                label="URL del certificado"
                name="certificate_url"
                value={
                  form.certificate_url
                }
                onChange={
                  handleChange
                }
                placeholder="https://..."
              />
            </div>

            <SectionTitle>
              Imagen
            </SectionTitle>

            <div className="mt-4">
              <Field
                label="Logo / imagen de institución"
                name="logo_url"
                value={
                  form.logo_url
                }
                onChange={
                  handleChange
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              p-6
              sm:p-8
            "
          >
            <SectionTitle>
              Publicación
            </SectionTitle>

            <div
              className="
                mt-4
                space-y-3
              "
            >
              <ToggleCard
                name="is_published"
                checked={
                  form.is_published
                }
                onChange={
                  handleChange
                }
                title="Publicada"
                description="Permite mostrar esta certificación en el sitio público."
              />

              <ToggleCard
                name="is_featured"
                checked={
                  form.is_featured
                }
                onChange={
                  handleChange
                }
                title="Destacada"
                description="Da prioridad a esta certificación en el orden público."
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="certification-order"
                className="
                  mb-2
                  block
                  text-xs
                  font-medium
                  text-[var(--theme-text-secondary)]
                "
              >
                Orden
              </label>

              <input
                id="certification-order"
                type="number"
                min="0"
                name="display_order"
                value={
                  form.display_order
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[var(--theme-border)]
                  bg-[var(--theme-bg-secondary)]
                  px-4
                  py-3.5
                  text-sm
                  text-[var(--theme-text-primary)]
                  outline-none
                  focus:border-[var(--theme-accent)]/25
                "
              />
            </div>

            {/* PREVIEW */}

            <div
              className="
                mt-8
                border-t
                border-[var(--theme-border)]
                pt-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.17em]
                  text-[var(--theme-text-muted)]
                "
              >
                Vista previa pública
              </p>

              <CertificationPreview
                form={form}
              />
            </div>

            {error && (
              <div
                className="
                  mt-5
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
              disabled={saving}
              className="
                mt-6
                w-full
                rounded-xl
                bg-[var(--theme-accent)]
                px-5
                py-3.5
                text-sm
                font-semibold
                text-[var(--theme-bg-page)]
                transition
                hover:bg-[var(--theme-accent-hover)]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {saving
                ? "Guardando..."
                : editing
                ? "Guardar cambios"
                : "Crear certificación"}
            </button>

            {editing && (
              <div
                className="
                  mt-8
                  border-t
                  border-[var(--theme-border)]
                  pt-8
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    text-[var(--theme-text-secondary)]
                  "
                >
                  Eliminar certificación
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[var(--theme-text-subtle)]
                  "
                >
                  Esta acción elimina
                  permanentemente el
                  registro.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirm(
                      true
                    )
                  }
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-[var(--theme-danger)]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-[var(--theme-danger)]
                    transition
                    hover:bg-[var(--theme-danger-soft)]
                  "
                >
                  Eliminar certificación
                </button>
              </div>
            )}
          </div>
        </form>

        {deleteConfirm &&
          certification && (
            <DeleteCertificationModal
              certification={
                certification
              }
              loading={deleting}
              onCancel={() =>
                setDeleteConfirm(
                  false
                )
              }
              onConfirm={
                handleDelete
              }
            />
          )}
      </div>
    </div>
  );
}

/* ============================================
   PREVIEW
============================================ */

function CertificationPreview({
  form,
}) {
  return (
    <div
      className="
        mt-4
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <InstitutionLogo
          certification={form}
          large
        />

        <div className="min-w-0">
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <PublicationBadge
              published={
                form.is_published
              }
            />

            {form.is_featured && (
              <FeaturedBadge />
            )}
          </div>

          <h3
            className="
              mt-4
              text-lg
              font-semibold
              leading-6
              tracking-[-0.025em]
              text-[var(--theme-text-primary)]
            "
          >
            {form.title ||
              "Nombre de la certificación"}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-[var(--theme-text-secondary)]
            "
          >
            {form.institution ||
              "Institución"}
          </p>
        </div>
      </div>

      <p
        className="
          mt-5
          text-sm
          leading-7
          text-[var(--theme-text-muted)]
        "
      >
        {form.description ||
          "La descripción de la certificación aparecerá aquí."}
      </p>

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
          border-t
          border-[var(--theme-border)]
          pt-5
        "
      >
        <CardMeta
          label="Emisión"
          value={
            form.issued_date
              ? formatDate(
                  form.issued_date
                )
              : "—"
          }
        />

        <CardMeta
          label="Vencimiento"
          value={
            form.expiration_date
              ? formatDate(
                  form.expiration_date
                )
              : "Sin vencimiento"
          }
        />
      </div>

      {form.credential_id && (
        <p
          className="
            mt-4
            text-xs
            text-[var(--theme-text-subtle)]
          "
        >
          ID: {form.credential_id}
        </p>
      )}
    </div>
  );
}

/* ============================================
   DELETE
============================================ */

function DeleteCertificationModal({
  certification,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="
        absolute
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/90
        p-5
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-card)]
          p-6
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--theme-danger)]
            bg-[var(--theme-danger-soft)]
            text-[var(--theme-danger)]
          "
        >
          !
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-semibold
            text-[var(--theme-text-primary)]
          "
        >
          ¿Eliminar certificación?
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[var(--theme-text-secondary)]
          "
        >
          Se eliminará
          permanentemente{" "}
          <strong
            className="
              font-semibold
              text-[var(--theme-text-primary)]
            "
          >
            {certification.title}
          </strong>
          .
        </p>

        <div
          className="
            mt-7
            flex
            gap-3
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              border
              border-[var(--theme-border)]
              px-4
              py-3
              text-sm
              text-[var(--theme-text-secondary)]
              hover:text-[var(--theme-text-primary)]
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              bg-[var(--theme-danger)]
              px-4
              py-3
              text-sm
              font-semibold
              text-[var(--theme-text-primary)]
              hover:opacity-90
              disabled:opacity-40
            "
          >
            {loading
              ? "Eliminando..."
              : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   COMPONENTS
============================================ */

function InstitutionLogo({
  certification,
  large = false,
}) {
  const size =
    large
      ? "h-14 w-14"
      : "h-12 w-12";

  if (certification.logo_url) {
    return (
      <div
        className={`
          ${size}
          shrink-0
          overflow-hidden
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-accent)]
        `}
      >
        <img
          src={
            certification.logo_url
          }
          alt=""
          className="
            h-full
            w-full
            object-contain
            p-1
          "
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${size}
        flex
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        text-sm
        font-semibold
        text-[var(--theme-text-secondary)]
      `}
    >
      {getInitials(
        certification.institution
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        p-5
      "
    >
      <p
        className="
          text-xs
          text-[var(--theme-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-semibold
          tracking-[-0.035em]
          text-[var(--theme-text-primary)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function CardMeta({
  label,
  value,
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.12em]
          text-[var(--theme-text-subtle)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-xs
          text-[var(--theme-text-secondary)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={`certification-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`certification-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          placeholder:text-[var(--theme-text-subtle)]
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function DateField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={`certification-${name}`}
        className="
          mb-2
          block
          text-xs
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {label}
      </label>

      <input
        id={`certification-${name}`}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-xl
          border
          border-[var(--theme-border)]
          bg-[var(--theme-bg-secondary)]
          px-4
          py-3.5
          text-sm
          text-[var(--theme-text-primary)]
          outline-none
          focus:border-[var(--theme-accent)]/25
        "
      />
    </div>
  );
}

function ToggleCard({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-secondary)]
        p-4
      "
    >
      <input
        type="checkbox"
        name={name}
        checked={
          Boolean(checked)
        }
        onChange={onChange}
        className="
          mt-1
          h-4
          w-4
          accent-[var(--theme-accent)]
        "
      />

      <div>
        <p
          className="
            text-sm
            font-medium
            text-[var(--theme-text-primary)]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-[var(--theme-text-muted)]
          "
        >
          {description}
        </p>
      </div>
    </label>
  );
}

function SectionTitle({
  children,
}) {
  return (
    <p
      className="
        mt-8
        first:mt-0
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.17em]
        text-[var(--theme-text-muted)]
      "
    >
      {children}
    </p>
  );
}

function PublicationBadge({
  published,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${
          published
            ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
            : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            published
              ? "bg-[var(--theme-success)]"
              : "bg-[var(--theme-text-muted)]"
          }
        `}
      />

      {published
        ? "Publicada"
        : "Borrador"}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border
        border-[var(--theme-border)]
        bg-[var(--theme-border)]
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--theme-text-primary)]
      "
    >
      Destacada
    </span>
  );
}

function ExpirationBadge({
  status,
}) {
  const config = {
    valid: {
      label: "Vigente",
      className:
        "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]",
    },

    expired: {
      label: "Vencida",
      className:
        "border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]",
    },

    permanent: {
      label: "Sin vencimiento",
      className:
        "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
    },
  };

  const current =
    config[status] ||
    config.permanent;

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.09em]

        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

function ExternalLink({
  href,
  children,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        rounded-lg
        border
        border-[var(--theme-border)]
        px-3
        py-2
        text-xs
        font-medium
        text-[var(--theme-text-secondary)]
        transition
        hover:border-[var(--theme-border-strong)]
        hover:text-[var(--theme-text-primary)]
      "
    >
      {children} ↗
    </a>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="
        absolute
        left-4
        top-1/2
        h-4
        w-4
        -translate-y-1/2
        text-[var(--theme-text-subtle)]
      "
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/* ============================================
   EMPTY + SKELETON
============================================ */

function EmptyState({
  filtered,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
        px-6
        py-20
        text-center
      "
    >
      <p
        className="
          text-sm
          font-medium
          text-[var(--theme-text-secondary)]
        "
      >
        {filtered
          ? "No encontramos certificaciones con estos filtros."
          : "Todavía no hay certificaciones registradas."}
      </p>

      <p
        className="
          mt-2
          text-xs
          text-[var(--theme-text-subtle)]
        "
      >
        {filtered
          ? "Prueba modificando los filtros o la búsqueda."
          : "Crea tu primera certificación desde Nueva certificación."}
      </p>
    </div>
  );
}

function CertificationsSkeleton() {
  return (
    <div
      className="
        grid
        gap-4
        xl:grid-cols-2
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              animate-pulse
              rounded-2xl
              border
              border-[var(--theme-border)]
              bg-[var(--theme-bg-card)]
              p-6
            "
          >
            <div
              className="
                flex
                gap-4
              "
            >
              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-[var(--theme-border)]
                "
              />

              <div className="flex-1">
                <div
                  className="
                    h-4
                    w-52
                    rounded
                    bg-[var(--theme-border)]
                  "
                />

                <div
                  className="
                    mt-3
                    h-3
                    w-36
                    rounded
                    bg-[var(--theme-bg-secondary)]
                  "
                />
              </div>
            </div>

            <div
              className="
                mt-6
                h-3
                w-full
                rounded
                bg-[var(--theme-bg-secondary)]
              "
            />
          </div>
        )
      )}
    </div>
  );
}

/* ============================================
   HELPERS
============================================ */

function certificationToForm(
  certification
) {
  return {
    title:
      certification.title || "",

    institution:
      certification.institution ||
      "",

    description:
      certification.description ||
      "",

    issued_date:
      normalizeDateValue(
        certification.issued_date
      ),

    expiration_date:
      normalizeDateValue(
        certification.expiration_date
      ),

    credential_id:
      certification.credential_id ||
      "",

    credential_url:
      certification.credential_url ||
      "",

    certificate_url:
      certification.certificate_url ||
      "",

    logo_url:
      certification.logo_url || "",

    is_featured:
      Boolean(
        certification.is_featured
      ),

    is_published:
      Boolean(
        certification.is_published
      ),

    display_order:
      Number(
        certification.display_order
      ) || 0,
  };
}

function buildPayload(form) {
  return {
    title:
      form.title.trim(),

    institution:
      form.institution.trim(),

    description:
      nullable(
        form.description
      ),

    issued_date:
      nullable(
        form.issued_date
      ),

    expiration_date:
      nullable(
        form.expiration_date
      ),

    credential_id:
      nullable(
        form.credential_id
      ),

    credential_url:
      nullable(
        form.credential_url
      ),

    certificate_url:
      nullable(
        form.certificate_url
      ),

    logo_url:
      nullable(form.logo_url),

    is_featured:
      Boolean(
        form.is_featured
      ),

    is_published:
      Boolean(
        form.is_published
      ),

    display_order:
      Number(
        form.display_order
      ) || 0,
  };
}

function getExpirationStatus(
  certification
) {
  if (
    !certification.expiration_date
  ) {
    return "permanent";
  }

  const expiration =
    new Date(
      `${normalizeDateValue(
        certification.expiration_date
      )}T23:59:59`
    );

  return expiration <
    new Date()
    ? "expired"
    : "valid";
}

function formatDate(value) {
  const normalized =
    normalizeDateValue(value);

  if (!normalized) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] = normalized
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "es-CL",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

function normalizeDateValue(
  value
) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
}

function nullable(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
}

function getInitials(value) {
  return String(value || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) =>
      item
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}

function truncateText(
  text,
  maxLength
) {
  if (!text) {
    return "";
  }

  return text.length <=
    maxLength
    ? text
    : `${text.slice(
        0,
        maxLength
      )}…`;
}

export default CertificationsAdminPage;
