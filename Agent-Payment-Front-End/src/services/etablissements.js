import api from "./api";

export const getEtablissements = () => api.get("/etablissements");
export const createEtablissement = (data) => api.post("/etablissements", data);
export const getProvinces = () => api.get("/etablissements/provinces");
export const createProvince = (data) => api.post("/etablissements/provinces", data);