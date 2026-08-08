-- CreateTable
CREATE TABLE "ExerciseSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "level" TEXT,
    "area" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    CONSTRAINT "ExerciseItem_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ExerciseSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExerciseSet_userId_createdAt_idx" ON "ExerciseSet"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseItem_setId_idx" ON "ExerciseItem"("setId");
