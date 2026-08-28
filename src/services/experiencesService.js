import api from "../api/axios";

export const getPublicExperiences = async () => {
  const response = await api.get("/experiences");

  return response.data;
};