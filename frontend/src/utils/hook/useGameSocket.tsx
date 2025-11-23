import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import { useEffect } from "react";
import type { RoomAction } from "../../pages/GameRoom";
import { refreshAccessToken } from "../apiFetch";
import type {
  AuctionStateType,
  AuctionType,
  TradeOffer,
} from "../../types/types";

const connectSocket = () => {
  socket.on("reconnect_attempt", () => {
    socket.auth = {
      token: localStorage.getItem("accessToken"),
    };
  });

  socket.on("connect_error", async (err) => {
    if (err.message === "Unauthorized") {
      const newToken = await refreshAccessToken();
      if (!newToken) return;
      localStorage.setItem("accessToken", newToken.data.accessToken);
      socket.auth = {
        token: newToken.data.accessToken,
      };
      socket.connect();
    }
  });

  socket.auth = {
    token: localStorage.getItem("accessToken"),
  };

  socket.connect();
};

const socket = io(API_BASE_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("accessToken"),
  },
});
export const GAME_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  PLAYER_MOVE: "player_move",
  PAY_RENT: "pay_rent",
  BUY_CELL: "buy_cell",
  MORTAGE_CELL: "mortage_cell",
  UN_MORTAGE_CELL: "un-mortage_cell",
  ROOM_UPDATE: "room_updated",
  RENT_REQUIRED: "rent_required",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  PLAYER_HAS_MOVED: "player_has_moved",
  PAYMENT_COMPLETE: "payment_completed",
  MESSAGE: "game_message",
  CONFIRM_CHANCE: "confirm_chance",
  JAIL_ACTION: "jail_action",
  BUY_HOUSE: "buy_house",
  GAME_OVER: "game_over",
  IS_READY: "is_ready",
  HOST_LEAVE: "host_leave",
  PENDING_ACTION: "pending_action",
  TURN_ENDED: "turn_ended",
  ROOM_MESSAGE: "room_message",
  // === СОБЫТИЯ ОБМЕНОВ ===
  TRADE_OFFER: "trade_offer",
  TRADE_ACCEPT: "trade_accept",
  TRADE_REJECT: "trade_reject",
  TRADE_CANCEL: "trade_cancel",
  TRADE_UPDATED: "trade_updated",
  // === СОБЫТИЯ АУКЦИОНОВ ===
  AUCTION_START: "auction_start",
  AUCTION_BID: "auction_bid",
  AUCTION_ENDED: "auction_ended",
} as const;

