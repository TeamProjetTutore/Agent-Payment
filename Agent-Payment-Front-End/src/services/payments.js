import api from "./api.js";

export const getPayments = () => api.get("/payments/");

export const createPayment = (data) => {
  // Ensure data has all required fields
  const paymentData = {
    ...data,
    payment_date: data.payment_date || new Date().toISOString().split('T')[0]
  };
  return api.post("/payments/", paymentData);
};

export const updatePaymentStatus = (id, status) => api.patch(`/payments/${id}/status`, { status });