-- CreateEnum
CREATE TYPE "GangMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "GangMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MASTER';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "gangId" TEXT;

-- AlterTable
ALTER TABLE "PokerCase" ADD COLUMN     "gangId" TEXT;

-- CreateTable
CREATE TABLE "Gang" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GangMember" (
    "id" TEXT NOT NULL,
    "gangId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GangMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "GangMemberStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GangMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gang_name_key" ON "Gang"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GangMember_gangId_userId_key" ON "GangMember"("gangId", "userId");

-- AddForeignKey
ALTER TABLE "GangMember" ADD CONSTRAINT "GangMember_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GangMember" ADD CONSTRAINT "GangMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokerCase" ADD CONSTRAINT "PokerCase_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
