import API from "./api.js";

// Use axios directly for blob response if needed, but api.js should handle it if configured
// Or use window.open for simple PDF triggers if they don't require complex headers
// However, since we use JWT, we need headers.

export const downloadAgentList = () => API.get(`/reports/agents/pdf?_t=${Date.now()}`, { responseType: 'blob' });
export const downloadDebtList = () => API.get(`/reports/debts/pdf?_t=${Date.now()}`, { responseType: 'blob' });

export const downloadPayslip = (params) => API.get("/reports/payslip/pdf", {
    params: { ...params, _t: Date.now() },
    responseType: 'blob'
});

export const getDashboardStats = (params) => API.get("/reports/dashboard", { params });
