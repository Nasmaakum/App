/*
  Warnings:

  - You are about to drop the column `whatWasGood` on the `InterpreterRating` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InterpreterRating" DROP COLUMN "whatWasGood";

-- CreateTable
CREATE TABLE "InterpreterRatingOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "ratingVisible" DOUBLE PRECISION NOT NULL,
    "ratingId" TEXT,

    CONSTRAINT "InterpreterRatingOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterpreterRatingOption" ADD CONSTRAINT "InterpreterRatingOption_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "InterpreterRating"("id") ON DELETE SET NULL ON UPDATE CASCADE;
