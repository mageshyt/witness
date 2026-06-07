/*
  Warnings:

  - Added the required column `updatedAt` to the `WorkoutPreset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutPreset" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "WorkoutPreset" ALTER COLUMN "updatedAt" DROP DEFAULT;
