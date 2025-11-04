import { Router } from "express";
import { getPlayerById, updatePlayer, getLeaderboard, recordGameResult } from "../services/playerService.js";


const playerRoutes = Router();

// Лидерборд
playerRoutes.get('/leaderboard', async (req, res) => {
    try {
        const top = await getLeaderboard(20);
        res.json(top);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
})

// Получить профиль
playerRoutes.get('/:id', async (req, res) => {
    try {
        const player = await getPlayerById(req.params.id);
        if (!player) return res.status(404).json({ message: 'Игрок не найден' });
        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Обновить профиль (частичный)
playerRoutes.put('/:id', async (req, res) => {
    try {
        const updated  = await updatePlayer(req.params.id, req.body);
        if (!updated ) return res.status(404).json({ message: 'Игрок не найден' });
        res.json(updated );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Записать результат матча
playerRoutes.post('/:id/game-result', async (req, res) => {
    try {
        const { outcome, xpGained, eloDelta } = req.body;
        const updated = await recordGameResult(req.params.id, outcome, xpGained ?? 0, eloDelta ?? 0);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});



export default playerRoutes;