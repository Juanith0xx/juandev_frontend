import api from "../api/axios";

/* ============================================
   PUBLIC - GET APPROVED TESTIMONIALS
============================================ */

export const getPublicTestimonials = async () => {
  const response = await api.get(
    "/testimonials"
  );

  return response.data;
};

/* ============================================
   PUBLIC - CREATE TESTIMONIAL
============================================ */

export const createPublicTestimonial = async (
  payload
) => {
  const response = await api.post(
    "/testimonials",
    payload
  );

  return response.data;
};
