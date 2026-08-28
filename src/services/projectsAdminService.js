import api from "../api/axios";

/* ============================================
   PROJECTS
============================================ */

export const getAdminProjects = async () => {
  const response = await api.get("/projects/admin");
  return response.data;
};

export const createAdminProject = async (payload) => {
  const response = await api.post("/projects", payload);
  return response.data;
};

export const updateAdminProject = async (id, payload) => {
  const response = await api.patch(`/projects/${id}`, payload);
  return response.data;
};

export const deleteAdminProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

/* ============================================
   PROJECT TECHNOLOGIES
============================================ */

export const getAdminTechnologies = async () => {
  const response = await api.get("/technologies/admin");
  return response.data;
};

export const updateAdminProjectTechnologies = async (
  projectId,
  technologyIds
) => {
  const response = await api.put(
    `/projects/${projectId}/technologies`,
    {
      technology_ids: technologyIds,
    }
  );

  return response.data;
};

/* ============================================
   PROJECT IMAGES
============================================ */

export const getAdminProjectImages = async (projectId) => {
  const response = await api.get(
    `/project-images/admin/project/${projectId}`
  );

  return response.data;
};

export const createAdminProjectImage = async (
  projectId,
  payload
) => {
  const response = await api.post(
    `/project-images/project/${projectId}`,
    payload
  );

  return response.data;
};

export const updateAdminProjectImage = async (
  imageId,
  payload
) => {
  const response = await api.patch(
    `/project-images/${imageId}`,
    payload
  );

  return response.data;
};

export const deleteAdminProjectImage = async (imageId) => {
  const response = await api.delete(
    `/project-images/${imageId}`
  );

  return response.data;
};

/* ============================================
   STORAGE
============================================ */

export const getAdminStorageStatus = async () => {
  const response = await api.get("/storage/status");
  return response.data;
};

const normalizeHeaderFilename = (filename = "image") => {
  return String(filename)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";
};

export const uploadAdminStorageAsset = async (
  file,
  folder = "projects"
) => {
  const body = await file.arrayBuffer();

  const response = await api.post(
    "/storage/upload",
    body,
    {
      headers: {
        "Content-Type": file.type,
        "X-File-Name": normalizeHeaderFilename(file.name),
        "X-Folder": folder,
      },
    }
  );

  return response.data;
};

export const deleteAdminStorageAsset = async (payload) => {
  const response = await api.delete(
    "/storage/object",
    {
      data: payload,
    }
  );

  return response.data;
};
