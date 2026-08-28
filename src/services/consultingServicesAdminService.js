import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL CONSULTING SERVICES
============================================ */

export const getAdminConsultingServices = async () => {
  const response = await api.get(
    "/consulting-services/admin"
  );

  return response.data;
};

/* ============================================
   ADMIN - GET CONSULTING SERVICE BY ID
============================================ */

export const getAdminConsultingServiceById = async (
  id
) => {
  const response = await api.get(
    `/consulting-services/admin/${id}`
  );

  return response.data;
};

/* ============================================
   ADMIN - CREATE
============================================ */

export const createAdminConsultingService = async (
  payload
) => {
  const response = await api.post(
    "/consulting-services",
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE
============================================ */

export const updateAdminConsultingService = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/consulting-services/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - DELETE
============================================ */

export const deleteAdminConsultingService = async (
  id
) => {
  const response = await api.delete(
    `/consulting-services/${id}`
  );

  return response.data;
};
