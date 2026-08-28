import api from "../api/axios";

/* ============================================
   HELPERS
============================================ */

const extractArray = (
  payload,
  keys = []
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const request = async (
  url,
  keys
) => {
  try {
    const response =
      await api.get(url);

    return {
      ok: true,
      data: extractArray(
        response.data,
        keys
      ),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error:
        error.response?.data
          ?.message ||
        error.message ||
        "Error de carga",
    };
  }
};

/* ============================================
   DASHBOARD
============================================ */

export const getAdminDashboard =
  async () => {
    const [
      projects,
      bookings,
      leads,
      testimonials,
      services,
      consultingServices,
      experiences,
      certifications,
    ] = await Promise.all([
      request(
        "/projects/admin",
        ["projects"]
      ),

      request(
        "/bookings/admin",
        ["bookings"]
      ),

      request(
        "/leads/admin",
        ["leads"]
      ),

      request(
        "/testimonials/admin",
        ["testimonials"]
      ),

      request(
        "/services/admin",
        ["services"]
      ),

      request(
        "/consulting-services/admin",
        [
          "consulting_services",
          "consultingServices",
        ]
      ),

      request(
        "/experiences/admin",
        ["experiences"]
      ),

      request(
        "/certifications/admin",
        ["certifications"]
      ),
    ]);

    const sources = {
      projects,
      bookings,
      leads,
      testimonials,
      services,
      consultingServices,
      experiences,
      certifications,
    };

    const failedSources =
      Object.entries(sources)
        .filter(
          ([, result]) =>
            !result.ok
        )
        .map(
          ([name, result]) => ({
            name,
            error: result.error,
          })
        );

    return {
      projects: projects.data,
      bookings: bookings.data,
      leads: leads.data,
      testimonials:
        testimonials.data,
      services: services.data,
      consultingServices:
        consultingServices.data,
      experiences:
        experiences.data,
      certifications:
        certifications.data,

      failedSources,
    };
  };
