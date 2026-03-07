import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Zap } from "lucide-react";

const PASSAGES = [
  "Học hành là chìa khóa mở ra cánh cửa tương lai tươi sáng.",
  "Kiên trì và nỗ lực là bí quyết thành công của mọi người.",
  "Mỗi ngày đi học là một cơ hội để mở rộng tri thức bản thân.",
  "Đọc sách mỗi ngày giúp bạn học hỏi được nhiều điều bổ ích.",
  "Tập trung vào bài học giúp bạn ghi nhớ tốt hơn và hiểu sâu hơn.",
  "Sự chăm chỉ và kỷ luật tốt luôn mang lại thành quả xứng đáng.",
];

export function TypingSpeedGame() {
  const [passage] = useState(
    () => PASSAGES[Math.floor(Math.random() * PASSAGES.length)]
  );
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageWords = passage.trim().split(" ");

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (!started && val.length > 0) setStarted(true);
      setInput(val);

      // Calculate accuracy
      let correct = 0;
      for (let i = 0; i < val.length; i++) {
        if (val[i] === passage[i]) correct++;
      }
      const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
      setAccuracy(acc);

      // Check if done (trimming trailing space/newline)
      if (val.trim() === passage.trim()) {
        setFinished(true);
        const mins = seconds / 60 || 1 / 60;
        const wordsTyped = val.trim().split(/\s+/).length;
        setWpm(Math.round(wordsTyped / mins));
      }
    },
    [started, passage, seconds]
  );

  const restart = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setSeconds(0);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Render the passage with character-level coloring
  const renderPassage = () => {
    return passage.split("").map((char, i) => {
      let cls = "text-muted-foreground";
      if (i < input.length) {
        cls = input[i] === char ? "text-emerald-600 dark:text-emerald-400" : "text-destructive bg-destructive/10 rounded";
      } else if (i === input.length) {
        cls = "text-foreground underline decoration-primary decoration-2 underline-offset-2";
      }
      return (
        <span key={i} className={cls}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {finished ? wpm : "—"} <span className="text-xs">WPM</span>
          </span>
          <span>
            Độ chính xác:{" "}
            <span className={`font-bold ${accuracy >= 95 ? "text-emerald-600" : accuracy >= 80 ? "text-amber-600" : "text-destructive"}`}>
              {accuracy}%
            </span>
          </span>
          <span>{fmt(seconds)}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={restart} className="gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Thử lại
        </Button>
      </div>

      {/* Passage display */}
      <div className="p-4 bg-secondary/50 rounded-xl font-mono text-base leading-relaxed select-none tracking-wide border">
        {renderPassage()}
      </div>

      {/* Input area */}
      {!finished ? (
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          placeholder="Bắt đầu gõ để bắt đầu bài kiểm tra..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border bg-background text-foreground text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-5 text-center space-y-2">
          <p className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-300">
            🎉 {wpm} WPM
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              Độ chính xác: {accuracy}%
            </Badge>
            <Badge variant="secondary">Thời gian: {fmt(seconds)}</Badge>
          </div>
          <Button onClick={restart} className="mt-2 gap-2">
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}
