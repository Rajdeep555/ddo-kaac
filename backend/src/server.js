import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./socket/index.js";

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import cashierRoutes from "./routes/cashierRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ddoRoutes from "./routes/ddoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const server = http.createServer(app);

initializeSocket(server);

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Tax Management API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/ddos", ddoRoutes);
app.use("/api/admin/users", userRoutes);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});