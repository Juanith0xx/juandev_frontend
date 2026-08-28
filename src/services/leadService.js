import api from "../api/axios";

/* ============================================
   PUBLIC SERVICES
============================================ */

export const getLeadServices = async () => {
  const response = await api.get(
    "/services"
  );

  return response.data;
};

/* ============================================
   CREATE LEAD
============================================ */

export const createLead = async (
  payload
) => {
  const response = await api.post(
    "/leads",
    payload
  );

  return response.data;
};