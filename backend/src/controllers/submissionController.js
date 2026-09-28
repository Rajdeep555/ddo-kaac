import prisma from "../config/prisma.js";
import { getIO } from "../socket/index.js";
import { SOCKET_EVENTS } from "../socket/events.js";

export const createSubmission = async (req, res) => {
    try {
        const {
            ddoId,
            date,
            natureOfTax,
            headOfAccount,
            receiptNo,
            amount,
            payeeNameAddress,
            collectorName,
            dateOfDeposit,
            treasuryName,
            treasuryCode,
            challanNo,
            voucherNo,
            dateOfVoucher,
        } = req.body;

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !ddoId ||
            !date ||
            !natureOfTax ||
            !headOfAccount ||
            !receiptNo ||
            amount === undefined ||
            amount === null ||
            !payeeNameAddress ||
            !collectorName ||
            !dateOfDeposit ||
            !treasuryName ||
            !treasuryCode ||
            !challanNo ||
            !voucherNo
        ) {
            return res.status(400).json({
                message:
                    "All required fields must be provided",
            });
        }

        // ----------------------------------------
        // DDO
        // ----------------------------------------

        const numericDdoId = Number(ddoId);

        if (!Number.isInteger(numericDdoId)) {
            return res.status(400).json({
                message: "Invalid DDO",
            });
        }

        const ddo = await prisma.ddo.findUnique({
            where: {
                id: numericDdoId,
            },
        });

        if (!ddo) {
            return res.status(404).json({
                message: "DDO not found",
            });
        }

        if (!ddo.isActive) {
            return res.status(400).json({
                message: "Selected DDO is inactive",
            });
        }

        // ----------------------------------------
        // AMOUNT
        // ----------------------------------------

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount < 0
        ) {
            return res.status(400).json({
                message: "Invalid amount",
            });
        }

        // ----------------------------------------
        // CREATE SUBMISSION
        // ----------------------------------------

        const submission =
            await prisma.taxSubmission.create({
                data: {
                    ddoId: numericDdoId,

                    date: new Date(date),

                    natureOfTax:
                        natureOfTax.trim(),

                    headOfAccount:
                        headOfAccount.trim(),

                    receiptNo:
                        receiptNo.trim(),

                    amount: numericAmount,

                    payeeNameAddress:
                        payeeNameAddress.trim(),

                    collectorName:
                        collectorName.trim(),

                    dateOfDeposit:
                        new Date(dateOfDeposit),

                    treasuryName:
                        treasuryName.trim(),

                    treasuryCode:
                        treasuryCode.trim(),

                    challanNo:
                        challanNo.trim(),

                    voucherNo:
                        voucherNo.trim(),

                    dateOfVoucher: dateOfVoucher
                        ? new Date(dateOfVoucher)
                        : null,

                    cashierId: req.user.id,
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
            });

        // ----------------------------------------
        // SOCKET NOTIFICATION
        // ----------------------------------------

        try {
            getIO()
                .to("admin-room")
                .emit(
                    SOCKET_EVENTS.NEW_SUBMISSION,
                    submission
                );
        } catch (socketError) {
            console.error(
                "Socket notification failed:",
                socketError
            );
        }

        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        return res.status(201).json({
            message:
                "Tax submission created successfully",

            data: submission,
        });
    } catch (error) {
        console.error(
            "Create submission error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create tax submission",
        });
    }
};