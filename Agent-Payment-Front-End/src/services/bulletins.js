import api from "./api";

export const calculerBulletin = (data) => api.post("/bulletins/calculer", data);
export const getBulletins = (params) => api.get("/bulletins", { params });
export const getBulletin = (id) => api.get(`/bulletins/${id}`);
export const updateBulletin = (id, data) => api.put(`/bulletins/${id}`, data);
export const marquerPaye = (id, mode_paiement) => 
  api.post(`/bulletins/${id}/payer?mode_paiement=${mode_paiement}`);
export const exportPDF = (id) => 
  api.get(`/bulletins/${id}/pdf`, { responseType: "blob" });
export const deleteBulletin = (id) => api.delete(`/bulletins/${id}`);