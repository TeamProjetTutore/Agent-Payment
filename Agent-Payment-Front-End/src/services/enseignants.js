import api from "./api";

export const getEnseignants = (params = {}) => {
  return api.get("/enseignants", { params });
};

export const getEnseignant = (id) => {
  return api.get(`/enseignants/${id}`);
};

export const createEnseignant = (data) => {
  return api.post("/enseignants", data);
};

export const updateEnseignant = (id, data) => {
  return api.put(`/enseignants/${id}`, data);
};

export const deleteEnseignant = (id) => {
  return api.delete(`/enseignants/${id}`);
};