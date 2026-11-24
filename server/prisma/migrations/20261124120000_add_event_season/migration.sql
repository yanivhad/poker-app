-- AlterTable
ALTER TABLE "Gang" ADD COLUMN "currentSeason" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "season" TEXT;

-- Data: every Atlit event created so far belongs to the 2025-2026 season
UPDATE "Event" SET "season" = '2025-2026'
WHERE "gangId" = (SELECT "id" FROM "Gang" WHERE "name" = 'Atlit');

-- Data: new Atlit events default to the 2026-2027 season
UPDATE "Gang" SET "currentSeason" = '2026-2027' WHERE "name" = 'Atlit';
