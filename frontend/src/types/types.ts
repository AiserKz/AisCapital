interface AppContextType {
  user: UserType | null;
  loading: boolean;
  leader: LeaderboardPlayer[] | null;
  roomList: RoomType[];
  fetchRoomList: () => void;
  LogOut: () => void;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  totalGames: number;
  wins: number;
  winRate: number;
  currentXp: number;
  nextLevelXp: number;
  elo: number;
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
  status: number;
}

interface LeaderboardPlayer {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  totalGames: number;
  wins: number;
  winRate: number;
  elo: number;
}

interface RoomType {
  id: string;
  name: string;
  maxPlayer: number;
  status: "WAITING" | "STARTING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  isPrivate: boolean;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  players: PlayerInRoomType[];
  createdAt: string;
}

interface PlayerInRoomType {
  id: string;
  isReady: boolean;
  joinedAt: string;
  player: PlayerLightType;
  playerId: string;
  position: number;
  roomId: string;
  money: number;
  bankrupt: boolean;
  lastAction?: string;
  properties?: number[];
  positionOnBoard: number;
  disconnected: boolean;
  bot: boolean;
  skippedTurns: number;
  jailed: boolean;
  jailTurns: number;
  isFrozen: boolean;
  hasJailFreeCard: boolean;
}

interface PlayerLightType {
  id: string;
  name: string;
  avatar?: string;
  level: number;
}

interface RoomDetailType extends RoomType {
  startedAt: string;
  cellState: CellState[];
  currentPayment?: CurrentPaymentType;
  pendingChance?: PendingChanceType;
  finishedAt: string;
  gameSettings: {};
  currentTurnPlayerId?: string;
  winner?: PlayerLightType;
  winnerId?: string;
}

interface CellState {
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
}

type Ceil = {
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

interface CurrentPaymentType {
  payerId: string;
  ownerId: string;
  cellId: number;
  rent: number;
}

interface PendingChanceType {
  cardId?: number;
  playerId: string;
  timestamp?: string;
  text?: string;
}

export type {
  AppContextType,
  UserType,
  LeaderboardPlayer,
  RoomType,
  PlayerInRoomType,
  RoomDetailType,
  CellState,
  Ceil,
  CurrentPaymentType,
  PendingChanceType,
};
