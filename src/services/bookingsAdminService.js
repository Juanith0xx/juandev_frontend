import api from "../api/axios";

/* ============================================
   ADMIN - GET ALL BOOKINGS
============================================ */

export const getAdminBookings = async (params = {}) => {
  const response = await api.get(
    "/bookings/admin",
    {
      params,
    }
  );

  return response.data;
};

/* ============================================
   ADMIN - GET BOOKING BY ID
============================================ */

export const getAdminBookingById = async (id) => {
  const response = await api.get(
    `/bookings/admin/${id}`
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE NOTES
============================================ */

export const updateAdminBooking = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/bookings/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   ADMIN - UPDATE STATUS
============================================ */

export const updateAdminBookingStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/bookings/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};
