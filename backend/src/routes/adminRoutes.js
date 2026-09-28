import express from "express";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import { getSubmissions } from "../controllers/adminController.js";
import { getDashboard } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get(
    "/submissions",
    authenticate,
    requireRole("ADMIN"),
    getSubmissions
);

router.get(
    "/dashboard",
    authenticate,
    requireRole("ADMIN"),
    getDashboard
);

export default router;