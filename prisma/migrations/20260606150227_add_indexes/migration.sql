-- AlterTable: fix Verification nullable timestamps to non-nullable
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Verification" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex: Session
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex: Account unique + index
CREATE UNIQUE INDEX "Account_userId_providerId_accountId_key" ON "Account"("userId", "providerId", "accountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex: UserProfile
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex: DailyLog
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");

-- CreateIndex: FoodEntry
CREATE INDEX "FoodEntry_dailyLogId_idx" ON "FoodEntry"("dailyLogId");

-- CreateIndex: WorkoutSession
CREATE INDEX "WorkoutSession_dailyLogId_idx" ON "WorkoutSession"("dailyLogId");

-- CreateIndex: Exercise
CREATE INDEX "Exercise_workoutSessionId_idx" ON "Exercise"("workoutSessionId");

-- CreateIndex: ExerciseSet
CREATE INDEX "ExerciseSet_exerciseId_idx" ON "ExerciseSet"("exerciseId");

-- CreateIndex: BodyWeightEntry
CREATE INDEX "BodyWeightEntry_userId_idx" ON "BodyWeightEntry"("userId");
