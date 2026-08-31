import { useEffect, useMemo, useState } from "react";
import {
  createAdminProject,
  createAdminProjectImage,
  deleteAdminProject,
  deleteAdminProjectImage,
  getAdminProjectImages,
  getAdminProjects,
  getAdminTechnologies,
  updateAdminProject,
  updateAdminProjectImage,
  updateAdminProjectTechnologies,
} from "../../services/projectsAdminService";

const PROJECT_TYPES = [
  { value: "PERSONAL", label: "Personal" },
  { value: "PROFESSIONAL", label: "Profesional" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "CONFIDENTIAL", label: "Confidencial" },
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  project_type: "PERSONAL",
  client_name: "",
  is_confidential: false,
  client_visible: true,
  cover_image_url: "",
  demo_url: "",
  github_url: "",
  start_date: "",
  end_date: "",
  is_featured: false,
  is_published: false,
  display_order: 0,
};

function ProjectsAdminPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [publicationFilter, setPublicationFilter] = useState("ALL");
  const [editingProject, setEditingProject] = useState(null);
  const [contentProject, setContentProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProjects();
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch (err) {
      console.error("Error cargando proyectos:", err);
      setError(
        err.response?.data?.message ||
          "No fue posible cargar los proyectos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const metrics = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((p) => p.is_published).length,
      featured: projects.filter((p) => p.is_featured).length,
      confidential: projects.filter(
        (p) => p.is_confidential || p.project_type === "CONFIDENTIAL"
      ).length,
    }),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return projects.filter((project) => {
      const typeOk =
        typeFilter === "ALL" || project.project_type === typeFilter;

      const publicationOk =
        publicationFilter === "ALL" ||
        (publicationFilter === "PUBLISHED" && project.is_published) ||
        (publicationFilter === "DRAFT" && !project.is_published);

      if (!typeOk || !publicationOk) return false;
      if (!term) return true;

      return [
        project.title,
        project.slug,
        project.short_description,
        project.description,
        project.client_name,
        project.project_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [projects, search, typeFilter, publicationFilter]);

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-6 border-b border-[var(--theme-border)] pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
            Contenido
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--theme-text-primary)]">
            Proyectos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--theme-text-secondary)]">
            Administra los proyectos del portafolio, su publicación,
            visibilidad, confidencialidad y contenido principal.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="rounded-xl border border-[var(--theme-border)] px-5 py-3 text-sm font-medium text-[var(--theme-text-primary)] transition hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-accent-soft)] hover:text-[var(--theme-text-primary)] disabled:opacity-40"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-[var(--theme-accent)] px-5 py-3 text-sm font-semibold text-[var(--theme-bg-page)] transition hover:bg-[var(--theme-accent-hover)]"
          >
            Nuevo proyecto
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total" value={metrics.total} />
        <Metric label="Publicados" value={metrics.published} />
        <Metric label="Destacados" value={metrics.featured} />
        <Metric label="Confidenciales" value={metrics.confidential} />
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_220px_180px]">
          <div className="relative">
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proyecto, slug, cliente..."
              className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] py-3 pl-11 pr-4 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
          >
            <option value="ALL">Todos los tipos</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={publicationFilter}
            onChange={(e) => setPublicationFilter(e.target.value)}
            className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
          >
            <option value="ALL">Todos</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Borradores</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-5 py-4 text-sm text-[var(--theme-danger)]">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <ProjectSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)] px-6 py-20 text-center">
            <p className="text-sm font-medium text-[var(--theme-text-secondary)]">
              No hay proyectos que coincidan.
            </p>
            <p className="mt-2 text-xs text-[var(--theme-text-subtle)]">
              Crea un proyecto nuevo o ajusta los filtros.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditingProject(project)}
                onContent={() => setContentProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <ProjectEditor
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={async () => {
            await loadProjects();
            setShowCreate(false);
          }}
        />
      )}

      {editingProject && (
        <ProjectEditor
          mode="edit"
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={async () => {
            await loadProjects();
            setEditingProject(null);
          }}
          onDeleted={async () => {
            await loadProjects();
            setEditingProject(null);
          }}
        />
      )}

      {contentProject && (
        <ProjectContentModal
          project={contentProject}
          onClose={() => setContentProject(null)}
          onChanged={loadProjects}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onEdit, onContent }) {
  const confidential =
    project.is_confidential || project.project_type === "CONFIDENTIAL";

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)]">
      <div className="relative aspect-[16/7] overflow-hidden border-b border-[var(--theme-border)] bg-[var(--theme-bg-secondary)]">
        {!confidential && project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ProjectPlaceholder confidential={confidential} />
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <PublicationBadge published={project.is_published} />
          {project.is_featured && <Badge>Destacado</Badge>}
          {confidential && <ConfidentialBadge />}
        </div>

        <span className="absolute bottom-4 right-4 rounded-lg border border-[var(--theme-border)] bg-black/60 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--theme-text-secondary)]">
          Orden {Number(project.display_order) || 0}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--theme-text-subtle)]">
              {typeLabel(project.project_type)}
            </p>
            <h2 className="mt-2 truncate text-xl font-semibold tracking-[-0.03em] text-[var(--theme-text-primary)]">
              {project.title}
            </h2>
            <p className="mt-1 truncate text-xs text-[var(--theme-text-subtle)]">
              /{project.slug}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onContent}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2.5 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-accent-soft)] hover:text-[var(--theme-text-primary)]"
            >
              Contenido
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2.5 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-accent-soft)] hover:text-[var(--theme-text-primary)]"
            >
              Administrar
            </button>
          </div>
        </div>

        <p className="mt-5 min-h-[48px] text-sm leading-6 text-[var(--theme-text-secondary)]">
          {project.short_description || "Sin descripción corta."}
        </p>

        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies.slice(0, 6).map((technology) => (
              <span
                key={technology.id}
                className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--theme-text-secondary)]"
              >
                {technology.name}
              </span>
            ))}

            {project.technologies.length > 6 && (
              <span className="rounded-lg border border-[var(--theme-border)] px-2.5 py-1.5 text-[10px] text-[var(--theme-text-subtle)]">
                +{project.technologies.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--theme-border)] pt-5">
          <Meta label="Inicio" value={formatDate(project.start_date)} />
          <Meta
            label="Término"
            value={project.end_date ? formatDate(project.end_date) : "En curso"}
          />
        </div>
      </div>
    </article>
  );
}


