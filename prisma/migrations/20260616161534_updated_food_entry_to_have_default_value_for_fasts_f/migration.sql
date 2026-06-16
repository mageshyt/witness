/*
  Warnings:

  - You are about to drop the column `quantityG` on the `FoodEntry` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseName` on the `WorkoutPreset` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `WorkoutPreset` table. All the data in the column will be lost.
  - You are about to drop the column `workoutName` on the `WorkoutPreset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `WorkoutPreset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `WorkoutPreset` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WorkoutPreset_userId_workoutName_exerciseName_key";

-- DropIndex
DROP INDEX "WorkoutPreset_userId_workoutName_idx";

-- AlterTable
ALTER TABLE "FoodEntry" DROP COLUMN "quantityG",
ADD COLUMN     "fatsG" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkoutPreset" DROP COLUMN "exerciseName",
DROP COLUMN "order",
DROP COLUMN "workoutName",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PresetExercise" (
    "id" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresetExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "fatsG" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PresetExercise_presetId_idx" ON "PresetExercise"("presetId");

-- CreateIndex
CREATE UNIQUE INDEX "PresetExercise_presetId_exerciseName_key" ON "PresetExercise"("presetId", "exerciseName");

-- CreateIndex
CREATE INDEX "FoodPreset_userId_idx" ON "FoodPreset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodPreset_userId_name_key" ON "FoodPreset"("userId", "name");

-- CreateIndex
CREATE INDEX "WorkoutPreset_userId_idx" ON "WorkoutPreset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPreset_userId_name_key" ON "WorkoutPreset"("userId", "name");

-- AddForeignKey
ALTER TABLE "PresetExercise" ADD CONSTRAINT "PresetExercise_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "WorkoutPreset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPreset" ADD CONSTRAINT "FoodPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
