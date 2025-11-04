
export const safeSocket = (handler: any) => {
    return async (data: any, callback: any) => {
        try {
            await handler(data, callback);
        } catch (err) {
            console.error("Socket error:", err);
            callback?.({ success: false, message: "Ошибка сервера" });
        }
    };
}