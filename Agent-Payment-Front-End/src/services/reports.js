import api from "./api";

export const getStats = () => api.get("/reports/dashboard/stats");
export const exportPaymentsPDF = () => 
  api.get("/reports/payments/pdf", { responseType: "blob" });
