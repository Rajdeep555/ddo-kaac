import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required",
            });
        }

        if (!["ADMIN", "CASHIER"].includes(role)) {
            return res.status(400).json({
                message: "Invalid user role",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "A user with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(201).json({
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            message: "Failed to create user",
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            isActive,
        } = req.query;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const where = {};

        if (search?.trim()) {
            const value = search.trim();

            where.OR = [
                {
                    name: {
                        contains: value,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: value,
                        mode: "insensitive",
                    },
                },
            ];
        }

        if (role === "ADMIN" || role === "CASHIER") {
            where.role = role;
        }

        if (isActive === "true") {
            where.isActive = true;
        }

        if (isActive === "false") {
            where.isActive = false;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limitNumber,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),

            prisma.user.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limitNumber);

        return res.status(200).json({
            message: "Users fetched successfully",
            data: users,
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
        console.error("Get users error:", error);

        return res.status(500).json({
            message: "Failed to fetch users",
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        const { name, email, role, password } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({
                message: "Name, email and role are required",
            });
        }

        if (!["ADMIN", "CASHIER"].includes(role)) {
            return res.status(400).json({
                message: "Invalid user role",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const emailOwner = await prisma.user.findFirst({
            where: {
                email: normalizedEmail,
                NOT: {
                    id: userId,
                },
            },
        });

        if (emailOwner) {
            return res.status(409).json({
                message: "Another user already uses this email",
            });
        }

        const data = {
            name: name.trim(),
            email: normalizedEmail,
            role,
        };

        if (password?.trim()) {
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters",
                });
            }

            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        console.error("Update user error:", error);

        return res.status(500).json({
            message: "Failed to update user",
        });
    }
};

export const deactivateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        if (userId === req.user.id) {
            return res.status(400).json({
                message: "You cannot deactivate your own account",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isActive: false,
            },
        });

        return res.status(200).json({
            message: "User deactivated successfully",
        });
    } catch (error) {
        console.error("Deactivate user error:", error);

        return res.status(500).json({
            message: "Failed to deactivate user",
        });
    }
};