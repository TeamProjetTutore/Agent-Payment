import api from "./api";

export function login(email, password) {
    console.log("Sending:", { email, password });
    return api.post("/login", { email, password })
        .then(res => res.data)
        .catch(err => {
            console.error("Backend error:", err.response?.data || err.message);
            throw err;
        });
}
