import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL EXPERIENCES
============================================ */

export const getAdminExperiences = async () => {
  const response = await api.get(
    "/experiences/admin"
  );

  return response.data;
};

/* ============================================
   ADMIN - GET EXPERIENCE BY ID
============================================ */

export const getAdminExperienceById = async (
  id
) => {
  const response = await api.get(
    `/experiences/admin/${id}`
  );

  return response.data;
};

/* ============================================
   ADMIN - CREATE EXPERIENCE
============================================ */

export const createAdminExperience = async (
  payload
) => {
  const response = await api.post(
    "/experiences",
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE EXPERIENCE
============================================ */

export const updateAdminExperience = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/experiences/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - DELETE EXPERIENCE
============================================ */

export const deleteAdminExperience = async (
  id
) => {
  const response = await api.delete(
    `/experiences/${id}`
  );

  return response.data;
};
