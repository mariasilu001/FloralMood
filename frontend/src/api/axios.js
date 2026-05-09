import axios from "axios";

// Я создаю отдельный инстанс, чтобы он работал строго по моим правилам
const api = axios.create({
    baseURL: "/api",
});

// Перехватчик запросов. Он сам достает токен и вставляет его куда надо.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export default api;
