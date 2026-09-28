import prisma from "../config/prisma.js";

export const getCashierSubmissions = async (req, res) => {
    try {
        // IMPORTANT:
        // Never get cashierId from query parameters.
        // Always use the logged-in cashier.
        const cashierId = req.user.id;

        const {
            page = 1,
            limit = 10,
            search,
            ddoId,
            natureOfTax,
            headOfAccount,
            receiptNo,
            challanNo,
            voucherNo,
            treasuryCode,
            from,
            to,
            minAmount,
            maxAmount,
        } = req.query;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const where = {
            // 🔐 CRITICAL SECURITY FILTER
            cashierId,
        };

        // DDO
        if (ddoId) {
            const numericDdoId = Number(ddoId);

            if (Number.isInteger(numericDdoId)) {
                where.ddoId = numericDdoId;
            }
        }

        // Nature of tax
        if (natureOfTax?.trim()) {
            where.natureOfTax = {
                contains: natureOfTax.trim(),
                mode: "insensitive",
            };
        }

        // Head of account
        if (headOfAccount?.trim()) {
            where.headOfAccount = {
                contains: headOfAccount.trim(),
                mode: "insensitive",
            };
        }

        // Receipt number
        if (receiptNo?.trim()) {
            where.receiptNo = {
                contains: receiptNo.trim(),
                mode: "insensitive",
            };
        }

        // Challan number
        if (challanNo?.trim()) {
            where.challanNo = {
                contains: challanNo.trim(),
                mode: "insensitive",
            };
        }

        // Voucher number
        if (voucherNo?.trim()) {
            where.voucherNo = {
                contains: voucherNo.trim(),
                mode: "insensitive",
            };
        }

        // Treasury code
        if (treasuryCode?.trim()) {
            where.treasuryCode = {
                contains: treasuryCode.trim(),
                mode: "insensitive",
            };
        }

        // General search
        if (search?.trim()) {
            const searchValue = search.trim();

            where.OR = [
                {
                    receiptNo: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    challanNo: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    voucherNo: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    natureOfTax: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    headOfAccount: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    treasuryCode: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    treasuryName: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    payeeNameAddress: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
                {
                    collectorName: {
                        contains: searchValue,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Date range
        if (from || to) {
            where.date = {};

            if (from) {
                where.date.gte = new Date(`${from}T00:00:00`);
            }

            if (to) {
                const toDate = new Date(`${to}T00:00:00`);

                toDate.setDate(toDate.getDate() + 1);

                where.date.lt = toDate;
            }
        }

        // Amount range
        if (minAmount !== undefined && minAmount !== "") {
            const value = Number(minAmount);

            if (Number.isFinite(value)) {
                where.amount = {
                    ...(where.amount || {}),
                    gte: value,
                };
            }
        }

        if (maxAmount !== undefined && maxAmount !== "") {
            const value = Number(maxAmount);

            if (Number.isFinite(value)) {
                where.amount = {
                    ...(where.amount || {}),
                    lte: value,
                };
            }
        }

        const [submissions, total] = await Promise.all([
            prisma.taxSubmission.findMany({
                where,

                orderBy: {
                    createdAt: "desc",
                },

                skip,
                take: limitNumber,

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

            prisma.taxSubmission.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limitNumber);

        return res.status(200).json({
            message: "Cashier submissions fetched successfully",

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
        console.error("Get cashier submissions error:", error);

        return res.status(500).json({
            message: "Failed to fetch cashier submissions",
        });
    }
};