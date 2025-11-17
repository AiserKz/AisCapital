import { useEffect, useRef, useState } from "react";

export function usePendingTimer() {
  const [timer, setTimer] = useState<number>(0);
  const timeout = useRef<number | null>(null);

  const startTimer = (expiresAt: number) => {
    if (timeout.current) clearInterval(timeout.current);
    if (expiresAt === 0) {
      setTimer(0);
      return;
    }

    timeout.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining <= 0 && timeout.current) clearInterval(timeout.current);
    }, 1000);
  };

  useEffect(
    () => () => {
      if (timeout.current) clearInterval(timeout.current);
    },
    []
  );

  return { timer, startTimer };
}
