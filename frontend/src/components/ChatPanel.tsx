import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Volume2Icon, VolumeXIcon } from "lucide-react";
import Input from "./ui/input";
import Button from "./ui/button";
import Card from "./ui/card";

import { useApp } from "../context/AppContext";
import type { ChatMessageType } from "../utils/hook/useGameMessage";

interface ChatMessageProps {
  messages: ChatMessageType[];
  sendMessage: (text: string) => void;
}

export function ChatPanel({ messages, sendMessage }: ChatMessageProps) {
  const [newMessage, setNewMessage] = useState<string>("");
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const { user } = useApp();

  const chatContainer = useRef<HTMLDivElement>(null);
  const messageSound = useRef<HTMLAudioElement>(
    new Audio("/sounds/Notification_Sound.mp3")
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTo({
        top: chatContainer.current.scrollHeight,
        behavior: "smooth",
      });
    }

    if (messages.length > 0 && user?.id !== messages.at(-1)?.id && isSoundOn) {
      messageSound.current.currentTime = 0;
      messageSound.current.volume = 0.2;
      messageSound.current.play().catch(() => {});
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-sm h-[400px] flex flex-col py-6">
      <div className="px-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-foreground">
          <MessageCircle className="w-5 h-5" />
          Чат
        </h2>
        <div className="cursor-pointer p-1 hover:bg-base-300 rounded-2xl hover:scale-110 transition-all duration-300">
          {isSoundOn ? (
            <Volume2Icon
              onClick={() => setIsSoundOn(false)}
              className="w-5 h-5 "
            />
          ) : (
            <VolumeXIcon
              onClick={() => setIsSoundOn(true)}
              className="w-5 h-5 "
            />
          )}
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        {/* сообщения */}
        <div className="px-4">
          <div
            ref={chatContainer}
            className="space-y-3 pb-4 overflow-y-auto mb-4 h-55"
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <h3 className="text-md select-none">Пока нету сообщений</h3>
                </div>
              ) : (
                messages?.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      <p className="text-xs text-slate-500 mb-1">
                        {message.sender} • {message.timestamp}
                      </p>
                      <div
                        className={`inline-block rounded-lg px-3 py-2 ${
                          message.isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm wrap-break-word">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ввод */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button
              size="small"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
