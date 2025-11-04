import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import Input from "./ui/input";
import Button from "./ui/button";
import Card from "./ui/card";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Александр",
      text: "Удачи всем!",
      timestamp: "14:32",
      isOwn: false,
    },
    {
      id: "2",
      sender: "Мария",
      text: "Готова к игре 🎮",
      timestamp: "14:33",
      isOwn: false,
    },
    {
      id: "3",
      sender: "Вы",
      text: "Поехали!",
      timestamp: "14:34",
      isOwn: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "Вы",
        text: newMessage,
        timestamp: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-sm h-[400px] flex flex-col py-6">
      <div className="px-6">
        <h2 className="flex items-center gap-2 text-foreground">
          <MessageCircle className="w-5 h-5" />
          Чат
        </h2>
      </div>
      <div className="flex flex-col overflow-hidden">
        {/* сообщения */}
        <div className="px-4">
          <div className="space-y-3 pb-4 overflow-y-auto mb-4 h-55">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
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
                      <p className="text-sm wrap-break-word">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
