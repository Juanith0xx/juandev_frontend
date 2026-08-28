import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL TESTIMONIALS
============================================ */

export const getAdminTestimonials = async (
  params = {}
) => {
  const response = await api.get(
    "/testimonials/admin",
    {
      params,
    }
  );

  return response.data;
};

/* ============================================
   ADMIN - GET TESTIMONIAL BY ID
============================================ */

export const getAdminTestimonialById = async (
  id
) => {
  const response = await api.get(
    `/testimonials/admin/${id}`
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE TESTIMONIAL
============================================ */

export const updateAdminTestimonial = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/testimonials/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE STATUS
============================================ */

export const updateAdminTestimonialStatus =
  async (
    id,
    status
  ) => {
    const response = await api.patch(
      `/testimonials/${id}/status`,
      {
        status,
      }
    );

    return response.data;
  };

/* ============================================
   ADMIN - DELETE
============================================ */

export const deleteAdminTestimonial = async (
  id
) => {
  const response = await api.delete(
    `/testimonials/${id}`
  );

  return response.data;
};
