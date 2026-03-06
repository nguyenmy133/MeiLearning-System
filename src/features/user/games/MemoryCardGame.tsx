import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy, Clock } from "lucide-react";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(): CardType[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  return shuffle(pairs).map((emoji, i) => ({
    id: i,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

export function MemoryCardGame() {
  const [cards, setCards] = useState<CardType[]>(createCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleFlip = useCallback((id: number) => {
    if (flipped.length === 2) return;
    const card = cards[id];
    if (card.isFlipped || card.isMatched) return;

    if (!running) setRunning(true);

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    const newFlipped = [...flipped, id];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      setMoves((m) => m + 1);
      if (newCards[a].emoji === newCards[b].emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, isMatched: true } : c
            )
          );
          setFlipped([]);
          setMatches((m) => {
            const next = m + 1;
            if (next === EMOJIS.length) {
              setRunning(false);
              setWon(true);
            }
            return next;
          });
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, isFlipped: false } : c
            )
          );
          setFlipped([]);
        }, 900);
      }
    }
  }, [cards, flipped, running]);

  const restart = () => {
    setCards(createCards());
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setRunning(false);
    setWon(false);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span><span className="font-bold text-foreground">{moves}</span> lượt</span>
          <span><span className="font-bold text-foreground">{matches}/{EMOJIS.length}</span> cặp</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {fmt(seconds)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={restart} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Chơi lại
        </Button>
      </div>

      {/* Win banner */}
      {won && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-700 dark:text-emerald-300">🎉 Xuất sắc! Bạn đã tìm hết tất cả cặp!</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
            {moves} lượt • {fmt(seconds)}
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            disabled={card.isMatched || won}
            className={`aspect-square rounded-xl text-2xl sm:text-3xl font-bold flex items-center justify-center transition-all duration-300 select-none ${
              card.isMatched
                ? "bg-emerald-100 dark:bg-emerald-900/30 opacity-60 scale-95"
                : card.isFlipped
                ? "bg-primary/10 border-2 border-primary scale-105"
                : "bg-secondary hover:bg-secondary/80 hover:scale-105 border-2 border-transparent"
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}
