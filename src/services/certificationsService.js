import api from "../api/axios";

export const getPublicCertifications = async () => {
  const response = await api.get("/certifications");

  return response.data;
};