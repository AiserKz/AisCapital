-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'STARTING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxPlayer" INTEGER NOT NULL DEFAULT 4,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "hostId" TEXT NOT NULL,
    "gameSetting" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerInRoom" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER,
    "isReady" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerInRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameRoom_status_idx" ON "GameRoom"("status");

-- CreateIndex
CREATE INDEX "GameRoom_isPrivate_idx" ON "GameRoom"("isPrivate");

-- CreateIndex
CREATE INDEX "GameRoom_createdAt_idx" ON "GameRoom"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerInRoom_roomId_idx" ON "PlayerInRoom"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInRoom_playerId_roomId_key" ON "PlayerInRoom"("playerId", "roomId");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInRoom" ADD CONSTRAINT "PlayerInRoom_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInRoom" ADD CONSTRAINT "PlayerInRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
