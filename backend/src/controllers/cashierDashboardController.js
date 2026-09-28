import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Cashier Dashboard
|--------------------------------------------------------------------------
| Returns dashboard statistics for the currently logged-in cashier only.
|
| req.user.id comes from authenticate middleware.
|--------------------------------------------------------------------------
*/

export const getCashierDashboard = async (req, res) => {
    try {
        const cashierId = req.user.id;

        /*
        |--------------------------------------------------------------------------
        | Today
        |--------------------------------------------------------------------------
        */

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfTomorrow = new Date();
        startOfTomorrow.setHours(24, 0, 0, 0);

        /*
        |--------------------------------------------------------------------------
        | Run all queries together
        |--------------------------------------------------------------------------
        */

        const [
            totalSubmissions,
            totalAmountResult,
            todaySubmissions,
            todayAmountResult,
            recentSubmissions,
        ] = await Promise.all([
            /*
            |--------------------------------------------------------------------------
            | Total submissions
            |--------------------------------------------------------------------------
            */

            prisma.taxSubmission.count({
                where: {
                    cashierId,
                },
            }),

            /*
            |--------------------------------------------------------------------------
            | Total amount
            |--------------------------------------------------------------------------
            */

            prisma.taxSubmission.aggregate({
                where: {
                    cashierId,
                },

                _sum: {
                    amount: true,
                },
            }),

            /*
            |--------------------------------------------------------------------------
            | Today's submissions
            |--------------------------------------------------------------------------
            */

            prisma.taxSubmission.count({
                where: {
                    cashierId,

                    date: {
                        gte: startOfToday,
                        lt: startOfTomorrow,
                    },
                },
            }),

            /*
            |--------------------------------------------------------------------------
            | Today's amount
            |--------------------------------------------------------------------------
            */

            prisma.taxSubmission.aggregate({
                where: {
                    cashierId,

                    date: {
                        gte: startOfToday,
                        lt: startOfTomorrow,
                    },
                },

                _sum: {
                    amount: true,
                },
            }),

            /*
            |--------------------------------------------------------------------------
            | Recent submissions
            |--------------------------------------------------------------------------
            */

            prisma.taxSubmission.findMany({
                where: {
                    cashierId,
                },

                orderBy: {
                    createdAt: "desc",
                },

                take: 10,

                include: {
                    ddo: {
                        select: {
                            id: true,
                            ddoCode: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            message:
                "Cashier dashboard data fetched successfully",

            data: {
                totalSubmissions,

                totalAmount:
                    totalAmountResult._sum.amount || 0,

                today: {
                    submissions: todaySubmissions,

                    amount:
                        todayAmountResult._sum.amount || 0,
                },

                recentSubmissions,
            },
        });
    } catch (error) {
        console.error(
            "Cashier dashboard error:",
            error,
        );

        return res.status(500).json({
            message:
                "Failed to fetch cashier dashboard data",
        });
    }
};