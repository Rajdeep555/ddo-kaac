import prisma from "../config/prisma.js";

// ============================================
// CREATE DDO
// ============================================

export const createDdo = async (req, res) => {
    try {
        const {
            ddoCode,
            name,
            email,
            phone,
        } = req.body;

        if (!ddoCode || !name || !email || !phone) {
            return res.status(400).json({
                message: "DDO code, name, email and phone are required",
            });
        }

        const cleanDdoCode = ddoCode.trim();
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        // Check duplicate DDO code
        const existingDdo = await prisma.ddo.findUnique({
            where: {
                ddoCode: cleanDdoCode,
            },
        });

        if (existingDdo) {
            return res.status(409).json({
                message: "DDO code already exists",
            });
        }

        const ddo = await prisma.ddo.create({
            data: {
                ddoCode: cleanDdoCode,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
            },
        });

        return res.status(201).json({
            message: "DDO created successfully",
            data: ddo,
        });
    } catch (error) {
        console.error("Create DDO error:", error);

        return res.status(500).json({
            message: "Failed to create DDO",
        });
    }
};

// ============================================
// GET DDOs
// ============================================

export const getDdos = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            isActive,
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);

        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const where = {};

        // Search
        if (search && search.trim()) {
            where.OR = [
                {
                    ddoCode: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    name: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    phone: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Active / inactive filter
        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const [ddos, total] = await Promise.all([
            prisma.ddo.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    name: "asc",
                },
            }),

            prisma.ddo.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(
            total / limitNumber
        );

        return res.status(200).json({
            message: "DDOs fetched successfully",
            data: ddos,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
            },
        });
    } catch (error) {
        console.error("Get DDOs error:", error);

        return res.status(500).json({
            message: "Failed to fetch DDOs",
        });
    }
};

// UPDATE DDO
export const updateDdo = async (req, res) => {
    try {
        const { id } = req.params;
        const { ddoCode, name, email, phone } = req.body;

        const numericId = Number(id);

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid DDO ID",
            });
        }

        if (!ddoCode || !name || !email || !phone) {
            return res.status(400).json({
                message: "DDO code, name, email and phone are required",
            });
        }

        const cleanDdoCode = ddoCode.trim();
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        const existingDdo = await prisma.ddo.findUnique({
            where: {
                id: numericId,
            },
        });

        if (!existingDdo) {
            return res.status(404).json({
                message: "DDO not found",
            });
        }

        const duplicateDdo = await prisma.ddo.findFirst({
            where: {
                ddoCode: cleanDdoCode,
                NOT: {
                    id: numericId,
                },
            },
        });

        if (duplicateDdo) {
            return res.status(409).json({
                message: "DDO code already exists",
            });
        }

        const ddo = await prisma.ddo.update({
            where: {
                id: numericId,
            },
            data: {
                ddoCode: cleanDdoCode,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
            },
        });

        return res.status(200).json({
            message: "DDO updated successfully",
            data: ddo,
        });
    } catch (error) {
        console.error("Update DDO error:", error);

        return res.status(500).json({
            message: "Failed to update DDO",
        });
    }
};


// DELETE / DEACTIVATE DDO
export const deleteDdo = async (req, res) => {
    try {
        const { id } = req.params;

        const numericId = Number(id);

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid DDO ID",
            });
        }

        const ddo = await prisma.ddo.findUnique({
            where: {
                id: numericId,
            },
        });

        if (!ddo) {
            return res.status(404).json({
                message: "DDO not found",
            });
        }

        // We deactivate instead of permanently deleting
        const updatedDdo = await prisma.ddo.update({
            where: {
                id: numericId,
            },
            data: {
                isActive: false,
            },
        });

        return res.status(200).json({
            message: "DDO deactivated successfully",
            data: updatedDdo,
        });
    } catch (error) {
        console.error("Delete DDO error:", error);

        return res.status(500).json({
            message: "Failed to delete DDO",
        });
    }
};

export const getActiveDdos = async (req, res) => {
    try {
        const ddos = await prisma.ddo.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                ddoCode: true,
                name: true,
            },
        });

        return res.status(200).json({
            message: "Active DDOs fetched successfully",
            data: ddos,
        });
    } catch (error) {
        console.error("Get active DDOs error:", error);

        return res.status(500).json({
            message: "Failed to fetch active DDOs",
        });
    }
};