/* ============================================
   PROJECT CONTENT: TECHNOLOGIES + IMAGES
============================================ */

function ProjectContentModal({ project, onClose, onChanged }) {
  const [activeTab, setActiveTab] = useState("technologies");
  const [technologies, setTechnologies] = useState([]);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState(
    () => new Set((project.technologies || []).map((item) => item.id))
  );
  const [technologySearch, setTechnologySearch] = useState("");
  const [loadingTechnologies, setLoadingTechnologies] = useState(true);
  const [savingTechnologies, setSavingTechnologies] = useState(false);

  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [registeringImage, setRegisteringImage] = useState(false);
  const [imageFolder, setImageFolder] = useState(
    () => getDefaultProjectImageFolder(project)
  );
  const [imageFileName, setImageFileName] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [makeCover, setMakeCover] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const confidential =
    project.is_confidential || project.project_type === "CONFIDENTIAL";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoadingTechnologies(true);
        const data = await getAdminTechnologies();
        setTechnologies(
          Array.isArray(data?.technologies) ? data.technologies : []
        );
      } catch (err) {
        console.error("Error cargando tecnologías:", err);
        setError(
          err.response?.data?.message ||
            "No fue posible cargar las tecnologías."
        );
      } finally {
        setLoadingTechnologies(false);
      }
    };

    loadTechnologies();
  }, []);

  const loadImages = async () => {
    if (confidential) {
      setImages([]);
      setLoadingImages(false);
      return;
    }

    try {
      setLoadingImages(true);
      setError("");

      const imagesData = await getAdminProjectImages(project.id);

      const list = Array.isArray(imagesData?.images) ? imagesData.images : [];
      setImages(list);
      setMakeCover(!list.some((image) => image.is_cover));
    } catch (err) {
      console.error("Error cargando imágenes:", err);
      setError(
        err.response?.data?.message || "No fue posible cargar las imágenes."
      );
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (activeTab === "images") {
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, project.id]);

  const filteredTechnologies = useMemo(() => {
    const term = technologySearch.trim().toLowerCase();

    return technologies.filter((technology) => {
      if (!term) return true;

      return [technology.name, technology.category, technology.slug]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [technologies, technologySearch]);

  const groupedTechnologies = useMemo(() => {
    const groups = new Map();

    filteredTechnologies.forEach((technology) => {
      const category = technology.category || "OTRAS";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(technology);
    });

    return Array.from(groups.entries());
  }, [filteredTechnologies]);

  const toggleTechnology = (technology) => {
    const selected = selectedTechnologyIds.has(technology.id);

    if (!technology.is_active && !selected) return;

    setSelectedTechnologyIds((current) => {
      const next = new Set(current);
      if (next.has(technology.id)) next.delete(technology.id);
      else next.add(technology.id);
      return next;
    });

    setSuccess("");
    setError("");
  };

  const saveTechnologies = async () => {
    try {
      setSavingTechnologies(true);
      setError("");
      setSuccess("");

      const data = await updateAdminProjectTechnologies(
        project.id,
        Array.from(selectedTechnologyIds)
      );

      setSuccess(
        data?.message || "Tecnologías actualizadas correctamente."
      );

      await onChanged?.();
    } catch (err) {
      console.error("Error guardando tecnologías:", err);
      setError(
        err.response?.data?.message ||
          "No fue posible actualizar las tecnologías."
      );
    } finally {
      setSavingTechnologies(false);
    }
  };

  const imageUrlPreview = useMemo(
    () => buildPublicProjectImageUrl(imageFolder, imageFileName),
    [imageFolder, imageFileName]
  );

  const registerImage = async () => {
    const fileName = imageFileName.trim();

    if (!fileName) {
      setError("Ingresa el nombre del archivo que ya existe en public.");
      return;
    }

    if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(fileName)) {
      setError("Formato no permitido. Usa JPG, PNG, WEBP, AVIF o GIF.");
      return;
    }

    const imageUrl = buildPublicProjectImageUrl(imageFolder, fileName);

    if (!imageUrl) {
      setError("No fue posible construir la ruta pública de la imagen.");
      return;
    }

    if (images.some((image) => image.image_url === imageUrl)) {
      setError("Esta imagen ya está registrada en el proyecto.");
      return;
    }

    try {
      setRegisteringImage(true);
      setError("");
      setSuccess("");

      const exists = await checkPublicImageExists(imageUrl);

      if (!exists) {
        throw new Error(
          `No encontramos ${imageUrl}. Confirma que el archivo exista físicamente en public${imageUrl} y que el frontend haya sido desplegado.`
        );
      }

      const shouldBeCover = makeCover || images.length === 0;

      await createAdminProjectImage(project.id, {
        image_url: imageUrl,
        alt_text: imageAltText.trim() || project.title,
        is_cover: shouldBeCover,
        display_order: images.length,
      });

      setImageFileName("");
      setImageAltText("");
      setMakeCover(false);
      setSuccess("Imagen local registrada correctamente.");

      await loadImages();
      await onChanged?.();
    } catch (err) {
      console.error("Error registrando imagen local:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "No fue posible registrar la imagen."
      );
    } finally {
      setRegisteringImage(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[1.75rem] border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] shadow-2xl">
        <div className="sticky top-0 z-20 border-b border-[var(--theme-border)] bg-[var(--theme-bg-elevated)]/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-5 sm:px-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                Contenido del proyecto
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[var(--theme-text-primary)]">
                {project.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--theme-border)] text-[var(--theme-text-secondary)] transition hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="flex gap-1 px-6 sm:px-8">
            <ContentTab
              active={activeTab === "technologies"}
              onClick={() => {
                setActiveTab("technologies");
                setError("");
                setSuccess("");
              }}
            >
              Tecnologías ({selectedTechnologyIds.size})
            </ContentTab>

            <ContentTab
              active={activeTab === "images"}
              onClick={() => {
                setActiveTab("images");
                setError("");
                setSuccess("");
              }}
            >
              Imágenes{images.length > 0 ? ` (${images.length})` : ""}
            </ContentTab>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "technologies" ? (
            <div>
              <div className="flex flex-col gap-4 border-b border-[var(--theme-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-muted)]">
                    Stack del proyecto
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--theme-text-secondary)]">
                    Selecciona las tecnologías asociadas. Solo las tecnologías activas
                    aparecerán posteriormente en el sitio público.
                  </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <SearchIcon />
                  <input
                    value={technologySearch}
                    onChange={(event) => setTechnologySearch(event.target.value)}
                    placeholder="Buscar tecnología..."
                    className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] py-3 pl-11 pr-4 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
                  />
                </div>
              </div>

              {loadingTechnologies ? (
                <div className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-xl bg-[var(--theme-bg-secondary)]" />
                  ))}
                </div>
              ) : groupedTechnologies.length === 0 ? (
                <div className="py-16 text-center text-sm text-[var(--theme-text-muted)]">
                  No encontramos tecnologías.
                </div>
              ) : (
                <div className="space-y-8 py-8">
                  {groupedTechnologies.map(([category, items]) => (
                    <div key={category}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-subtle)]">
                        {formatTechnologyCategory(category)}
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((technology) => {
                          const selected = selectedTechnologyIds.has(technology.id);
                          const disabled = !technology.is_active && !selected;

                          return (
                            <button
                              key={technology.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleTechnology(technology)}
                              className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                                selected
                                  ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-bg-page)]"
                                  : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)]"
                              } ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {technology.name}
                                </p>
                                <p className={`mt-1 text-[10px] ${selected ? "text-[var(--theme-text-secondary)]" : "text-[var(--theme-text-subtle)]"}`}>
                                  {technology.is_active ? "Activa" : "Inactiva"}
                                </p>
                              </div>

                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs ${
                                selected ? "border-[var(--theme-bg-page)] bg-[var(--theme-bg-page)]" : "border-[var(--theme-border)]"
                              }`}>
                                {selected ? "✓" : "+"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[var(--theme-border)] bg-[var(--theme-bg-elevated)]/95 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[var(--theme-text-muted)]">
                  {selectedTechnologyIds.size} tecnología(s) seleccionada(s)
                </p>

                <button
                  type="button"
                  onClick={saveTechnologies}
                  disabled={savingTechnologies}
                  className="rounded-xl bg-[var(--theme-accent)] px-6 py-3 text-sm font-semibold text-[var(--theme-bg-page)] transition hover:bg-[var(--theme-accent-hover)] disabled:opacity-40"
                >
                  {savingTechnologies ? "Guardando..." : "Guardar tecnologías"}
                </button>
              </div>
            </div>
          ) : confidential ? (
            <div className="rounded-2xl border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--theme-warning)] text-[var(--theme-warning)]">
                ◆
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[var(--theme-text-primary)]">
                Imágenes bloqueadas por confidencialidad
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--theme-text-secondary)]">
                El backend no permite asociar imágenes reales a proyectos confidenciales.
                El proyecto seguirá utilizando el placeholder genérico en el sitio público.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-muted)]">
                    Registrar imagen local
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[var(--theme-text-subtle)]">
                    Las imágenes se sirven desde la carpeta public del frontend.
                    Primero copia el archivo al proyecto y después registra aquí su ruta.
                  </p>

                  <div className="mt-5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--theme-text-subtle)]">
                      Carpeta física esperada
                    </p>
                    <code className="mt-2 block break-all text-xs text-[var(--theme-accent)]">
                      public{normalizePublicFolder(imageFolder) || "/project"}
                    </code>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                      Carpeta pública del proyecto
                    </label>
                    <input
                      value={imageFolder}
                      onChange={(event) => {
                        setImageFolder(event.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="/project/alaluf"
                      className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-4 py-3 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
                    />
                    <p className="mt-2 text-[10px] leading-5 text-[var(--theme-text-subtle)]">
                      Para Alaluf usa <strong>/project/alaluf</strong>.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                      Nombre del archivo
                    </label>
                    <input
                      value={imageFileName}
                      onChange={(event) => {
                        const value = event.target.value;
                        setImageFileName(value);
                        setError("");
                        setSuccess("");

                        if (value && !imageAltText) {
                          const baseName = value
                            .replace(/\.[^.]+$/, "")
                            .replace(/[-_]+/g, " ");

                          setImageAltText(baseName);
                        }
                      }}
                      placeholder="cover.webp"
                      className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-4 py-3 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                      Ruta pública generada
                    </label>
                    <div className="min-h-[46px] rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-4 py-3">
                      <code className="break-all text-xs text-[var(--theme-accent)]">
                        {imageUrlPreview || "—"}
                      </code>
                    </div>
                  </div>

                  {imageUrlPreview && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)]">
                      <div className="aspect-[16/9] bg-black">
                        <img
                          src={imageUrlPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                      Texto alternativo
                    </label>
                    <input
                      value={imageAltText}
                      onChange={(event) => setImageAltText(event.target.value)}
                      placeholder="Describe brevemente la imagen"
                      className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-4 py-3 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
                    />
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] p-4">
                    <input
                      type="checkbox"
                      checked={makeCover}
                      onChange={(event) => setMakeCover(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[var(--theme-accent)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--theme-text-primary)]">
                        Usar como portada
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--theme-text-subtle)]">
                        Si ya existe una portada, será reemplazada automáticamente.
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={registerImage}
                    disabled={registeringImage || !imageFileName.trim()}
                    className="mt-5 w-full rounded-xl bg-[var(--theme-accent)] px-5 py-3.5 text-sm font-semibold text-[var(--theme-bg-page)] transition hover:bg-[var(--theme-accent-hover)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {registeringImage ? "Registrando..." : "Registrar imagen"}
                  </button>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-muted)]">
                        Galería
                      </p>
                      <p className="mt-2 text-xs text-[var(--theme-text-subtle)]">
                        Las rutas se guardan en PostgreSQL y los archivos permanecen en public del frontend.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadImages}
                      disabled={loadingImages}
                      className="rounded-lg border border-[var(--theme-border)] px-3 py-2 text-xs text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)] disabled:opacity-40"
                    >
                      Actualizar
                    </button>
                  </div>

                  {loadingImages ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="aspect-[16/11] animate-pulse rounded-2xl bg-[var(--theme-bg-secondary)]" />
                      ))}
                    </div>
                  ) : images.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-[var(--theme-border)] px-6 py-16 text-center">
                      <p className="text-sm text-[var(--theme-text-secondary)]">Sin imágenes registradas.</p>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {images.map((image) => (
                        <ProjectImageAdminCard
                          key={image.id}
                          image={image}
                          onChanged={async () => {
                            await loadImages();
                            await onChanged?.();
                          }}
                          onError={(message) => setError(message)}
                          onSuccess={(message) => setSuccess(message)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger)]">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl border border-[var(--theme-success)] bg-[var(--theme-success-soft)] px-4 py-3 text-sm text-[var(--theme-success)]">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectImageAdminCard({
  image,
  onChanged,
  onError,
  onSuccess,
}) {
  const [altText, setAltText] = useState(image.alt_text || "");
  const [displayOrder, setDisplayOrder] = useState(
    Number(image.display_order) || 0
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setAltText(image.alt_text || "");
    setDisplayOrder(Number(image.display_order) || 0);
  }, [image]);

  const saveMetadata = async () => {
    try {
      setSaving(true);
      onError("");
      onSuccess("");

      const data = await updateAdminProjectImage(image.id, {
        alt_text: altText.trim() || null,
        display_order: Number(displayOrder) || 0,
      });

      onSuccess(data?.message || "Imagen actualizada correctamente.");
      await onChanged();
    } catch (err) {
      console.error("Error actualizando imagen:", err);
      onError(
        err.response?.data?.message || "No fue posible actualizar la imagen."
      );
    } finally {
      setSaving(false);
    }
  };

  const setAsCover = async () => {
    try {
      setSaving(true);
      onError("");
      onSuccess("");

      const data = await updateAdminProjectImage(image.id, {
        is_cover: true,
      });

      onSuccess(data?.message || "Portada actualizada correctamente.");
      await onChanged();
    } catch (err) {
      console.error("Error definiendo portada:", err);
      onError(
        err.response?.data?.message || "No fue posible definir la portada."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async () => {
    try {
      setDeleting(true);
      onError("");
      onSuccess("");

      const data = await deleteAdminProjectImage(image.id);
      onSuccess(data?.message || "Imagen eliminada correctamente.");
      await onChanged();
    } catch (err) {
      console.error("Error eliminando imagen:", err);
      onError(
        err.response?.data?.message || "No fue posible eliminar la imagen."
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--theme-border)] bg-black">
        <img
          src={image.image_url}
          alt={image.alt_text || ""}
          className="h-full w-full object-cover"
        />

        {image.is_cover && (
          <span className="absolute left-3 top-3 rounded-full border border-[var(--theme-success)] bg-black/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--theme-success)] backdrop-blur">
            Portada
          </span>
        )}
      </div>

      <div className="p-4">
        <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--theme-text-subtle)]">
          Alt text
        </label>
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-3 py-2.5 text-xs text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
        />

        <div className="mt-3 flex items-end gap-3">
          <div className="w-24">
            <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--theme-text-subtle)]">
              Orden
            </label>
            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] px-3 py-2.5 text-xs text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
            />
          </div>

          <button
            type="button"
            onClick={saveMetadata}
            disabled={saving}
            className="flex-1 rounded-lg border border-[var(--theme-border)] px-3 py-2.5 text-xs font-medium text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)] disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={setAsCover}
            disabled={saving || image.is_cover}
            className="rounded-lg border border-[var(--theme-border)] px-3 py-2.5 text-xs font-medium text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)] disabled:opacity-35"
          >
            {image.is_cover ? "Es portada" : "Usar portada"}
          </button>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="rounded-lg border border-[var(--theme-danger)] px-3 py-2.5 text-xs font-medium text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)] disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>

        {confirmDelete && (
          <div className="mt-3 rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-3">
            <p className="text-xs leading-5 text-[var(--theme-danger)]">
              Se eliminará únicamente el registro de PostgreSQL. El archivo físico permanecerá en public del frontend.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-[var(--theme-border)] px-2 py-2 text-[11px] text-[var(--theme-text-secondary)]"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={removeImage}
                disabled={deleting}
                className="flex-1 rounded-lg bg-[var(--theme-danger)] px-2 py-2 text-[11px] font-semibold text-[var(--theme-text-primary)] disabled:opacity-40"
              >
                {deleting ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ContentTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
        active
          ? "border-[var(--theme-accent)] text-[var(--theme-text-primary)]"
          : "border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function formatTechnologyCategory(value) {
  const normalized = String(value || "OTRAS").trim().toUpperCase();

  const labels = {
    FRONTEND: "Frontend",
    BACKEND: "Backend",
    DATABASE: "Base de datos",
    DATABASES: "Base de datos",
    CLOUD: "Cloud",
    DEVOPS: "DevOps",
    TOOLS: "Herramientas",
    TOOL: "Herramientas",
    MOBILE: "Mobile",
    OTRAS: "Otras",
  };

  return labels[normalized] || value || "Otras";
}


function ProjectEditor({
  mode,
  project = null,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [form, setForm] = useState(
    project ? projectToForm(project) : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const editing = mode === "edit";
  const confidential =
    form.is_confidential || form.project_type === "CONFIDENTIAL";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !confirmDelete) onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, confirmDelete]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "project_type" && value === "CONFIDENTIAL") {
        next.is_confidential = true;
        next.client_visible = false;
      }

      if (name === "is_confidential" && checked) {
        next.client_visible = false;
      }

      return next;
    });

    setError("");
  };

  const saveProject = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("El título del proyecto es obligatorio.");
      return;
    }

    const slug = createSlug(form.slug || form.title);

    if (!slug) {
      setError("No fue posible generar un slug válido.");
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError(
        "La fecha de término no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = buildPayload({ ...form, slug });

      if (editing) {
        await updateAdminProject(project.id, payload);
      } else {
        await createAdminProject(payload);
      }

      await onSaved();
    } catch (err) {
      console.error("Error guardando proyecto:", err);
      setError(
        err.response?.data?.message ||
          "No fue posible guardar el proyecto."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async () => {
    try {
      setDeleting(true);
      setError("");
      await deleteAdminProject(project.id);
      await onDeleted();
    } catch (err) {
      console.error("Error eliminando proyecto:", err);
      setConfirmDelete(false);
      setError(
        err.response?.data?.message ||
          "No fue posible eliminar el proyecto."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirmDelete) onClose();
      }}
    >
      <div className="relative max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[1.75rem] border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-bg-elevated)]/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
              {editing ? "Administración" : "Nuevo contenido"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--theme-text-primary)]">
              {editing ? "Editar proyecto" : "Crear proyecto"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-strong)] hover:text-[var(--theme-text-primary)]"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={saveProject}
          className="grid lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="border-b border-[var(--theme-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <SectionTitle>Información principal</SectionTitle>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Título"
                name="title"
                value={form.title}
                onChange={handleChange}
                onBlur={() => {
                  if (!form.slug.trim()) {
                    setForm((current) => ({
                      ...current,
                      slug: createSlug(current.title),
                    }));
                  }
                }}
              />
              <Field
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="nombre-del-proyecto"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Descripción corta"
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                placeholder="Resumen para las tarjetas públicas."
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                Descripción completa
              </label>
              <textarea
                name="description"
                rows="8"
                value={form.description}
                onChange={handleChange}
                placeholder="Problema, solución, alcance y características."
                className="w-full resize-none rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3.5 text-sm leading-7 text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
              />
            </div>

            <SectionTitle>Clasificación</SectionTitle>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                  Tipo
                </label>
                <select
                  name="project_type"
                  value={form.project_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3.5 text-sm text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Cliente"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                placeholder={
                  confidential ? "Solo para administración" : "Cliente"
                }
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Toggle
                name="is_confidential"
                checked={form.is_confidential}
                onChange={handleChange}
                title="Proyecto confidencial"
                text="Evita exponer información identificable públicamente."
              />
              <Toggle
                name="client_visible"
                checked={form.client_visible}
                onChange={handleChange}
                disabled={confidential}
                title="Mostrar cliente"
                text={
                  confidential
                    ? "Bloqueado por confidencialidad."
                    : "Permite mostrar el cliente públicamente."
                }
              />
            </div>

            {confidential && (
              <div className="mt-4 rounded-xl border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] px-4 py-3 text-xs leading-6 text-[var(--theme-warning)]">
                En proyectos confidenciales el cliente se fuerza a no visible.
                Evita también publicar capturas, código o información que permita
                identificar al cliente.
              </div>
            )}

            <SectionTitle>Fechas</SectionTitle>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DateField
                label="Inicio"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
              <DateField
                label="Término"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
              />
            </div>

            <SectionTitle>Enlaces</SectionTitle>

            <div className="mt-4 space-y-4">
              <Field
                label="Demo / proyecto"
                name="demo_url"
                value={form.demo_url}
                onChange={handleChange}
                placeholder="https://..."
              />
              <Field
                label="GitHub"
                name="github_url"
                value={form.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
              <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] p-4">
                <p className="text-xs font-medium text-[var(--theme-text-secondary)]">
                  Imagen de portada
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--theme-text-subtle)]">
                  {editing
                    ? "La portada se administra desde Contenido → Imágenes registrando una ruta de public del frontend."
                    : "Primero crea el proyecto. Luego agrega la imagen a public/project/... y regístrala desde Contenido → Imágenes."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <SectionTitle>Publicación</SectionTitle>

            <div className="mt-4 space-y-3">
              <Toggle
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
                title="Publicado"
                text="Permite mostrar el proyecto en el sitio público."
              />
              <Toggle
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                title="Destacado"
                text="Le da prioridad en la sección de proyectos."
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
                Orden
              </label>
              <input
                type="number"
                min="0"
                name="display_order"
                value={form.display_order}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3.5 text-sm text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
              />
            </div>

            <div className="mt-8 border-t border-[var(--theme-border)] pt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-muted)]">
                Vista previa pública
              </p>
              <Preview form={form} />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-[var(--theme-accent)] px-5 py-3.5 text-sm font-semibold text-[var(--theme-bg-page)] transition hover:bg-[var(--theme-accent-hover)] disabled:opacity-40"
            >
              {saving
                ? "Guardando..."
                : editing
                ? "Guardar cambios"
                : "Crear proyecto"}
            </button>

            {editing && (
              <div className="mt-8 border-t border-[var(--theme-border)] pt-8">
                <p className="text-xs font-medium text-[var(--theme-text-secondary)]">
                  Eliminar proyecto
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--theme-text-subtle)]">
                  Esta acción elimina permanentemente el registro.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-4 rounded-xl border border-[var(--theme-danger)] px-4 py-2.5 text-xs font-semibold text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]"
                >
                  Eliminar proyecto
                </button>
              </div>
            )}
          </div>
        </form>

        {confirmDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] text-[var(--theme-danger)]">
                !
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[var(--theme-text-primary)]">
                ¿Eliminar proyecto?
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--theme-text-secondary)]">
                Se eliminará permanentemente{" "}
                <strong className="text-[var(--theme-text-primary)]">{project.title}</strong>.
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={removeProject}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-[var(--theme-danger)] px-4 py-3 text-sm font-semibold text-[var(--theme-text-primary)] hover:opacity-90 disabled:opacity-40"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({ form }) {
  const confidential =
    form.is_confidential || form.project_type === "CONFIDENTIAL";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)]">
      <div className="aspect-[16/8] overflow-hidden border-b border-[var(--theme-border)]">
        {!confidential && form.cover_image_url ? (
          <img
            src={form.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ProjectPlaceholder confidential={confidential} />
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <PublicationBadge published={form.is_published} />
          {form.is_featured && <Badge>Destacado</Badge>}
          {confidential && <ConfidentialBadge />}
        </div>

        <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-[var(--theme-text-subtle)]">
          {typeLabel(form.project_type)}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--theme-text-primary)]">
          {form.title || "Nombre del proyecto"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--theme-text-muted)]">
          {form.short_description ||
            "La descripción corta aparecerá aquí."}
        </p>

        {!confidential && form.client_visible && form.client_name && (
          <p className="mt-4 border-t border-[var(--theme-border)] pt-4 text-xs text-[var(--theme-text-subtle)]">
            Cliente: {form.client_name}
          </p>
        )}

        {confidential && (
          <p className="mt-4 border-t border-[var(--theme-border)] pt-4 text-xs leading-5 text-[var(--theme-text-subtle)]">
            Proyecto presentado de forma genérica por confidencialidad.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)] p-5">
      <p className="text-xs text-[var(--theme-text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-primary)]">{value}</p>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--theme-text-subtle)]">
        {label}
      </p>
      <p className="mt-1.5 text-xs text-[var(--theme-text-secondary)]">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3.5 text-sm text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-accent)]/25"
      />
    </div>
  );
}

function DateField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[var(--theme-text-secondary)]">
        {label}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] px-4 py-3.5 text-sm text-[var(--theme-text-primary)] outline-none focus:border-[var(--theme-accent)]/25"
      />
    </div>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  title,
  text,
  disabled = false,
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] p-4 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 accent-[var(--theme-accent)]"
      />
      <div>
        <p className="text-sm font-medium text-[var(--theme-text-primary)]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--theme-text-muted)]">{text}</p>
      </div>
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="mt-8 first:mt-0 text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--theme-text-muted)]">
      {children}
    </p>
  );
}

function PublicationBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] ${
        published
          ? "border-[var(--theme-success)] bg-[var(--theme-success-soft)] text-[var(--theme-success)]"
          : "border-[var(--theme-border)] bg-black/40 text-[var(--theme-text-secondary)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-[var(--theme-success)]" : "bg-[var(--theme-text-muted)]"
        }`}
      />
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

