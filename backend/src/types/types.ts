import { PlayerInRoom, Prisma } from "@prisma/client";

export type SafePlayer = {
  id: string;
  name: string;
  avatar: string | null;
  level: number;
  totalGames: number;
  wins: number;
  winRate: number;
  currentXp: number;
  nextLevelXp: number;
  elo: number;
  createdAt: Date;
  lastSeen: Date | null;
  status: number;
};

export type Ceil = {
  id: number;
  type: "PROPERTY" | "CORNER" | "CHANCE" | "TAX" | "RAILROAD" | "UTILITY";
  name: string;
  price?: number;
  rent?: number;
  color?: string;
  isBuying?: boolean;
  housePrice?: number;
  hotelPrice?: number;
};

export type CellState = {
  id: number;
  ownerId?: string;
  ownerPosition?: number;
  currentRent?: number;
  mortgaged?: boolean;
  houses: number;
  hotels: number;
  baseRent: number;
  housePrice?: number;
  hotelPrice?: number;
};

export interface CurrentPaymentType {
  payerId: string;
  ownerId: string;
  cellId: number;
  rent: number;
}

export interface ChanceType {
  id: number;
  text: string;
  type: "money" | "move" | "jail" | "misc";
  effect: (p: PlayerInRoom) => void;
}

export interface PendingChanceType {
  cardId?: number;
  playerId: string;
  timestamp?: string;
  text?: string;
}

export type PendingAction = {
  type: "BUY_OR_PAY" | "BUY_OR_SKIP";
  cellId?: string;
  expiresAt?: number;
};

export type RoomWithPlayers = Prisma.GameRoomGetPayload<{
  include: {
    players: {
      include: {
        player: {
          select: {
            id: true;
            name: true;
            avatar: true;
            level: true;
          };
        };
      };
    };
    host: {
      select: {
        id: true;
        name: true;
        avatar: true;
      };
    };
  };
}>;
