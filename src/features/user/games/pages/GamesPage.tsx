import { useState, useEffect } from "react";
import { useGameTimeLimit } from "../useGameTimeLimit";
import { MemoryCardGame } from "../MemoryCardGame";
import { TypingSpeedGame } from "../TypingSpeedGame";
import { Game2048 } from "../Game2048";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Gamepad2,
  AlertTriangle,
  Ban,
  Trophy,
  Brain,
  Keyboard,
  Hash,
} from "lucide-react";

const GAMES = [
  {
    id: "memory",
    title: "Lật Thẻ Ghi Nhớ",
    description: "Tìm và ghép cặp các thẻ giống nhau. Rèn luyện trí nhớ và sự tập trung.",
    icon: Brain,
    emoji: "🃏",
    color: "from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    component: MemoryCardGame,
  },
  {
    id: "typing",
    title: "Tốc Độ Gõ Phím",
    description: "Đo tốc độ gõ phím WPM và độ chính xác của bạn. Tập gõ phím nhanh hơn!",
    icon: Keyboard,
    emoji: "⌨️",
    color: "from-sky-500/10 to-blue-500/10 border-sky-200 dark:border-sky-800",
    iconColor: "text-sky-600 dark:text-sky-400",
    component: TypingSpeedGame,
  },
  {
    id: "2048",
    title: "2048",
    description: "Trượt các ô số, ghép các số giống nhau để đạt tới ô 2048.",
    icon: Hash,
    emoji: "🔢",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    component: Game2048,
  },
];

const WARNING_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes remaining

export function GamesPage() {
  const { msRemaining, formatRemaining, formatPlayed, status, startPlaying, stopPlaying, isBlocked } =
    useGameTimeLimit();
  const [openGameId, setOpenGameId] = useState<string | null>(null);

  // Start/stop timer when a game is open
  useEffect(() => {
    if (openGameId) {
      startPlaying();
    } else {
      stopPlaying();
    }
  }, [openGameId, startPlaying, stopPlaying]);

  // Auto-close game if time runs out while playing
  useEffect(() => {
    if (isBlocked && openGameId) {
      setOpenGameId(null);
    }
  }, [isBlocked, openGameId]);

  const openGame = (id: string) => {
    if (!isBlocked) setOpenGameId(id);
  };

  const activeGame = GAMES.find((g) => g.id === openGameId);

  const remainingPercent = (msRemaining / (60 * 60 * 1000)) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Khu Giải Trí
          </h1>
          <p className="text-muted-foreground mt-1">
            Thư giãn sau những giờ học căng thẳng - chơi tối đa 60 phút/ngày.
          </p>
        </div>

        {/* Time status card */}
        <div className="flex-shrink-0">
          <Card className={`min-w-[160px] ${status === "blocked" ? "border-destructive/50" : status === "warning" ? "border-amber-400/50" : "border-border"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${status === "blocked" ? "text-destructive" : status === "warning" ? "text-amber-500" : "text-primary"}`} />
                <span className="text-xs text-muted-foreground font-medium">Thời gian còn lại</span>
              </div>
              <p className={`text-2xl font-display font-bold tabular-nums ${status === "blocked" ? "text-destructive" : status === "warning" ? "text-amber-500" : "text-foreground"}`}>
                {isBlocked ? "00:00" : formatRemaining}
              </p>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${status === "blocked" ? "bg-destructive" : status === "warning" ? "bg-amber-500" : "bg-primary"}`}
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Đã chơi: {formatPlayed}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Blocked alert */}
      {isBlocked && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <Ban className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive-foreground">
            <span className="font-semibold">Hết thời gian!</span> Bạn đã chơi đủ 60 phút hôm nay.
            Khu giải trí sẽ mở lại vào 00:00 ngày mai. Hãy quay lại học bài nhé! 📚
          </AlertDescription>
        </Alert>
      )}

      {/* Warning alert */}
      {status === "warning" && !isBlocked && (
        <Alert className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Còn {formatRemaining} để chơi hôm nay.</span>{" "}
            Hãy tranh thủ hoàn thành game và quay lại học bài nhé!
          </AlertDescription>
        </Alert>
      )}

      {/* Info badges */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
        <Trophy className="w-3.5 h-3.5" />
        <span>Điểm cao nhất được lưu trên thiết bị này</span>
        <span>•</span>
        <span>Giới hạn 60 phút mỗi ngày</span>
      </div>

      {/* Game cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Card
              key={game.id}
              className={`bg-gradient-to-br ${game.color} overflow-hidden hover:shadow-md transition-all ${isBlocked ? "opacity-60" : "hover:-translate-y-0.5 cursor-pointer"}`}
              onClick={() => openGame(game.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{game.emoji}</div>
                  <Icon className={`w-5 h-5 ${game.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{game.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{game.description}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={isBlocked}
                  onClick={(e) => { e.stopPropagation(); openGame(game.id); }}
                >
                  {isBlocked ? "Đã hết thời gian" : "Chơi ngay"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Game Dialog */}
      <Dialog open={!!openGameId} onOpenChange={(open) => { if (!open) setOpenGameId(null); }}>
        <DialogContent className="max-w-lg w-full" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{activeGame?.emoji} {activeGame?.title}</span>
              {/* Inline time badge */}
              <Badge
                variant={status === "blocked" ? "destructive" : status === "warning" ? "outline" : "secondary"}
                className={`text-xs tabular-nums ${status === "warning" ? "border-amber-400 text-amber-600" : ""}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatRemaining}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Warning inside dialog */}
          {status === "warning" && (
            <Alert className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/10 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                Còn <span className="font-bold">{formatRemaining}</span> — game sẽ tự đóng khi hết giờ.
              </AlertDescription>
            </Alert>
          )}

          {activeGame && <activeGame.component />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
