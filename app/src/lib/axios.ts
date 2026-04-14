import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const authStorageStr = localStorage.getItem("auth-storage");
            if (authStorageStr) {
                try {
                    const parsed = JSON.parse(authStorageStr);
                    const token = parsed?.state?.token;

                    if (token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.error("Error parsing auth-storage", e);
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;