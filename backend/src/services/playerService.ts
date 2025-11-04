import { prisma } from "../prisma.js";
import type { Player } from '@prisma/client';


// Вычисление винрейта игрока
export function calcWinRate(wins: number, totalGames: number): number {
    if (totalGames === 0) return 0;

    const rate = (wins / totalGames) * 100;

    return Math.round(rate * 10) / 10;
}

//  *Проверка повышения уровня:
//  если currentXp >= nextLevelXp => level++ и nextLevelXp *= 1.5 
export function checkLevelUp(player: Player) {
    let {currentXp, nextLevelXp, level } =player;
    const updates: Partial<Player> = {};

    while (currentXp >= nextLevelXp) {
        currentXp -= nextLevelXp;
        level += 1;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
    }

    updates.currentXp = currentXp;
    updates.level = level;
    updates.nextLevelXp = nextLevelXp;

    return updates;
}

// Получить игрока по id
export async function getPlayerById(id:string) {
    return prisma.player.findUnique({ where: { id },       
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            level: true,
            totalGames: true,
            wins: true,
            winRate: true,
            currentXp: true,
            nextLevelXp: true,
            elo: true,
            createdAt: true,
            lastSeen: true,
            status: true
        } });
}


// Создать игрока
export async function createPlayer(data: {
    email: string;
    name: string;
    password: string;
}) {
    return prisma.player.create({
        data: {
            email: data.email,
            name: data.name,
            password: data.password
        }
    })
}

export async function getPlayerByName(name: string) {
    return prisma.player.findFirst({ where: { name } });  
}

// Обновить игрока
export async function updatePlayer(id:string, patch: Partial<Player>) {
    return prisma.player.update({
        where: {id},
        data: patch
    });
}
//  * Запись результата матча:
//  * outcome: 'win' | 'loss' | 'draw' 
//  * xpGained: число XP, заработанное игроком за матч
export async function recordGameResult(playerId: string, outcome: 'win' | 'lose' | 'draw', xpGained = 0,  eloDelta = 0) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Пользователь не найден');

    const totalGames = player.totalGames + 1;
    const wins = player.wins + (outcome === 'win' ? 1 : 0);
    const winRate = calcWinRate(wins, totalGames);
    let currentXp = player.currentXp + xpGained;
    let nextLevelXp = player.nextLevelXp;
    let level = player.level;
    

    while (currentXp >= nextLevelXp) {
        currentXp -= nextLevelXp;
        level += 1;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
    }

    const updated = await prisma.player.update({
        where: { id: playerId },
        data: {
            totalGames,
            wins,
            winRate,
            currentXp,
            nextLevelXp,
            level,
            elo: player.elo + eloDelta,
            lastSeen: new Date(),
        }
    });

    return updated;
}   

// Лидерборд — топ N по elo (или wins)
export async function getLeaderboard(limit: number = 20) {
    return prisma.player.findMany({
        orderBy: { level: 'desc' },
        take: limit,
        select: {
            id: true,
            name: true,
            totalGames: true,
            avatar: true,
            level: true,
            wins: true,
            winRate: true,
            elo: true,
        },
    });
}