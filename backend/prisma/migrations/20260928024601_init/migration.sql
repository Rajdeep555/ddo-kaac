-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CASHIER');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CASHIER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxSubmission" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "natureOfTax" TEXT NOT NULL,
    "headOfAccount" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "payeeNameAddress" TEXT NOT NULL,
    "collectorName" TEXT NOT NULL,
    "dateOfDeposit" TIMESTAMP(3) NOT NULL,
    "treasuryName" TEXT NOT NULL,
    "treasuryCode" TEXT NOT NULL,
    "challanNo" TEXT NOT NULL,
    "voucherNo" TEXT NOT NULL,
    "dateOfVoucher" TIMESTAMP(3),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "cashierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TaxSubmission_cashierId_idx" ON "TaxSubmission"("cashierId");

-- CreateIndex
CREATE INDEX "TaxSubmission_date_idx" ON "TaxSubmission"("date");

-- CreateIndex
CREATE INDEX "TaxSubmission_status_idx" ON "TaxSubmission"("status");

-- CreateIndex
CREATE INDEX "TaxSubmission_natureOfTax_idx" ON "TaxSubmission"("natureOfTax");

-- CreateIndex
CREATE INDEX "TaxSubmission_treasuryCode_idx" ON "TaxSubmission"("treasuryCode");

-- CreateIndex
CREATE INDEX "TaxSubmission_createdAt_idx" ON "TaxSubmission"("createdAt");

-- AddForeignKey
ALTER TABLE "TaxSubmission" ADD CONSTRAINT "TaxSubmission_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
