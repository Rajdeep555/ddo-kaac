import prisma from "./config/prisma.js";

async function testDatabase() {
    try {
        await prisma.$connect();

        console.log("Database connected successfully!");

        const users = await prisma.user.findMany();

        console.log("Users:", users);
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();