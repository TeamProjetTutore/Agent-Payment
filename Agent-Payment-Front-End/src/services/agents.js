import api from "./api";

export const getAgents = () => api.get("/agents");
export const createAgent = (data) => api.post("/agents", data);
export const deleteAgent = (id) => api.delete(`/agents/${id}`);
