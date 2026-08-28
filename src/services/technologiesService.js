import api from "../api/axios";

export const getPublicTechnologies = async () => {
  const response = await api.get("/technologies");

  return response.data;
};