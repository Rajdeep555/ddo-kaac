import express from "express";

import {
    createUser,
    getUsers,
    updateUser,
    deactivateUser,
} from "../controllers/userController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate, requireRole("ADMIN"));

router.post("/", createUser);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deactivateUser);

export default router;