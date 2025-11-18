import type { PlayerInRoomType, RoomStateType } from "../../types/types";
import { motion } from "framer-motion";
import Button from "../ui/button";
import { useApp } from "../../context/AppContext";

interface CurrentPaymentProps {
  roomState: RoomStateType;
  currentUser: PlayerInRoomType | null;
  payRent: () => void;
  setIsMortage: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CurrentPayment({
  roomState,
  currentUser,
  payRent,
  setIsMortage,
}: CurrentPaymentProps) {
  const { user } = useApp();
  const isMyPayment = roomState.currentPayment?.payerId === user?.id;

  const currentPayment = roomState.currentPayment!;
  const currentRoom = roomState.currentRoom!;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
    >
      <div className="bg-base-200 shadow-md border border-base-300 p-6 rounded-2xl w-[320px] text-center relative shadow-warning/30">
        <h3 className="text-lg font-semibold text-base-content mb-3">
          💸 Оплата ренты
        </h3>

        <p className="text-base text-base-content/80">
          {isMyPayment ? (
            <>
              Вы должны заплатить{" "}
              <span className="text-primary font-bold text-lg">
                {currentPayment.rent}$
              </span>
            </>
          ) : (
            <>
              Игрок{" "}
              <span className="font-semibold text-base-content">
                {
                  currentRoom.players.find(
                    (p) => p.playerId === currentPayment.payerId
                  )?.player.name
                }
              </span>{" "}
              должен заплатить{" "}
              <span className="text-primary font-bold text-lg">
                {currentPayment.rent}$
              </span>
            </>
          )}
        </p>

        <p className="text-sm text-base-content/70 mt-2">
          Владелец:{" "}
          <span className="font-medium text-base-content">
            {currentRoom.players.find(
              (p) => p.playerId === currentPayment.ownerId
            )?.player.name || "Неизвестный игрок"}
          </span>
        </p>

        <p className="text-xs text-base-content/50 mt-2">
          Клетка №{currentPayment.cellId}
        </p>
        {isMyPayment && (
          <div className="mt-5 flex justify-center gap-3">
            <Button
              variant="ghost"
              size="medium"
              className="flex-1"
              onClick={() => setIsMortage(true)}
            >
              Заложить
            </Button>
            <Button
              disabled={currentUser?.money! < currentPayment.rent}
              variant="default"
              size="medium"
              className="flex-1"
              onClick={() => payRent()}
            >
              Оплатить
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
