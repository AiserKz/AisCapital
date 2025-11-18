import { getCellState } from "../sockets/utils/roomUtils.js";
import { Ceil, ChanceType } from "../types/types.js";

// Поля доски
export const cells: Ceil[] = [
  { id: 0, type: "CORNER", name: "Старт", isBuying: false },
  {
    id: 1,
    type: "PROPERTY",
    name: "Арбат",
    price: 60,
    rent: 20,
    color: "brown",
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  { id: 2, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 3,
    type: "PROPERTY",
    name: "Тверская",
    price: 60,
    rent: 20,
    color: "brown",
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  { id: 4, type: "TAX", name: "Налог", isBuying: false },
  {
    id: 5,
    type: "RAILROAD",
    name: "Вокзал",
    price: 200,
    rent: 50,
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  {
    id: 6,
    type: "PROPERTY",
    name: "Невский",
    price: 100,
    rent: 30,
    color: "lightblue",
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  { id: 7, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 8,
    type: "PROPERTY",
    name: "Садовое",
    price: 100,
    rent: 30,
    color: "lightblue",
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  {
    id: 9,
    type: "PROPERTY",
    name: "Кутузовский",
    price: 120,
    rent: 36,
    color: "lightblue",
    isBuying: true,
    housePrice: 50,
    hotelPrice: 100,
  },
  { id: 10, type: "CORNER", name: "Тюрьма", isBuying: false },
  {
    id: 11,
    type: "PROPERTY",
    name: "Ленинградский",
    price: 140,
    rent: 40,
    color: "pink",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  {
    id: 12,
    type: "UTILITY",
    name: "Электростанция",
    price: 150,
    rent: 20,
    isBuying: true,
    housePrice: 0,
    hotelPrice: 0,
  },
  {
    id: 13,
    type: "PROPERTY",
    name: "Рублёвка",
    price: 140,
    rent: 40,
    color: "pink",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  {
    id: 14,
    type: "PROPERTY",
    name: "Патриаршие",
    price: 160,
    rent: 44,
    color: "pink",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  {
    id: 15,
    type: "RAILROAD",
    name: "Аэропорт",
    price: 200,
    rent: 50,
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  {
    id: 16,
    type: "PROPERTY",
    name: "Бауманская",
    price: 180,
    rent: 50,
    color: "orange",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  { id: 17, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 18,
    type: "PROPERTY",
    name: "Таганская",
    price: 180,
    rent: 50,
    color: "orange",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  {
    id: 19,
    type: "PROPERTY",
    name: "Красная площадь",
    price: 200,
    rent: 56,
    color: "orange",
    isBuying: true,
    housePrice: 100,
    hotelPrice: 150,
  },
  { id: 20, type: "CORNER", name: "Парковка", isBuying: false },
  {
    id: 21,
    type: "PROPERTY",
    name: "Петровка",
    price: 220,
    rent: 60,
    color: "red",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  { id: 22, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 23,
    type: "PROPERTY",
    name: "Остоженка",
    price: 220,
    rent: 60,
    color: "red",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  {
    id: 24,
    type: "PROPERTY",
    name: "Пречистенка",
    price: 240,
    rent: 64,
    color: "red",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  {
    id: 25,
    type: "RAILROAD",
    name: "Метро",
    price: 200,
    rent: 50,
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  {
    id: 26,
    type: "PROPERTY",
    name: "Мясницкая",
    price: 260,
    rent: 70,
    color: "yellow",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  {
    id: 27,
    type: "PROPERTY",
    name: "Покровка",
    price: 260,
    rent: 70,
    color: "yellow",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  {
    id: 28,
    type: "UTILITY",
    name: "Водоканал",
    price: 150,
    rent: 20,
    isBuying: true,
    housePrice: 0,
    hotelPrice: 0,
  },
  {
    id: 29,
    type: "PROPERTY",
    name: "Лубянка",
    price: 280,
    rent: 76,
    color: "yellow",
    isBuying: true,
    housePrice: 150,
    hotelPrice: 200,
  },
  { id: 30, type: "CORNER", name: "В тюрьму", isBuying: false },
  {
    id: 31,
    type: "PROPERTY",
    name: "Ильинка",
    price: 300,
    rent: 80,
    color: "green",
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
  {
    id: 32,
    type: "PROPERTY",
    name: "Варварка",
    price: 300,
    rent: 80,
    color: "green",
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
  { id: 33, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 34,
    type: "PROPERTY",
    name: "Никольская",
    price: 320,
    rent: 84,
    color: "green",
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
  {
    id: 35,
    type: "RAILROAD",
    name: "Порт",
    price: 200,
    rent: 50,
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
  { id: 36, type: "CHANCE", name: "Шанс", isBuying: false },
  {
    id: 37,
    type: "PROPERTY",
    name: "Воздвиженка",
    price: 350,
    rent: 100,
    color: "darkblue",
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
  { id: 38, type: "TAX", name: "Налог", isBuying: false },
  {
    id: 39,
    type: "PROPERTY",
    name: "Моховая",
    price: 400,
    rent: 120,
    color: "darkblue",
    isBuying: true,
    housePrice: 200,
    hotelPrice: 250,
  },
];

export const chanceCards: ChanceType[] = [
  {
    id: 0,
    text: "💰 Получите $100 от банка",
    type: "money",
    effect: (p) => {
      p.money += 100;
    },
  },
  {
    id: 1,
    text: "🏦 Банковская ошибка в вашу пользу - получите $200",
    type: "money",
    effect: (p) => {
      p.money += 200;
    },
  },
  {
    id: 2,
    text: "💸 Оплатите страховой взнос $50",
    type: "money",
    effect: (p) => {
      p.money -= 50;
    },
  },
  {
    id: 3,
    text: "🏗️ Оплатите ремонт недвижимости: $25 за каждую клетку",
    type: "money",
    effect: (p, room) => {
      const { cellState } = getCellState(room, p.positionOnBoard);
      const allOwnedCells = cellState.filter((c) => c.ownerId === p.playerId);
      const totalTaxes = allOwnedCells.length * 25;
      p.money -= totalTaxes;
    },
  },
  {
    id: 4,
    text: "🎯 Отправляйтесь на клетку Старт (GO) и получите $200",
    type: "move",
    effect: (p) => {
      p.positionOnBoard = 0;
      p.money += 200;
    },
  },
  {
    id: 5,
    text: "🚗 Продвиньтесь на 3 клетки вперёд",
    type: "move",
    effect: (p) => {
      p.positionOnBoard = (p.positionOnBoard + 3) % 40;
    },
  },
  {
    id: 6,
    text: "🔙 Вернитесь на 3 клетки назад",
    type: "move",
    effect: (p) => {
      p.positionOnBoard = (p.positionOnBoard - 3 + 40) % 40;
      if (p.positionOnBoard === 30) p.positionOnBoard = 10;
    },
  },
  {
    id: 7,
    text: "🚓 Отправляйтесь прямо в тюрьму, не проходите Старт и не получайте $200",
    type: "jail",
    effect: (p) => {
      if (p.hasJailFreeCard) p.hasJailFreeCard = false;
      else {
        p.positionOnBoard = 10;
        p.jailed = true;
      }
    },
  },
  {
    id: 8,
    text: "🎟️ Выход из тюрьмы бесплатно - храните до востребования",
    type: "misc",
    effect: (p) => {
      p.hasJailFreeCard = true;
    },
  },
  {
    id: 9,
    text: "💵 Получите $50 от каждого игрока",
    type: "money",
    effect: (p, room) => {
      const otherPlayers = room.players.filter(
        (player) => player.playerId !== p.playerId
      );
      p.money += otherPlayers.length * 50;
      otherPlayers.forEach((player) => (player.money -= 50));
    },
  },
  {
    id: 10,
    text: "🏠 Получите $50 за каждый вашу клетку",
    type: "money",
    effect: (p, room) => {
      const allOwnedCells = getCellState(
        room,
        p.positionOnBoard
      ).cellState.filter((ceil) => ceil.ownerId === p.playerId);
      const totalBonus = allOwnedCells.length * 50;
      p.money += totalBonus;
    },
  },
  {
    id: 11,
    text: "💸 Все игроки платят банку по $20",
    type: "money",
    effect: (p, room) => {
      room.players.forEach((player) => (player.money -= 20));
    },
  },
  {
    id: 12,
    text: "🚀 Продвиньтесь до ближайшей железной дороги",
    type: "move",
    effect: (p) => {
      const railways = [5, 15, 25, 35];
      const nextRailway =
        railways.find((r) => r > p.positionOnBoard) ?? railways[0];
      p.positionOnBoard = nextRailway;
    },
  },
  {
    id: 13,
    text: "⛔ Вернитесь до ближайшей налоговой клетки",
    type: "move",
    effect: (p) => {
      const taxes = [4, 38];
      const position = p.positionOnBoard;
      const boardSize = 40;

      let closestTax = taxes[0];
      let minDistance = boardSize;

      for (const tax of taxes) {
        // расстояние вперед по кругу
        const forward = (tax - position + boardSize) % boardSize;
        // расстояние назад по кругу
        const backward = (position - tax + boardSize) % boardSize;

        // минимальное расстояние
        const distance = Math.min(forward, backward);

        if (distance < minDistance) {
          minDistance = distance;
          closestTax = tax;
        }
      }

      p.positionOnBoard = closestTax;
    },
  },
  {
    id: 14,
    text: "🔄 Обменяйтесь местами с другим игроком",
    type: "move",
    effect: (p, room) => {
      const otherPlayers = room.players.filter(
        (pl) => pl.playerId !== p.playerId
      );
      if (!otherPlayers.length) return;
      const target =
        otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      const temp = p.positionOnBoard;
      p.positionOnBoard = target.positionOnBoard;
      target.positionOnBoard = temp;
    },
  },
  {
    id: 15,
    text: "⏳ Счастливая пауза: пропустите оплату ренты на 3 хода",
    type: "misc",
    effect: (p) => {
      p.skipRentTurns = 3;
    },
  },
  {
    id: 16,
    text: "💼 Получите бесплатный дом (если есть свободная клетка)",
    type: "misc",
    effect: (p, room) => {
      const cellState = getCellState(room, 0).cellState.filter(
        (c) => c.ownerId === p.playerId
      );
      if (!cellState.length) return;
      const randomCell =
        cellState[Math.floor(Math.random() * cellState.length)];
      randomCell.ownerId = p.playerId;
    },
  },
  // {
  //   id: 17,
  //   text: "🎲 Бросьте кубик ещё раз",
  //   type: "move",
  //   effect: (p, room) => {
  //     room.currentTurnPlayerId = p.playerId;
  //   },
  // },
  {
    id: 18,
    text: "🎉 Праздник: получите $10 от каждого игрока",
    type: "money",
    effect: (p, room) => {
      const otherPlayers = room.players.filter(
        (pl) => pl.playerId !== p.playerId
      );
      p.money += otherPlayers.length * 10;
      otherPlayers.forEach((pl) => (pl.money -= 10));
    },
  },
];