function ConfidentialBadge() {
  return (
    <span className="rounded-full border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-[var(--theme-warning)]">
      Confidencial
    </span>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-[var(--theme-border)] bg-black/50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-[var(--theme-text-primary)]">
      {children}
    </span>
  );
}

function ProjectPlaceholder({ confidential }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--theme-bg-secondary)]">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-subtle)]">
          {confidential ? "◆" : "◇"}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[var(--theme-text-subtle)]">
          {confidential ? "Proyecto confidencial" : "Sin portada"}
        </p>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-subtle)]"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ProjectSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-card)]"
        >
          <div className="aspect-[16/7] animate-pulse bg-[var(--theme-bg-secondary)]" />
          <div className="animate-pulse p-6">
            <div className="h-3 w-24 rounded bg-[var(--theme-border)]" />
            <div className="mt-4 h-5 w-56 rounded bg-[var(--theme-border)]" />
            <div className="mt-4 h-3 w-full rounded bg-[var(--theme-bg-secondary)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildPayload(form) {
  const confidential =
    form.is_confidential || form.project_type === "CONFIDENTIAL";

  return {
    title: form.title.trim(),
    slug: createSlug(form.slug || form.title),
    short_description: nullable(form.short_description),
    description: nullable(form.description),
    project_type: form.project_type,
    client_name: nullable(form.client_name),
    is_confidential: confidential,
    client_visible: confidential ? false : Boolean(form.client_visible),
    cover_image_url: nullable(form.cover_image_url),
    demo_url: nullable(form.demo_url),
    github_url: nullable(form.github_url),
    start_date: nullable(form.start_date),
    end_date: nullable(form.end_date),
    is_featured: Boolean(form.is_featured),
    is_published: Boolean(form.is_published),
    display_order: Number(form.display_order) || 0,
  };
}

