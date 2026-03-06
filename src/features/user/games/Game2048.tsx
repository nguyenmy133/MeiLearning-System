import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy } from "lucide-react";

type Grid = number[][];

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function addRandomTile(g: Grid): Grid {
  const empty: [number, number][] = [];
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]); }));
  if (empty.length === 0) return g;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = g.map((row) => [...row]);
  next[r][c] = Math.random() < 0.85 ? 2 : 4;
  return next;
}

function initGrid(): Grid {
  return addRandomTile(addRandomTile(emptyGrid()));
}

function slideRow(row: number[]): [number[], number] {
  const filtered = row.filter((v) => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return [merged, score];
}

function moveLeft(g: Grid): [Grid, number] {
  let totalScore = 0;
  const next = g.map((row) => {
    const [newRow, score] = slideRow(row);
    totalScore += score;
    return newRow;
  });
  return [next, totalScore];
}

function rotateGrid(g: Grid): Grid {
  return g.map((_, ci) => g.map((row) => row[ci]).reverse());
}

function move(g: Grid, dir: "left" | "right" | "up" | "down"): [Grid, number] {
  let rotations = 0;
  if (dir === "right") rotations = 2;
  else if (dir === "up") rotations = 3;
  else if (dir === "down") rotations = 1;

  let rotated = g;
  for (let i = 0; i < rotations; i++) rotated = rotateGrid(rotated);
  const [moved, score] = moveLeft(rotated);
  for (let i = 0; i < (4 - rotations) % 4; i++) moved && (rotated = rotateGrid(moved));
  return [rotated, score];
}

function gridsEqual(a: Grid, b: Grid): boolean {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]));
}

function isGameOver(g: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === 0) return false;
      if (c + 1 < 4 && g[r][c] === g[r][c + 1]) return false;
      if (r + 1 < 4 && g[r][c] === g[r + 1][c]) return false;
    }
  }
  return true;
}

const TILE_COLORS: Record<number, string> = {
  0: "bg-secondary/50 text-transparent",
  2: "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100",
  4: "bg-amber-200 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100",
  8: "bg-orange-300 dark:bg-orange-700 text-white",
  16: "bg-orange-400 dark:bg-orange-600 text-white",
  32: "bg-red-400 dark:bg-red-600 text-white",
  64: "bg-red-500 dark:bg-red-500 text-white",
  128: "bg-yellow-400 dark:bg-yellow-500 text-white",
  256: "bg-yellow-500 dark:bg-yellow-400 text-white",
  512: "bg-emerald-400 dark:bg-emerald-500 text-white",
  1024: "bg-emerald-600 dark:bg-emerald-400 text-white",
  2048: "bg-primary text-primary-foreground",
};

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(initGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => parseInt(localStorage.getItem("b2048") ?? "0", 10));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const applyMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (gameOver) return;
    setGrid((prev) => {
      const [moved, gainedScore] = move(prev, dir);
      if (gridsEqual(prev, moved)) return prev;
      const next = addRandomTile(moved);
      setScore((s) => {
        const newScore = s + gainedScore;
        setBest((b) => {
          const best = Math.max(b, newScore);
          localStorage.setItem("b2048", String(best));
          return best;
        });
        return newScore;
      });
      if (!won && next.flat().includes(2048)) setWon(true);
      if (isGameOver(next)) setGameOver(true);
      return next;
    });
  }, [gameOver, won]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        applyMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [applyMove]);

  // Touch swipe support
  const touchStart = { x: 0, y: 0 };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      applyMove(dx > 0 ? "right" : "left");
    } else {
      applyMove(dy > 0 ? "down" : "up");
    }
  };

  const restart = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Score bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="bg-secondary rounded-lg px-3 py-1.5 text-center min-w-[72px]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Điểm</p>
            <p className="text-lg font-bold leading-none">{score}</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-1.5 text-center min-w-[72px]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cao nhất</p>
            <p className="text-lg font-bold leading-none">{best}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={restart} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Chơi lại
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Dùng phím mũi tên ← → ↑ ↓ hoặc vuốt màn hình cảm ứng
      </p>

      {/* Grid */}
      <div
        className="bg-secondary/70 rounded-xl p-2 sm:p-3 aspect-square relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 h-full">
          {grid.flat().map((val, i) => (
            <div
              key={i}
              className={`rounded-lg flex items-center justify-center font-bold transition-colors duration-75 text-sm sm:text-lg ${
                TILE_COLORS[val] ?? "bg-primary text-primary-foreground"
              }`}
            >
              {val !== 0 ? val : ""}
            </div>
          ))}
        </div>

        {/* Game over / Win overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            {won ? (
              <>
                <Trophy className="w-10 h-10 text-amber-500" />
                <p className="text-xl font-display font-bold text-foreground">🎉 Bạn đạt 2048!</p>
              </>
            ) : (
              <p className="text-xl font-display font-bold text-foreground">💀 Game Over!</p>
            )}
            <Badge variant="outline">Điểm: {score}</Badge>
            <Button onClick={restart} size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
