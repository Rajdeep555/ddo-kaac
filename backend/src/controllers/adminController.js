import prisma from "../config/prisma.js";

export const getSubmissions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            ddoId,
            treasuryCode,
            from,
            to,
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const where = {};

        // -----------------------------
        // DDO FILTER
        // -----------------------------

        if (ddoId) {
            const numericDdoId = Number(ddoId);

            if (!Number.isInteger(numericDdoId)) {
                return res.status(400).json({
                    message: "Invalid DDO ID",
                });
            }

            where.ddoId = numericDdoId;
        }

        // -----------------------------
        // TREASURY FILTER
        // -----------------------------

        if (treasuryCode) {
            where.treasuryCode = {
                contains: treasuryCode,
                mode: "insensitive",
            };
        }

        // -----------------------------
        // SEARCH
        // -----------------------------

        if (search) {
            where.OR = [
                {
                    receiptNo: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    challanNo: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    voucherNo: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    payeeNameAddress: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    collectorName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    natureOfTax: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    headOfAccount: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // -----------------------------
        // DATE FILTER
        // -----------------------------

        if (from || to) {
            where.date = {};

            if (from) {
                where.date.gte = new Date(
                    `${from}T00:00:00.000Z`
                );
            }

            if (to) {
                where.date.lte = new Date(
                    `${to}T23:59:59.999Z`
                );
            }
        }

        // -----------------------------
        // GET DATA
        // -----------------------------

        const [submissions, total] = await Promise.all([
            prisma.taxSubmission.findMany({
                where,

                skip,
                take: limitNumber,

                orderBy: {
                    createdAt: "desc",
                },

                include: {
                    ddo: {
                        select: {
                            id: true,
                            ddoCode: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

                    cashier: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            prisma.taxSubmission.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(
            total / limitNumber
        );

        return res.status(200).json({
            message: "Submissions fetched successfully",

            data: submissions,

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
        console.error(
            "Get submissions error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch submissions",
        });
    }
};