function projectToForm(project) {
  return {
    title: project.title || "",
    slug: project.slug || "",
    short_description: project.short_description || "",
    description: project.description || "",
    project_type: project.project_type || "PERSONAL",
    client_name: project.client_name || "",
    is_confidential: Boolean(project.is_confidential),
    client_visible: project.client_visible !== false,
    cover_image_url: project.cover_image_url || "",
    demo_url: project.demo_url || "",
    github_url: project.github_url || "",
    start_date: dateValue(project.start_date),
    end_date: dateValue(project.end_date),
    is_featured: Boolean(project.is_featured),
    is_published: Boolean(project.is_published),
    display_order: Number(project.display_order) || 0,
  };
}


function getDefaultProjectImageFolder(project) {
  const clientSlug = createSlug(project?.client_name || "");
  const projectSlug = createSlug(
    project?.slug ||
      project?.title ||
      "proyecto"
  );

  return `/project/${clientSlug || projectSlug}`;
}

function normalizePublicFolder(value = "") {
  let folder = String(value)
    .trim()
    .replace(/\\/g, "/");

  folder = folder.replace(/^public\/?/i, "/");

  if (!folder) {
    return "";
  }

  if (!folder.startsWith("/")) {
    folder = `/${folder}`;
  }

  return folder
    .replace(/\/+/g, "/")
    .replace(/\/+$/, "");
}

function buildPublicProjectImageUrl(folder, fileName) {
  const normalizedFolder =
    normalizePublicFolder(folder);

  const normalizedFileName = String(
    fileName || ""
  )
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop();

  if (
    !normalizedFolder ||
    !normalizedFileName
  ) {
    return "";
  }

  return `${normalizedFolder}/${normalizedFileName}`;
}

function checkPublicImageExists(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const image = new Image();

    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = `${url}?check=${Date.now()}`;
  });
}

function createSlug(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullable(value) {
  if (value === undefined || value === null) return null;
  const result = String(value).trim();
  return result || null;
}

function dateValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDate(value) {
  const date = dateValue(value);
  if (!date) return "—";

  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function typeLabel(value) {
  return PROJECT_TYPES.find((item) => item.value === value)?.label || value;
}

export default ProjectsAdminPage;