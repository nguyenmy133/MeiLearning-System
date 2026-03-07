import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "game_time_v1";
const DAILY_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const WARNING_MS = 45 * 60 * 1000; // warn at 45 minutes played (15 min left)

interface StoredData {
    date: string;
    msPlayed: number;
}

function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

function getStoredData(): StoredData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { date: "", msPlayed: 0 };
        return JSON.parse(raw) as StoredData;
    } catch {
        return { date: "", msPlayed: 0 };
    }
}

function saveStoredData(data: StoredData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTodayMsPlayed(): number {
    const stored = getStoredData();
    if (stored.date !== getTodayKey()) return 0;
    return stored.msPlayed;
}

function addMsPlayed(ms: number) {
    const stored = getStoredData();
    const today = getTodayKey();
    const current = stored.date === today ? stored.msPlayed : 0;
    saveStoredData({ date: today, msPlayed: Math.min(current + ms, DAILY_LIMIT_MS) });
}

export type TimeLimitStatus = "ok" | "warning" | "blocked";

export function useGameTimeLimit() {
    const [msPlayed, setMsPlayed] = useState<number>(getTodayMsPlayed);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastTickRef = useRef<number>(Date.now());

    // Tick every second while playing
    useEffect(() => {
        if (isPlaying) {
            lastTickRef.current = Date.now();
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = now - lastTickRef.current;
                lastTickRef.current = now;
                addMsPlayed(elapsed);
                const newMs = getTodayMsPlayed();
                setMsPlayed(newMs);
                if (newMs >= DAILY_LIMIT_MS) {
                    setIsPlaying(false);
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying]);

    const startPlaying = useCallback(() => {
        if (getTodayMsPlayed() < DAILY_LIMIT_MS) {
            setIsPlaying(true);
        }
    }, []);

    const stopPlaying = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const msRemaining = Math.max(0, DAILY_LIMIT_MS - msPlayed);
    const status: TimeLimitStatus =
        msRemaining === 0 ? "blocked" : msPlayed >= WARNING_MS ? "warning" : "ok";

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return {
        msPlayed,
        msRemaining,
        status,
        isPlaying,
        startPlaying,
        stopPlaying,
        formatRemaining: formatTime(msRemaining),
        formatPlayed: formatTime(msPlayed),
        isBlocked: msRemaining === 0,
    };
}
