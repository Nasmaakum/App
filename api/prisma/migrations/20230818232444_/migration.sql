-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "serviceCalledAt" TIMESTAMP(3),
ADD COLUMN     "serviceEndedAt" TIMESTAMP(3),
ADD COLUMN     "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
