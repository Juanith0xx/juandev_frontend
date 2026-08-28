import api from "../api/axios";

/* ============================================
   AVAILABILITY RULES
============================================ */

export const getAdminAvailabilityRules = async () => {
  const response = await api.get(
    "/availability-rules/admin"
  );

  return response.data;
};

export const createAvailabilityRule = async (
  payload
) => {
  const response = await api.post(
    "/availability-rules",
    payload
  );

  return response.data;
};

export const updateAvailabilityRule = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/availability-rules/${id}`,
    payload
  );

  return response.data;
};

export const deleteAvailabilityRule = async (
  id
) => {
  const response = await api.delete(
    `/availability-rules/${id}`
  );

  return response.data;
};

/* ============================================
   AVAILABILITY EXCEPTIONS
============================================ */

export const getAdminAvailabilityExceptions =
  async () => {
    const response = await api.get(
      "/availability-exceptions/admin"
    );

    return response.data;
  };

export const createAvailabilityException =
  async (payload) => {
    const response = await api.post(
      "/availability-exceptions",
      payload
    );

    return response.data;
  };

export const updateAvailabilityException =
  async (id, payload) => {
    const response = await api.patch(
      `/availability-exceptions/${id}`,
      payload
    );

    return response.data;
  };

export const deleteAvailabilityException =
  async (id) => {
    const response = await api.delete(
      `/availability-exceptions/${id}`
    );

    return response.data;
  };
