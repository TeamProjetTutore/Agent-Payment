import api from "./api";

export const getPayments = () => api.get("/payments");
export const createPayment = (data) => api.post("/payments", data);
