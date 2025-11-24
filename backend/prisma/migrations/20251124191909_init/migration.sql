-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'STARTING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "nextLevelXp" INTEGER NOT NULL DEFAULT 1000,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxPlayer" INTEGER NOT NULL DEFAULT 4,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "hostId" TEXT NOT NULL,
    "winnerId" TEXT,
    "currentTurnPlayerId" TEXT,
    "comboTurn" INTEGER NOT NULL DEFAULT 0,
    "gameSetting" JSONB,
    "cellState" JSONB,
    "currentPayment" JSONB,
    "pendingChance" JSONB,
    "activeTrade" JSONB,
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
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,
    "positionOnBoard" INTEGER NOT NULL DEFAULT 0,
    "jailed" BOOLEAN NOT NULL DEFAULT false,
    "jailTurns" INTEGER NOT NULL DEFAULT 0,
    "bankrupt" BOOLEAN NOT NULL DEFAULT false,
    "skippedTurns" INTEGER NOT NULL DEFAULT 0,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "hasJailFreeCard" BOOLEAN NOT NULL DEFAULT false,
    "skipRentTurns" INTEGER NOT NULL DEFAULT 0,
    "money" INTEGER NOT NULL DEFAULT 1500,
    "properties" JSONB,
    "lastAction" TIMESTAMP(3),
    "pendingAction" JSONB,
    "bot" BOOLEAN NOT NULL DEFAULT false,
    "disconnected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerInRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGameHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "finalMoney" INTEGER NOT NULL,
    "finalElo" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "duration" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "leftAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerGameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_wins_idx" ON "Player"("wins");

-- CreateIndex
CREATE INDEX "Player_elo_idx" ON "Player"("elo");

-- CreateIndex
CREATE INDEX "GameRoom_status_idx" ON "GameRoom"("status");

-- CreateIndex
CREATE INDEX "GameRoom_isPrivate_idx" ON "GameRoom"("isPrivate");

-- CreateIndex
CREATE INDEX "GameRoom_createdAt_idx" ON "GameRoom"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerInRoom_roomId_idx" ON "PlayerInRoom"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInRoom_roomId_playerId_key" ON "PlayerInRoom"("roomId", "playerId");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInRoom" ADD CONSTRAINT "PlayerInRoom_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInRoom" ADD CONSTRAINT "PlayerInRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameHistory" ADD CONSTRAINT "PlayerGameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameHistory" ADD CONSTRAINT "PlayerGameHistory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
