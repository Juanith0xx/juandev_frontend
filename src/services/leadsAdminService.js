import api from "../api/axios";

/* ============================================
   GET ALL LEADS
============================================ */

export const getAdminLeads = async () => {
  const response = await api.get(
    "/leads/admin"
  );

  return response.data;
};

/* ============================================
   GET LEAD BY ID
============================================ */

export const getAdminLeadById = async (
  id
) => {
  const response = await api.get(
    `/leads/admin/${id}`
  );

  return response.data;
};

/* ============================================
   UPDATE STATUS
============================================ */

export const updateAdminLeadStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/leads/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};

/* ============================================
   UPDATE LEAD
============================================ */

export const updateAdminLead = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/leads/${id}`,
    payload
  );

  return response.data;
};

/* ============================================
   DELETE
============================================ */

export const deleteAdminLead = async (
  id
) => {
  const response = await api.delete(
    `/leads/${id}`
  );

  return response.data;
};