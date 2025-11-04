import * as IO from "socket.io";

declare module "socket.io" {
  interface SocketData {
    user: {
      id: string;
    };
  }
}