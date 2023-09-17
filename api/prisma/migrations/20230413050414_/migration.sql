-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('CALLING', 'ANSWERED', 'FAILED', 'ENDED', 'REJECTED');

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'CALLING',

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Interpreter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
