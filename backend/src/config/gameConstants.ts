/**
 * Константы игры Монополия
 * Все числовые значения и настройки игры собраны в одном месте для удобства
 */

// === ФИНАНСОВЫЕ КОНСТАНТЫ ===
/** Стоимость выхода из тюрьмы */
export const JAIL_FEE = 100;

/** Бонус за прохождение старта */
export const START_BONUS = 200;

/** Базовая сумма налога */
export const TAX_BASE = 50;

/** Процент от денег игрока для налога */
export const TAX_PERCENTAGE = 0.1;

/** Множитель ренты при монополии (без домов) */
export const MONOPOLY_RENT_MULTIPLIER = 1.5;

// === ТАЙМЕРЫ ===
/** Время на принятие решения о покупке (мс) */
export const PENDING_ACTION_TIMEOUT = 30000;

/** Время на ставку в аукционе (мс) */
export const AUCTION_BID_TIMEOUT = 20000;

// === ТЮРЬМА ===
/** Максимальное количество ходов в тюрьме */
export const MAX_JAIL_TURNS = 3;

/** Количество дублей подряд для попадания в тюрьму */
export const MAX_COMBO_FOR_JAIL = 3;

// === СТРОИТЕЛЬСТВО ===
/** Максимальное количество домов на клетке */
export const MAX_HOUSES_PER_CELL = 4;

/** Максимальное количество отелей на клетке */
export const MAX_HOTELS_PER_CELL = 3;

// === ИГРОВАЯ ДОСКА ===
/** Общее количество клеток на доске */
export const TOTAL_CELLS = 40;

/** ID клеток с железными дорогами */
export const RAILROAD_CELLS = [5, 15, 25, 35];

/** ID клеток с коммунальными услугами */
export const UTILITY_CELLS = [12, 28];

/** ID клеток налогов */
export const TAX_CELLS = [4, 38];

/** ID угловых клеток */
export const CORNER_CELLS = {
  START: 0,
  JAIL: 10,
  FREE_PARKING: 20,
  GO_TO_JAIL: 30,
};

// === ЦВЕТОВЫЕ ГРУППЫ ===
/** Маппинг цветов и ID клеток для определения монополий */
export const COLOR_GROUPS: Record<string, number[]> = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
  railroad: RAILROAD_CELLS,
  utility: UTILITY_CELLS,
};

// === МНОЖИТЕЛИ ДЛЯ ЖЕЛЕЗНЫХ ДОРОГ ===
/** Множитель ренты в зависимости от количества железных дорог */
export const RAILROAD_RENT_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

// === РАСЧЕТ РЕНТЫ ===
/** Множитель для домов при расчете ренты */
export const HOUSE_RENT_MULTIPLIER = 0.7;

/** Множитель для отелей при расчете ренты */
export const HOTEL_RENT_MULTIPLIER = 0.9;

// === ELO ИЗМЕНЕНИЯ ===
/** Прирост ELO за победу */
export const ELO_WIN_BONUS = 10;

/** Потеря ELO за поражение */
export const ELO_LOSS_PENALTY = 1;
