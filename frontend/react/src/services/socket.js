import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
const SOCKET_URL = "http://44.193.50.222:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
});

export const connectSocket = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Socket connection skipped: no token");
        return;
    }

    socket.auth = {
        token,
    };

    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};