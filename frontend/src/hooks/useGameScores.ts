/**
 * useGameScores — persists game scores to localStorage so they survive page refreshes.
 * Works for all games. Also posts to backend if user is logged in.
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NODE_API_URL } from '../config';

export interface GameScore {
  score: number;
  date: string;
  moves?: number;
}

export interface GameHistory {
  best: number;
  history: GameScore[];
}

const STORAGE_KEY = 'infinity_game_scores';

function readStorage(): Record<string, GameHistory> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, GameHistory>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useGameScores(gameName: string) {
  const [data, setData] = useState<GameHistory>(() => {
    const all = readStorage();
    return all[gameName] ?? { best: 0, history: [] };
  });

  // Re-read when gameName changes
  useEffect(() => {
    const all = readStorage();
    setData(all[gameName] ?? { best: 0, history: [] });
  }, [gameName]);

  const submitScore = useCallback(async (score: number, moves?: number) => {
    setData(prev => {
      const newEntry: GameScore = { score, date: new Date().toISOString(), moves };
      const newHistory = [newEntry, ...prev.history].slice(0, 20); // keep last 20
      const newBest = Math.max(prev.best, score);
      const updated = { best: newBest, history: newHistory };

      // Persist to localStorage
      const all = readStorage();
      all[gameName] = updated;
      writeStorage(all);

      return updated;
    });

    // Also post to backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          `${NODE_API_URL}/api/game/submit`,
          { game: gameName, score },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        // Silent fail — local storage already saved
      }
    }
  }, [gameName]);

  const resetScores = useCallback(() => {
    const all = readStorage();
    delete all[gameName];
    writeStorage(all);
    setData({ best: 0, history: [] });
  }, [gameName]);

  return { best: data.best, history: data.history, submitScore, resetScores };
}

// Get all game scores for the dashboard
export function getAllGameScores(): Record<string, GameHistory> {
  return readStorage();
}
