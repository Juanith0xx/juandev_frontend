import api from "../api/axios";

/* ============================================
   TESTIMONIOS PÚBLICOS
============================================ */

export const getPublicTestimonials = async () => {
  const response = await api.get("/testimonials");

  return response.data;
};