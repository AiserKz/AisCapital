import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import Label from "../components/ui/label";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("ais@gmail.com");
  const [name, setUsername] = useState<string>("Aiser");
  const [password, setPassword] = useState<string>("2002");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint =
      API_BASE_URL +
      (mode === "login" ? "/api/auth/login" : "/api/auth/register");

    try {
      const res = await axios.post(
        endpoint,
        {
          name,
          password,
          email,
        },
        {
          withCredentials: true,
        }
      );

      if (!res.status || res.status >= 400) {
        console.log(res);
        setMessage(res.data.message || "Ошибка сервера");
      } else {
        console.log(res);
        localStorage.setItem("accessToken", res.data.accessToken);
        setMessage(res.data.message);

        setTimeout(() => (window.location.href = "/"), 600);
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[70vh] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-base-content">
              {mode === "login" ? "Вход" : "Регистрация"}
            </h2>
            <div className="btn-group">
              <Button
                size="small"
                variant={mode === "login" ? "default" : "ghost"}
                onClick={() => setMode("login")}
              >
                Войти
              </Button>
              <Button
                size="small"
                variant={mode === "register" ? "default" : "ghost"}
                onClick={() => setMode("register")}
              >
                Регистрация
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={name}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите username"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>

            {message && (
              <div className="text-sm text-center text-red-500">{message}</div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading
                  ? "Отправка..."
                  : mode === "login"
                  ? "Войти"
                  : "Зарегистрироваться"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUsername("");
                  setPassword("");
                  setMessage(null);
                }}
              >
                Очистить
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
