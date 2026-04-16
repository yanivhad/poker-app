-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "resultsSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "resultsSubmittedById" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_resultsSubmittedById_fkey" FOREIGN KEY ("resultsSubmittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
