-- AlterTable
ALTER TABLE "TaxSubmission" ADD COLUMN     "ddoId" INTEGER;

-- CreateTable
CREATE TABLE "Ddo" (
    "id" SERIAL NOT NULL,
    "ddoCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ddo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ddo_ddoCode_key" ON "Ddo"("ddoCode");

-- CreateIndex
CREATE INDEX "Ddo_name_idx" ON "Ddo"("name");

-- CreateIndex
CREATE INDEX "Ddo_email_idx" ON "Ddo"("email");

-- CreateIndex
CREATE INDEX "Ddo_phone_idx" ON "Ddo"("phone");

-- CreateIndex
CREATE INDEX "Ddo_isActive_idx" ON "Ddo"("isActive");

-- CreateIndex
CREATE INDEX "TaxSubmission_ddoId_idx" ON "TaxSubmission"("ddoId");

-- CreateIndex
CREATE INDEX "TaxSubmission_headOfAccount_idx" ON "TaxSubmission"("headOfAccount");

-- CreateIndex
CREATE INDEX "TaxSubmission_receiptNo_idx" ON "TaxSubmission"("receiptNo");

-- CreateIndex
CREATE INDEX "TaxSubmission_challanNo_idx" ON "TaxSubmission"("challanNo");

-- CreateIndex
CREATE INDEX "TaxSubmission_voucherNo_idx" ON "TaxSubmission"("voucherNo");

-- AddForeignKey
ALTER TABLE "TaxSubmission" ADD CONSTRAINT "TaxSubmission_ddoId_fkey" FOREIGN KEY ("ddoId") REFERENCES "Ddo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
