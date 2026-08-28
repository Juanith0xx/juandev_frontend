import api from "../api/axios";

/* ============================================
   SERVICIOS PÚBLICOS
============================================ */

export const getPublicServices = async () => {
  const response = await api.get("/services");

  return response.data;
};