import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "../formatDate";

type LogType = { message: string; type: "CHANCE" | "EVENT" };
export type ChatMessageType = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
};

export function useGameMessage(userId?: string) {
  const [logs, setLogs] = useState<LogType[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const messageTimeout = useRef<number | null>(null);

  const writeLogs = async (message: string, type: "CHANCE" | "EVENT") => {
    setLogs((prev) => {
      let newLogs = [{ message, type }, ...prev];

      if (newLogs.length > 20) {
        newLogs = newLogs.slice(0, 20);
      }

      return newLogs;
    });
  };

  const onGameMessage = (msg: {
    playerId: string;
    text: string;
    type: "CHANCE" | "EVENT";
  }) => {
    if (msg.type === "CHANCE") writeLogs(msg.text, "CHANCE");
    else {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
      writeLogs(msg.text, "EVENT");
      setMessage(msg.text);
      messageTimeout.current = window.setTimeout(() => setMessage(null), 7000);
    }
  };

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
    };
  }, []);

  const addChatMessage = (data: {
    playerId: string;
    username: string;
    text: string;
    time: number;
  }) => {
    const newMessage: ChatMessageType = {
      id: data.playerId,
      sender: data.username,
      text: data.text,
      timestamp: formatDateTime(data.time),
      isOwn: data.playerId === userId,
    };
    setChatMessages((prev) => {
      let newMessages = [...prev, newMessage];
      if (newMessages.length > 20) newMessages = newMessages.slice(-20);
      return newMessages;
    });
  };

  const clearMessage = () => setMessage(null);

  return {
    logs,
    message,
    chatMessages,
    onGameMessage,
    addChatMessage,
    clearMessage,
  };
}
