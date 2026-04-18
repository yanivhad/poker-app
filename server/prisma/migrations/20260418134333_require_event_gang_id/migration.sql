/*
  Warnings:

  - Made the column `gangId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_gangId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "gangId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
