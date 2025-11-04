

export function formatDate(date: string) {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
    };
    const formattedDate = new Date(date).toLocaleDateString("ru-RU", options);
    return formattedDate;
}
  

export function formatTime(date: string) {
    const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
    };
    const formattedTime = new Date(date).toLocaleTimeString("ru-RU", options);
    return formattedTime;
}