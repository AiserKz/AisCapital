/*
  Warnings:

  - A unique constraint covering the columns `[roomId,playerId]` on the table `PlayerInRoom` will be added. If there are existing duplicate values, this will fail.

*/
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
CREATE UNIQUE INDEX "PlayerInRoom_roomId_playerId_key" ON "PlayerInRoom"("roomId", "playerId");

-- AddForeignKey
ALTER TABLE "PlayerGameHistory" ADD CONSTRAINT "PlayerGameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameHistory" ADD CONSTRAINT "PlayerGameHistory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
