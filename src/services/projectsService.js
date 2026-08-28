import api from "../api/axios";

export const getPublicProjects = async () => {
  const response = await api.get("/projects");

  return response.data;
};

export const getPublicProjectBySlug = async (slug) => {
  const response = await api.get(`/projects/${slug}`);

  return response.data;
};