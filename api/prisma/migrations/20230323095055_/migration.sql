/*
  Warnings:

  - You are about to drop the column `ratingId` on the `InterpreterRatingOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InterpreterRatingOption" DROP CONSTRAINT "InterpreterRatingOption_ratingId_fkey";

-- AlterTable
ALTER TABLE "InterpreterRatingOption" DROP COLUMN "ratingId";

-- CreateTable
CREATE TABLE "_InterpreterRatingToInterpreterRatingOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InterpreterRatingToInterpreterRatingOption_AB_unique" ON "_InterpreterRatingToInterpreterRatingOption"("A", "B");

-- CreateIndex
CREATE INDEX "_InterpreterRatingToInterpreterRatingOption_B_index" ON "_InterpreterRatingToInterpreterRatingOption"("B");

-- AddForeignKey
ALTER TABLE "_InterpreterRatingToInterpreterRatingOption" ADD CONSTRAINT "_InterpreterRatingToInterpreterRatingOption_A_fkey" FOREIGN KEY ("A") REFERENCES "InterpreterRating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterpreterRatingToInterpreterRatingOption" ADD CONSTRAINT "_InterpreterRatingToInterpreterRatingOption_B_fkey" FOREIGN KEY ("B") REFERENCES "InterpreterRatingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
