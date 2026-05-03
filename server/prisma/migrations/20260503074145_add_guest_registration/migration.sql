-- CreateTable
CREATE TABLE "GuestRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "position" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestRegistration_eventId_registeredById_name_key" ON "GuestRegistration"("eventId", "registeredById", "name");

-- AddForeignKey
ALTER TABLE "GuestRegistration" ADD CONSTRAINT "GuestRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestRegistration" ADD CONSTRAINT "GuestRegistration_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
