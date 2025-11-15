import { Badge } from "./ui/badge";
import {
  Home,
  DollarSign,
  Gift,
  AlertTriangle,
  Landmark,
  House,
  PlusSquareIcon,
  Hotel,
} from "lucide-react";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "./ui/card";
import Button from "./ui/button";
import Dialog from "./ui/dialog";
import type { Ceil, CellState, PlayerInRoomType } from "../types/types";
import { cells } from "../test/data";

interface GameBoardProps {
  players: PlayerInRoomType[];
  cellState: CellState[];
  isMortage: boolean;
  handleMortage: (cellId: number) => void;
  handleUnMortage: (cellId: number) => void;
  currentUser: PlayerInRoomType | null;
  isCurrentTurn: boolean;
  handleBuyHouse: (cellId: number, type: "house" | "hotel") => void;
}

const userColor = {
  1: "blue",
  2: "red",
  3: "green",
  4: "yellow",
};

export function GameBoard({
  players,
  cellState,
  isMortage,
  handleMortage,
  handleUnMortage,
  currentUser,
  isCurrentTurn,
  handleBuyHouse,
}: GameBoardProps) {
  const [selectedCell, setSelectedCell] = useState<Ceil | null>(null);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      brown: "bg-amber-800",
      lightblue: "bg-sky-400",
      pink: "bg-pink-400",
      orange: "bg-orange-500",
      red: "bg-red-500",
      yellow: "bg-yellow-400",
      green: "bg-green-500",
      darkblue: "bg-blue-700",
    };
    return colors[color] || "bg-slate-300";
  };

  const getPlayerColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      red: "bg-red-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
    };
    return colors[color] || "bg-slate-500";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PROPERTY":
        return <Home className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "CHANCE":
        return <Gift className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "TAX":
        return <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "RAILROAD":
      case "UTILITY":
        return <Landmark className="w-6 h-6 sm:w-7 sm:h-7" />;
      default:
        return null;
    }
  };

  const renderCell = (cell: Ceil, position: string) => {
    const isCorner = cell.type.toUpperCase() === "CORNER";
    const isSide = position === "left" || position === "right";
    const playersOnCell = players.filter((p) => p.positionOnBoard === cell.id);

    const cellOwner = cellState?.find((c) => c.id === cell.id);
    const ownerPlayer = cellOwner
      ? players.find((p) => p.playerId === cellOwner.ownerId)
      : null;

    const userCell = cellState?.filter(
      (c) => c.ownerId === currentUser?.playerId
    );
    const isMortagedCell =
      isMortage &&
      userCell?.find((c) => c.id === cell.id) &&
      !cellOwner?.mortgaged;
    const cellIsMortaged = cellOwner ? cellOwner.mortgaged : false;

    const spanClass = isCorner
      ? "col-span-2 row-span-2"
      : isSide
      ? "col-span-2 row-span-1"
      : "col-span-1 row-span-2";

    const contentClass = isSide
      ? `flex flex-row-reverse grow items-center text-left mr-4`
      : `flex flex-col grow items-center text-center py-3 ${
          isCorner
            ? "justify-center"
            : position === "top"
            ? "justify-end"
            : "justify-start"
        }`;

    const nameClass = isSide
      ? `block font-medium leading-tight tracking-tight truncate text-base-content text-sm sm:text-[0.9rem] transform origin-center`
      : `block font-medium leading-tight tracking-tight truncate  max-w-[90%] text-base-content ${
          isCorner ? "text-lg" : "text-sm sm:text-[0.8rem]"
        }`;

    const colorStrip = cell.color ? (
      isSide ? (
        position === "left" ? (
          <div
            className={`absolute left-0 top-0 h-full w-3 ${getColorClass(
              cell.color as string
            )} rounded-l-lg`}
          />
        ) : (
          <div
            className={`absolute right-0 top-0 h-full w-3 ${getColorClass(
              cell.color as string
            )} rounded-r-lg`}
          />
        )
      ) : position === "top" ? (
        <div
          className={`absolute top-0 w-full h-3 ${getColorClass(
            cell.color as string
          )} rounded-t-lg`}
        />
      ) : (
        <div
          className={`absolute bottom-0 w-full h-3 ${getColorClass(
            cell.color as string
          )} rounded-b-lg`}
        />
      )
    ) : null;

    const playersContainerClass = isSide
      ? "absolute bottom-1 right-1 flex gap-0.5"
      : "absolute top-1 right-1 flex gap-0.5";

    const ownerClass = isSide
      ? position === "left"
        ? "absolute -right-2 flex gap-0.5"
        : "absolute -left-2 flex gap-0.5"
      : position === "top"
      ? "absolute -bottom-2 flex gap-0.5"
      : "absolute -top-3 flex gap-0.5";

    const houseClass = isSide
      ? position === "left"
        ? "absolute -right-12 flex gap-0.5 flex-col"
        : "absolute -left-12 flex gap-0.5 flex-col"
      : position === "top"
      ? "absolute -bottom-10 flex gap-0.5 flex-col justify-start"
      : "absolute -top-10 flex gap-0.5 flex-col-reverse justify-start";

    return (
      <motion.div
        key={cell.id}
        className={`relative ${spanClass} cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        onClick={
          isMortage ? () => handleMortage(cell.id) : () => setSelectedCell(cell)
        }
      >
        <Card
          className={`h-full w-full bg-base-300 hover:shadow-xl transition-all rounded-lg  flex ${
            isSide ? "flex-row" : "flex-col"
          } justify-between relative ${
            isMortagedCell && "border border-warning scale-105"
          }
          ${cellIsMortaged ? "opacity-65" : ""}
          `}
        >
          {/* Цветная полоска */}
          {colorStrip}

          {/* Основное содержимое */}
          <div className={contentClass}>
            {/* Иконка */}
            <div
              className={`flex items-center justify-center ${
                isSide ? "ml-1" : "mb-1"
              }`}
            >
              <div className="text-base-content opacity-80">
                {getIcon(cell.type.toUpperCase())}
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center w-full`}>
              {/* Название */}
              <span className={nameClass} title={cell.name}>
                {cell.name}
              </span>

              {/* Цена */}
              {cell.price ? (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-base-content/70 text-[0.7rem] font-medium mt-1 ${
                    isSide ? "self-center" : ""
                  } ${
                    cellOwner
                      ? isMortagedCell
                        ? "bg-stone-800"
                        : "bg-accent"
                      : "bg-base-200"
                  } `}
                >
                  <DollarSign className="w-3 h-3 text-success shrink-0" />
                  <span className="truncate">
                    {cellOwner
                      ? isMortagedCell
                        ? cell.price / 2
                        : cellOwner.currentRent
                      : cell.price}
                  </span>
                </div>
              ) : (
                !isCorner && <div className="h-7"></div>
              )}
            </div>

            {/* Владелец */}
            {cellOwner && (
              <div
                className={`w-4 h-4 mt-1 ${ownerClass} rounded-full ${getPlayerColorClass(
                  userColor[ownerPlayer?.position as keyof typeof userColor]
                )} border-2 border-base-100 shadow-sm`}
                title={`Владелец: ${ownerPlayer?.player.name}`}
              />
            )}
          </div>

          {/* Игроки на этой клетке */}
          {playersOnCell.length > 0 && (
            <div className={playersContainerClass}>
              {playersOnCell.map((player) => (
                <motion.div
                  key={player.id}
                  className={`w-6 h-6 rounded-full ${getPlayerColorClass(
                    userColor[player.position as keyof typeof userColor]
                  )} border-2 border-white shadow-md flex items-center justify-center text-white text-xs`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {player.player.name[0].toUpperCase()}
                </motion.div>
              ))}
            </div>
          )}

          {cellOwner && (
            <div className={`${houseClass} flex `}>
              <div className="flex gap-1">
                {[...Array(cellOwner.houses)].map((_, index) => (
                  <span key={index} className="status status-success" />
                ))}
              </div>
              <div className="flex h-4 gap-1">
                {[...Array(cellOwner.hotels)].map((_, index) => (
                  <span key={index} className="status status-info" />
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderHouses = (cell: CellState) => {
    if (
      cellState.find((c) => c.id === cell.id)?.ownerId !== currentUser?.playerId
    )
      return null;
    return (
      <div className="py-2 space-y-2">
        <h3 className="text-base-content font-semibold">Дома и отели</h3>
        <div className="flex space-x-1 items-center">
          {[...Array(cell.houses)].map((_, index) => (
            <House key={index} className="w-8 h-8 text-emerald-500" />
          ))}
          <Button
            variant="default"
            size="small"
            className="btn-soft"
            disabled={cell.houses === 4 || !isCurrentTurn}
            onClick={() => handleBuyHouse(cell.id, "house")}
          >
            <PlusSquareIcon className="w-8 h-8" />
            <span className="">Купить дом {cell.housePrice}$</span>
          </Button>
        </div>
        <div className="flex space-x-1 items-center">
          {[...Array(cell.hotels)].map((_, index) => (
            <Hotel key={index} className="w-8 h-8 text-blue-400" />
          ))}
          <Button
            variant="default"
            size="small"
            className=" btn-soft"
            disabled={cell.hotels === 3 || !isCurrentTurn || cell.houses < 4}
            onClick={() => handleBuyHouse(cell.id, "hotel")}
          >
            <PlusSquareIcon className="w-8 h-8" />
            <span className="">Купить отель {cell.hotelPrice}$ </span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-linear-to-br from-base-200 to-base-200 p-4 shadow-lg">
        <div className="grid grid-cols-13 grid-rows-11 gap-1 aspect-square w-full h-full">
          {/* Top (0–11) включая углы */}
          <div className="col-start-1 col-span-13 row-start-1 row-span-2 grid grid-cols-13 gap-1">
            {cells.slice(0, 11).map((cell) => renderCell(cell, "top"))}
          </div>

          {/* Left (32–39) включая углы 31 и 0 уже есть сверху/снизу, так что тут середина */}
          <div className="col-start-1 col-span-2 row-start-3 row-span-7 grid grid-rows-7 gap-2">
            {cells
              .slice(31, 40)
              .reverse()
              .map((cell) => renderCell(cell, "left"))}
          </div>

          {/* Center */}
          <div className="col-start-3 col-span-9 row-start-3 row-span-7 flex items-center justify-center">
            <div className="text-center space-y-4">
              <motion.div
                className="w-32 h-32 mx-auto bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Home className="w-16 h-16 text-white" />
              </motion.div>
              <div>
                <h3 className="text-base-content font-bold">МОНОПОЛИЯ</h3>
                <p className="text-sm text-base-content/60">Онлайн</p>
              </div>
            </div>
          </div>

          {/* Right (12–19) */}
          <div className="col-start-12 col-span-2 row-start-3 row-span-7 grid grid-rows-7 gap-2">
            {cells.slice(11, 20).map((cell) => renderCell(cell, "right"))}
          </div>

          {/* Bottom (20–31) включая углы */}
          <div className="col-start-1 col-span-13 row-start-10 row-span-2 grid grid-cols-13 gap-1">
            {cells
              .slice(20, 31)
              .reverse()
              .map((cell) => renderCell(cell, "bottom"))}
          </div>
        </div>
      </Card>

      {/* Cell Details Dialog */}
      <Dialog
        isOpen={!!selectedCell}
        onOpenChange={() => setSelectedCell(null)}
      >
        <div className="min-w-md">
          <div>
            <h2 className="flex items-center gap-2">
              {selectedCell && getIcon(selectedCell.type)}
              {selectedCell?.name}
            </h2>
            <span>
              {(selectedCell?.type.toUpperCase() === "RAILROAD" ||
                selectedCell?.type.toUpperCase() === "PROPERTY" ||
                selectedCell?.type.toUpperCase() === "UTILITY") && (
                <div className="space-y-3 pt-4">
                  {selectedCell.color && (
                    <div
                      className={`h-8 ${getColorClass(
                        selectedCell.color
                      )} rounded-lg`}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-base-content/60">Цена</p>
                      <p className="text-base-content">${selectedCell.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Аренда</p>
                      <p className="text-base-content">
                        $
                        {cellState?.find((c) => c.id === selectedCell.id)
                          ?.currentRent || selectedCell.rent}
                      </p>
                    </div>
                  </div>
                  {selectedCell && (
                    <div>
                      <p className="text-sm text-base-content/60">Владелец</p>

                      {(() => {
                        const ownerCell = cellState?.find(
                          (c) => c.id === selectedCell.id
                        );
                        const owner = ownerCell
                          ? players.find(
                              (p) => p.playerId === ownerCell.ownerId
                            )
                          : null;
                        console.log(
                          "Хозяин клетки",
                          owner,
                          `Сравнило ${selectedCell.id} с ${ownerCell?.ownerId}`
                        );

                        return (
                          <Badge
                            variant={owner ? "secondary" : "ghost"}
                            className={`mt-1 ${getPlayerColorClass(
                              userColor[
                                owner?.position as keyof typeof userColor
                              ]
                            )}`}
                          >
                            {owner ? owner.player.name : "Нету"}
                          </Badge>
                        );
                      })()}
                    </div>
                  )}

                  {cellState.find((c) => c.id === selectedCell.id) &&
                    renderHouses(
                      cellState.find((c) => c.id === selectedCell.id)!
                    )}

                  {(() => {
                    const cell = cellState.find(
                      (c) => c.id === selectedCell.id
                    );

                    if (
                      cell?.mortgaged &&
                      cell.ownerId === currentUser?.playerId
                    ) {
                      const unmortgageCost =
                        selectedCell.price &&
                        Math.floor((selectedCell.price / 2) * 1.2);
                      return (
                        <div className="w-full items-center justify-center flex">
                          <Button
                            disabled={!isCurrentTurn || currentUser?.jailed}
                            variant="success"
                            className="w-1/2"
                            size="medium"
                            onClick={() => handleUnMortage(selectedCell.id)}
                          >
                            Выкупить {unmortgageCost}$
                          </Button>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              {selectedCell?.type.toUpperCase() === "CORNER" && (
                <p className="pt-4">{selectedCell.name}</p>
              )}
            </span>
          </div>
        </div>
      </Dialog>
    </>
  );
}
