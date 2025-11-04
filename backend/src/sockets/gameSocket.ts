import  { Server, Socket } from "socket.io";
import path from "path";
import url, { pathToFileURL } from "url";
import { readdirSync } from "fs";

export const gameSocket = async (io: Server, socket: Socket) => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const handlersPath = path.join(__dirname, 'game/handlers');

    const handlerFiles = readdirSync(handlersPath).filter(f => f.endsWith('.js'));

    for (const file of handlerFiles) {
        const fullPath = path.join(handlersPath, file);
        const fileUrl = pathToFileURL(fullPath).href;

        import(fileUrl)
            .then((module) => {
                const handlerFn = Object.values(module).find(
                    (fn) => typeof fn === "function" && fn.name.startsWith("handle")
                );
                if (typeof handlerFn === "function") {
                    handlerFn(io, socket);
                    // console.log(`✅Загружен хендлер${file}`);
                } else {
                    console.warn(`⚠️ В файле ${file} не найден экспорт handle*`);
                }
            })
            .catch((err) => {
                console.error(`❌Не удалось загрузить хендлер: ${file}`, err);
            })
    }

}