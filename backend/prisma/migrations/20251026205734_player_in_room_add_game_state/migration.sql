-- AlterTable
ALTER TABLE "PlayerInRoom" ADD COLUMN     "bankrupt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jailed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAction" TIMESTAMP(3),
ADD COLUMN     "money" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "properties" JSONB;
