import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL CERTIFICATIONS
============================================ */

export const getAdminCertifications = async () => {
  const response = await api.get(
    "/certifications/admin"
  );

  return response.data;
};

/* ============================================
   ADMIN - CREATE CERTIFICATION
============================================ */

export const createAdminCertification = async (
  payload
) => {
  const response = await api.post(
    "/certifications",
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE CERTIFICATION
============================================ */

export const updateAdminCertification = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/certifications/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - DELETE CERTIFICATION
============================================ */

export const deleteAdminCertification = async (
  id
) => {
  const response = await api.delete(
    `/certifications/${id}`
  );

  return response.data;
};
