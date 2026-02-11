import API from "./api";

export const getDebts = () => API.get("/debts/");
export const createDebt = (data) => API.post("/debts/", data);
export const deleteDebt = (id) => API.delete(`/debts/${id}`);
