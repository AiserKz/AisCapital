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
} as const;

export type GameEventKeys = keyof typeof GAME_EVENTS;
