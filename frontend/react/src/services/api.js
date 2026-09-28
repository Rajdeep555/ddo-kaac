import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "http://44.193.50.222:5000/api",

    headers: {
        "Content-Type":
            "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Add JWT automatically
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(
                "token",
            );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(
            error,
        );
    },
);

export default api;