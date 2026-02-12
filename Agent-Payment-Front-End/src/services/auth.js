import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });
  return response.data;
};

export const setupAdmin = async () => {
  const response = await api.post("/setup-admin");
  return response.data;
};