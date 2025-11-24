import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import Label from "../components/ui/label";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { User, Lock, Mail, LogIn, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthPage() {
  const { fetchData } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [name, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    status: number;
    message: string;
  } | null>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

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
        fetchStatus(res.data);
      } else {
        localStorage.setItem("accessToken", res.data.accessToken);
        fetchStatus({ status: 200, message: "Успешно" });
        fetchData();
      }
    } catch (err: any) {
      fetchStatus(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = (data: { status: number; message: string }) => {
    setStatus({
      status: data?.status ?? 500,
      message: data?.message ?? "Произошла ошибка",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-base-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-none bg-base-100/80 backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {mode === "login" ? "С возвращением!" : "Создать аккаунт"}
            </h1>
            <p className="text-base-content/60">
              {mode === "login"
                ? "Введите свои данные для входа"
                : "Заполните форму для регистрации"}
            </p>
          </div>

          <div className="flex p-1 bg-base-200 rounded-lg mb-6">
            <Button
              variant={mode === "login" ? "default" : "ghost"}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === "login"
                  ? "shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
              }`}
              onClick={() => setMode("login")}
            >
              Вход
            </Button>
            <Button
              variant={mode === "register" ? "default" : "ghost"}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === "register"
                  ? " shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
              }`}
              onClick={() => setMode("register")}
            >
              Регистрация
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10" />
                <Input
                  id="username"
                  value={name}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Логин"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm text-center p-2 rounded-md ${
                  status.status === 200
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {status.message}
              </motion.div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                size="large"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" /> Войти
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Зарегистрироваться
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
