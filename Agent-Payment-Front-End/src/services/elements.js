import api from "./api";

export const getElements = (type) => api.get("/elements", { params: { type_filter: type } });
export const createElement = (data) => api.post("/elements", data);