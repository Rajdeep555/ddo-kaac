import express from "express";

import {
    createSubmission,
} from "../controllers/submissionController.js";

import {
    getCashierDashboard,
} from "../controllers/cashierDashboardController.js";

import {
    getActiveDdos,
} from "../controllers/ddoController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    getCashierSubmissions,
} from "../controllers/cashierController.js";

const router = express.Router();

router.use(authenticate);

// Cashier dashboard
router.get(
    "/dashboard",
    requireRole("CASHIER"),
    getCashierDashboard
);

// Active DDOs for cashier
router.get(
    "/ddos",
    requireRole("CASHIER"),
    getActiveDdos
);

// Create tax submission
router.post(
    "/submissions",
    requireRole("CASHIER"),
    createSubmission
);

router.get(
    "/submissions",
    requireRole("CASHIER"),
    getCashierSubmissions
);

export default router;