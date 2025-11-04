import apiFetch from "./apiFetch"

export default class ServerAPI {
    private api;

    constructor(api = apiFetch) {
        this.api = api
    }

    async getRooms() {
        try {
        const res = await this.api.get("/api/rooms");
        return res.data;
        } catch {
        return [];
        }
    }

    async getLeaderboard() {
        try {
        const res = await this.api.get("/api/player/leaderboard");
        return res.data;
        } catch {
        return [];
        }
    }

    async getMe() {
        try {
        const res = await this.api.get("/api/auth/me");
        return res.data;
        } catch {
        return null;
        }
    }
    
}

