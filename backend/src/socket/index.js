import "dotenv/config";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const JWT_SECRET = process.env.JWT_SECRET;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
        },
    });

    // ----------------------------------------
    // SOCKET AUTHENTICATION
    // ----------------------------------------

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(
                    new Error("Authentication token required")
                );
            }

            if (!JWT_SECRET) {
                return next(
                    new Error("JWT_SECRET is not configured")
                );
            }

            const decoded = jwt.verify(
                token,
                JWT_SECRET
            );

            socket.user = decoded;

            next();
        } catch (error) {
            console.error(
                "Socket authentication failed:",
                error.message
            );

            next(new Error("Invalid authentication token"));
        }
    });

    // ----------------------------------------
    // CONNECTION
    // ----------------------------------------

    io.on("connection", (socket) => {
        console.log(
            "Socket connected:",
            socket.id,
            "User:",
            socket.user?.id,
            "Role:",
            socket.user?.role
        );

        // ----------------------------------------
        // ADMIN ROOM
        // ----------------------------------------

        if (socket.user?.role === "ADMIN") {
            socket.join("admin-room");

            console.log(
                `Admin joined admin-room: ${socket.id}`
            );
        }

        // ----------------------------------------
        // DISCONNECT
        // ----------------------------------------

        socket.on("disconnect", (reason) => {
            console.log(
                `Socket disconnected: ${socket.id}`,
                reason
            );
        });
    });

    return io;
};

// ----------------------------------------
// GET SOCKET INSTANCE
// ----------------------------------------

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};