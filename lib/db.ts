import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export type Team = {
    id: string;
    name: string;
    players: string[];
    card: {
        id: string;
        label: string;
        completed: boolean;
        completedAt?: number; // Timestamp when marked
    }[];
    registeredAt: number;
    startTime?: number; // Per-team start time
    endTime?: number;   // When they finished or stopped
    completedAt?: number; // Kept for backward compat/logic, same as endTime if win
};

export type GameState = {
    duration: number; // 12 minutes in ms
};

export type Database = {
    teams: Team[];
    gameState: GameState;
};

const INITIAL_DB: Database = {
    teams: [],
    gameState: {
        duration: 12 * 60 * 1000,
    },
};

export async function getDB(): Promise<Database> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        try {
            await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
            await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
            return INITIAL_DB;
        } catch (e) {
            console.error("Failed to initialize DB", e);
            return INITIAL_DB;
        }
    }
}

export async function saveDB(db: Database) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error("Failed to save DB", error);
    }
}
