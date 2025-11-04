-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "currentTurnPlayerId" TEXT;

-- AlterTable
ALTER TABLE "PlayerInRoom" ADD COLUMN     "positionOnBoard" INTEGER NOT NULL DEFAULT 0;
