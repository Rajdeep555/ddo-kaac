import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "./config/prisma.js";

const seed = async () => {
    try {
        const adminPassword = await bcrypt.hash("admin123", 10);
        const cashierPassword = await bcrypt.hash("cashier123", 10);

        await prisma.user.upsert({
            where: {
                email: "admin@example.com",
            },

            update: {},

            create: {
                name: "Admin",
                email: "admin@example.com",
                password: adminPassword,
                role: "ADMIN",
            },
        });

        await prisma.user.upsert({
            where: {
                email: "cashier@example.com",
            },

            update: {},

            create: {
                name: "Cashier",
                email: "cashier@example.com",
                password: cashierPassword,
                role: "CASHIER",
            },
        });

        console.log("Users created successfully");
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

seed();