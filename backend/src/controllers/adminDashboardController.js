import prisma from "../config/prisma.js";

export const getDashboard = async (req, res) => {
    try {
        const [
            totalSubmissions,
            amountResult,
            todaySubmissions,
            todayAmountResult,
        ] = await Promise.all([
            // Total submissions — regardless of status
            prisma.taxSubmission.count(),

            // Total amount — regardless of status
            prisma.taxSubmission.aggregate({
                _sum: {
                    amount: true,
                },
            }),

            // Today's submissions — regardless of status
            prisma.taxSubmission.count({
                where: {
                    date: {
                        gte: getStartOfToday(),
                        lt: getStartOfTomorrow(),
                    },
                },
            }),

            // Today's amount — regardless of status
            prisma.taxSubmission.aggregate({
                where: {
                    date: {
                        gte: getStartOfToday(),
                        lt: getStartOfTomorrow(),
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        return res.status(200).json({
            message: "Dashboard data fetched successfully",

            data: {
                totalSubmissions,
                totalAmount: amountResult._sum.amount || 0,

                today: {
                    submissions: todaySubmissions,
                    amount: todayAmountResult._sum.amount || 0,
                },
            },
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            message: "Failed to fetch dashboard data",
        });
    }
};

function getStartOfToday() {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
}

function getStartOfTomorrow() {
    const date = new Date();

    date.setHours(24, 0, 0, 0);

    return date;
}