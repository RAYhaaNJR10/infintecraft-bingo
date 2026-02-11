import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// ── Types ──────────────────────────────────────────────

export type Team = {
    id: string;
    name: string;
    players: string[];
    card: {
        id: string;
        label: string;
        completed: boolean;
        completedAt?: number;
    }[];
    registeredAt: number;
    startTime?: number;
    endTime?: number;
    completedAt?: number;
};

export type GameState = {
    duration: number;
    isStarted?: boolean;
    startTime?: number | null;
};

// ── Collections ────────────────────────────────────────

const teamsCol = () => collection(getFirestoreDB(), 'teams');
const gameStateDoc = () => doc(getFirestoreDB(), 'gameState', 'config');

// ── Team Operations ────────────────────────────────────

export async function getTeams(): Promise<Team[]> {
    const snapshot = await getDocs(teamsCol());
    return snapshot.docs.map((d) => d.data() as Team);
}

export async function getTeam(id: string): Promise<Team | null> {
    const snap = await getDoc(doc(getFirestoreDB(), 'teams', id));
    return snap.exists() ? (snap.data() as Team) : null;
}

export async function saveTeam(team: Team): Promise<void> {
    // Remove undefined values (Firestore doesn't accept undefined)
    const clean = JSON.parse(JSON.stringify(team));
    await setDoc(doc(getFirestoreDB(), 'teams', team.id), clean);
}

export async function deleteTeamDoc(id: string): Promise<void> {
    await deleteDoc(doc(getFirestoreDB(), 'teams', id));
}

// ── Game State Operations ──────────────────────────────

const DEFAULT_GAME_STATE: GameState = {
    duration: 12 * 60 * 1000, // 12 minutes
    isStarted: false,
    startTime: null,
};

export async function getGameState(): Promise<GameState> {
    const snap = await getDoc(gameStateDoc());
    if (snap.exists()) return snap.data() as GameState;
    // Initialize if not present
    await setDoc(gameStateDoc(), DEFAULT_GAME_STATE);
    return DEFAULT_GAME_STATE;
}

export async function saveGameState(state: GameState): Promise<void> {
    const clean = JSON.parse(JSON.stringify(state));
    await setDoc(gameStateDoc(), clean);
}

// ── Admin Password ─────────────────────────────────────

const adminDoc = () => doc(getFirestoreDB(), 'config', 'admin');

const DEFAULT_ADMIN_PASSWORD = '691306';

export async function getAdminPassword(): Promise<string> {
    const snap = await getDoc(adminDoc());
    if (snap.exists()) return snap.data().password as string;
    // Seed default password if not set
    await setDoc(adminDoc(), { password: DEFAULT_ADMIN_PASSWORD });
    return DEFAULT_ADMIN_PASSWORD;
}

export async function setAdminPassword(password: string): Promise<void> {
    await setDoc(adminDoc(), { password });
}
