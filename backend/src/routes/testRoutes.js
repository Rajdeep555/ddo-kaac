import express from "express";
import {
    authenticate,
} from "../middleware/authMiddleware.js";
import {
    requireRole,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/admin",
    authenticate,
    requireRole("ADMIN"),
    (req, res) => {
        res.json({
            message: "Welcome Admin",
            user: req.user,
        });
    }
);

router.get(
    "/cashier",
    authenticate,
    requireRole("CASHIER"),
    (req, res) => {
        res.json({
            message: "Welcome Cashier",
            user: req.user,
        });
    }
);

export default router;