/*
  Warnings:

  - You are about to drop the column `ratingVisible` on the `InterpreterRatingOption` table. All the data in the column will be lost.
  - Made the column `ratingVisibleFrom` on table `InterpreterRatingOption` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ratingVisibleTo` on table `InterpreterRatingOption` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InterpreterRatingOption" DROP COLUMN "ratingVisible",
ALTER COLUMN "ratingVisibleFrom" SET NOT NULL,
ALTER COLUMN "ratingVisibleTo" SET NOT NULL;