export default function useGameSocket(
  roomId: string | undefined,
  playerId: string | undefined,
  handleRollDice: (dice1: number, dice2: number) => void,
  dispatch: React.Dispatch<RoomAction>,

  onMessage?: (message: any) => void,
  roomClosed?: (message: string) => void,
  startTimer?: (time: number) => void,
  chatMessage?: (data: {
    playerId: string;
    text: string;
    username: string;
    time: number;
  }) => void,
  auctionStart?: (auction: AuctionType | null) => void,
  setAuctionState?: (auction: AuctionStateType | null) => void
) {
  useEffect(() => {
    if (!roomId || !playerId) return;

    connectSocket();
    console.log("📟 Подключение к комнате");

    socket.emit(GAME_EVENTS.JOIN_ROOM, roomId);

    socket.on(GAME_EVENTS.PLAYER_JOINED, (_) => {});

    socket.on(GAME_EVENTS.PLAYER_LEFT, (_) => {});

    socket.on(GAME_EVENTS.ROOM_UPDATE, (room) => {
      console.log(GAME_EVENTS.ROOM_UPDATE, room);
      dispatch({ type: "SET_ROOM", payload: room });
    });

    socket.on(GAME_EVENTS.PLAYER_HAS_MOVED, (dice1, dice2) => {
      handleRollDice(dice1, dice2);
    });

    socket.on(GAME_EVENTS.RENT_REQUIRED, (data) => {
      dispatch({ type: "SET_CURRENT_PAYMENT", payload: data.text });
    });

    socket.on(GAME_EVENTS.MESSAGE, (message) => {
      onMessage?.(message);
    });

    socket.on(GAME_EVENTS.HOST_LEAVE, (message) => {
      roomClosed?.(message);
    });

    socket.on(GAME_EVENTS.TURN_ENDED, () => {
      startTimer?.(0);
    });

    socket.on(GAME_EVENTS.PENDING_ACTION, ({ playerId, action }) => {
      if (action.type === "BUY_OR_PAY" && playerId) {
        startTimer?.(action.expiresAt);
      }
    });

    socket.on(GAME_EVENTS.ROOM_MESSAGE, (message) => {
      chatMessage?.(message);
    });

    socket.on(GAME_EVENTS.AUCTION_START, (auction: AuctionType) => {
      auctionStart?.(auction);
    });

    socket.on(GAME_EVENTS.AUCTION_BID, (state: AuctionStateType) => {
      setAuctionState?.(state);
    });

    socket.on(
      GAME_EVENTS.AUCTION_ENDED,
      (auctionId, winnerId, winnerName, finalBid) => {
        console.log(
          GAME_EVENTS.AUCTION_ENDED,
          auctionId,
          winnerId,
          winnerName,
          finalBid
        );
        auctionStart?.(null);
        setAuctionState?.(null);
      }
    );

    return () => {
      socket.emit(GAME_EVENTS.LEAVE_ROOM, roomId);
      Object.values(GAME_EVENTS).forEach((event) => socket.off(event));

      socket.disconnect();
    };
  }, [roomId, playerId]);

  const movePlayer = () => {
    socket.emit(GAME_EVENTS.PLAYER_MOVE, { roomId });
  };

  const buyCell = () => {
    socket.emit(GAME_EVENTS.PENDING_ACTION, {
      roomId,
      playerId,
      action: "BUY_OR_SKIP",
      buy: true,
    });
  };

  const skipTurn = () => {
    socket.emit(GAME_EVENTS.PENDING_ACTION, {
      roomId,
      playerId,
      action: "BUY_OR_SKIP",
      buy: false,
    });
  };

  const payRent = () => {
    socket.emit(GAME_EVENTS.PAY_RENT, { roomId });
  };

  const mortagetCell = async (cellId: number) => {
    socket.emit(GAME_EVENTS.MORTAGE_CELL, { roomId, cellId });
  };

  const unMortagetCell = async (cellId: number) => {
    socket.emit(GAME_EVENTS.UN_MORTAGE_CELL, { roomId, cellId });
  };

  const confrimChance = () => {
    socket.emit(GAME_EVENTS.CONFIRM_CHANCE, { roomId });
  };

  const handleJailAction = async (action: "roll" | "pay" | "wait") => {
    socket.emit(GAME_EVENTS.JAIL_ACTION, { roomId, action });
  };

  const handleBuyHouse = (cellId: number, type: "house" | "hotel") => {
    socket.emit(GAME_EVENTS.BUY_HOUSE, { roomId, cellId, type });
  };

  const handleIsReady = () => {
    socket.emit(GAME_EVENTS.IS_READY, roomId);
  };

  const sendMessage = (text: string) => {
    socket.emit(GAME_EVENTS.ROOM_MESSAGE, { roomId, text });
  };

  const handleTradeOffer = (offer: TradeOffer) => {
    socket.emit(GAME_EVENTS.TRADE_OFFER, { roomId, offer });
  };

  const handleTradeAccept = () => {
    socket.emit(GAME_EVENTS.TRADE_ACCEPT, { roomId });
  };

  const handleTradeReject = () => {
    socket.emit(GAME_EVENTS.TRADE_REJECT, { roomId });
  };

  const handleTradeCancel = () => {
    socket.emit(GAME_EVENTS.TRADE_CANCEL, { roomId });
  };

  const handleAuctionStart = () => {
    socket.emit(GAME_EVENTS.AUCTION_START, { roomId });
  };

  const handleAuctionBid = (auctionId: string, amount: number) => {
    socket.emit(GAME_EVENTS.AUCTION_BID, { roomId, auctionId, amount });
  };

  return {
    movePlayer,
    buyCell,
    payRent,
    mortagetCell,
    unMortagetCell,
    confrimChance,
    handleJailAction,
    handleBuyHouse,
    handleIsReady,
    skipTurn,
    sendMessage,
    handleAuctionStart,
    handleAuctionBid,
    handleTradeOffer,
    handleTradeAccept,
    handleTradeReject,
    handleTradeCancel,
  };
}
