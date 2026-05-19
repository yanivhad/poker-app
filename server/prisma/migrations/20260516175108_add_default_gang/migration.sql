-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultGangId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultGangId_fkey" FOREIGN KEY ("defaultGangId") REFERENCES "Gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
