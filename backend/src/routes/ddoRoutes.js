import express from "express";

import {
    createDdo,
    getDdos,
    updateDdo,
    deleteDdo,
} from "../controllers/ddoController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate, requireRole("ADMIN"));

router.post("/", createDdo);

router.get("/", getDdos);

router.put("/:id", updateDdo);

router.delete("/:id", deleteDdo);

export default router;