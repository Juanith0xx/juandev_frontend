import api from "../api/axios";

/* ============================================
   ENDPOINTS
============================================ */

const ENDPOINTS = {
  consultingServices: "/consulting-services",
  availability: "/availability/slots",

  // Confirmaremos este mount exacto al hacer
  // la primera prueba de creación.
  bookings: "/bookings",
};

/* ============================================
   CONSULTING SERVICES
============================================ */

export const getConsultingServices = async () => {
  const response = await api.get(
    ENDPOINTS.consultingServices
  );

  return response.data;
};

/* ============================================
   AVAILABILITY
============================================ */

export const getConsultingAvailability = async ({
  consultingServiceId,
  date,
  durationMinutes,
}) => {
  const response = await api.get(
    ENDPOINTS.availability,
    {
      params: {
        consulting_service_id:
          consultingServiceId,

        date,

        duration_minutes:
          durationMinutes,
      },
    }
  );

  return response.data;
};

/* ============================================
   CREATE BOOKING
============================================ */

export const createConsultingBooking = async (
  payload
) => {
  const response = await api.post(
    ENDPOINTS.bookings,
    payload
  );

  return response.data;
};