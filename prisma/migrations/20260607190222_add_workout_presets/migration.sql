-- CreateTable
CREATE TABLE "WorkoutPreset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutName" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutPreset_userId_workoutName_idx" ON "WorkoutPreset"("userId", "workoutName");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPreset_userId_workoutName_exerciseName_key" ON "WorkoutPreset"("userId", "workoutName", "exerciseName");

-- AddForeignKey
ALTER TABLE "WorkoutPreset" ADD CONSTRAINT "WorkoutPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
