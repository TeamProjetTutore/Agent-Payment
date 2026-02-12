import api from "./api.js";

export const getAgents = () => api.get("/agents/");
export const createAgent = (data) => api.post("/agents/", data);
export const deleteAgent = (id) => api.delete(`/agents/${id}`);
export const updateAgent = (id, data) => api.put(`/agents/${id}`, data);
