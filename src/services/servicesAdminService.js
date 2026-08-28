import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL SERVICES
============================================ */

export const getAdminServices = async () => {
  const response = await api.get(
    "/services/admin"
  );

  return response.data;
};

/* ============================================
   ADMIN - GET SERVICE BY ID
============================================ */

export const getAdminServiceById = async (
  id
) => {
  const response = await api.get(
    `/services/admin/${id}`
  );

  return response.data;
};

/* ============================================
   ADMIN - CREATE SERVICE
============================================ */

export const createAdminService = async (
  payload
) => {
  const response = await api.post(
    "/services",
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE SERVICE
============================================ */

export const updateAdminService = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/services/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - DELETE SERVICE
============================================ */

export const deleteAdminService = async (
  id
) => {
  const response = await api.delete(
    `/services/${id}`
  );

  return response.data;
};
