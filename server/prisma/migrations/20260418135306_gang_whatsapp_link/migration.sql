/*
  Warnings:

  - You are about to drop the column `phone` on the `Gang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gang" DROP COLUMN "phone",
ADD COLUMN     "whatsappLink" TEXT;
