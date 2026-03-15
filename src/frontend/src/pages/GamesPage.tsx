import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GameType, useAddScore, useGetTopScores } from "../hooks/useQueries";

// --- Memory Game ---
const EMOJIS = ["🚀", "🤖", "💡", "🎨", "🔮", "🌈", "⚡", "🎯"];

interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function MemoryGame() {
  const initCards = (): MemoryCard[] => {
    const pairs = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    return pairs;
  };

  const [cards, setCards] = useState<MemoryCard[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [showWinDialog, setShowWinDialog] = useState(false);
  const { data: scores } = useGetTopScores(GameType.memoryGame);
  const { mutate: addScore } = useAddScore();

  const flip = (id: number) => {
    if (selected.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newSelected = [...selected, id];
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
    );
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected.map((sid) => cards.find((c) => c.id === sid)!);
      if (a.emoji === b.emoji) {
        setCards((prev) =>
          prev.map((c) =>
            newSelected.includes(c.id) ? { ...c, matched: true } : c,
          ),
        );
        setSelected([]);
        setTimeout(() => {
          setCards((prev) => {
            const allMatched = prev.every(
              (c) => c.matched || newSelected.includes(c.id),
            );
            if (allMatched) {
              setShowWinDialog(true);
            }
            return prev;
          });
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
        }, 800);
      }
    }
  };

  const reset = () => {
    setCards(initCards());
    setSelected([]);
    setMoves(0);
    setShowWinDialog(false);
  };

  const submitScore = () => {
    if (!playerName.trim()) return;
    addScore(
      {
        playerName: playerName.trim(),
        scoreValue: BigInt(moves),
        gameType: GameType.memoryGame,
      },
      {
        onSuccess: () => {
          toast.success(`Score saved! ${moves} moves, ${playerName}!`);
          setShowWinDialog(false);
        },
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-foreground">
          Moves: <span className="text-accent text-xl">{moves}</span>
        </p>
        <Button
          data-ocid="games.memory.secondary_button"
          variant="outline"
          onClick={reset}
          className="rounded-2xl font-bold border-2"
        >
          🔄 New Game
        </Button>
      </div>

      <div
        className="grid grid-cols-4 gap-2 sm:gap-3 mb-6"
        style={{ maxWidth: 340 }}
      >
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            data-ocid={`games.memory.item.${i + 1}`}
            onClick={() => flip(card.id)}
            className={`aspect-square rounded-2xl text-3xl font-bold border-2 transition-all ${
              card.matched
                ? "bg-fun-green/20 border-fun-green/40"
                : card.flipped
                  ? "bg-primary/20 border-primary/50"
                  : "bg-secondary text-secondary cursor-pointer hover:scale-105"
            }`}
            animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? card.emoji : "❓"}
          </motion.button>
        ))}
      </div>

      {/* Leaderboard */}
      {scores && scores.length > 0 && (
        <div className="fun-card bg-muted/50">
          <h4 className="font-bold text-foreground mb-2">
            🏆 Top Scores (fewer moves = better!)
          </h4>
          <div className="space-y-1" data-ocid="games.memory.list">
            {scores.slice(0, 5).map((s, i) => (
              <div
                key={s.playerName || i.toString()}
                data-ocid="games.memory.row"
                className="flex justify-between text-sm"
              >
                <span className="font-bold">
                  {["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]} {s.playerName}
                </span>
                <span className="text-muted-foreground">
                  {String(s.scoreValue)} moves
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent data-ocid="games.memory.dialog" className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              🎉 You Won!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-2">
            <p className="text-muted-foreground">
              You matched all pairs in <strong>{moves} moves</strong>!
            </p>
            <p className="text-muted-foreground mt-1 mb-4">
              Enter your name to save your score:
            </p>
            <Input
              data-ocid="games.memory.input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name..."
              className="rounded-2xl border-2 text-center text-lg mb-2"
              onKeyDown={(e) => e.key === "Enter" && submitScore()}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              data-ocid="games.memory.cancel_button"
              variant="outline"
              onClick={() => setShowWinDialog(false)}
              className="rounded-2xl flex-1"
            >
              Skip
            </Button>
            <Button
              data-ocid="games.memory.confirm_button"
              onClick={submitScore}
              disabled={!playerName.trim()}
              className="rounded-2xl flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Save Score! 🏆
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Typing Speed Game ---
const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Computers are amazing machines that help us solve problems.",
  "Coding is like giving instructions to a very smart robot.",
  "The internet connects millions of computers around the world.",
  "Binary code uses only ones and zeros to represent information.",
  "Robots can help humans explore dangerous places like volcanoes.",
];

function TypingGame() {
  const [sentence, setSentence] = useState(
    () => SENTENCES[Math.floor(Math.random() * SENTENCES.length)],
  );
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const { data: scores } = useGetTopScores(GameType.typingGame);
  const { mutate: addScore } = useAddScore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (val: string) => {
    if (finished) return;
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }
    setTyped(val);
    if (val === sentence) {
      const elapsed = (Date.now() - startTime) / 60000;
      const words = sentence.split(" ").length;
      const calculatedWpm = Math.round(words / elapsed);
      setWpm(calculatedWpm);
      setFinished(true);
      setShowScoreDialog(true);
    }
  };

  const reset = () => {
    setSentence(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
    setTyped("");
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setShowScoreDialog(false);
    setPlayerName("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitScore = () => {
    if (!playerName.trim()) return;
    addScore(
      {
        playerName: playerName.trim(),
        scoreValue: BigInt(wpm),
        gameType: GameType.typingGame,
      },
      {
        onSuccess: () => {
          toast.success(`${wpm} WPM saved for ${playerName}! ⚡`);
          setShowScoreDialog(false);
        },
      },
    );
  };

  const getCharClass = (i: number) => {
    if (i >= typed.length) return "text-muted-foreground";
    return typed[i] === sentence[i]
      ? "text-secondary"
      : "text-destructive bg-destructive/10";
  };

  return (
    <div className="max-w-lg">
      <div className="fun-card bg-muted/50 mb-4">
        <p className="font-mono text-lg leading-relaxed">
          {sentence.split("").map((char, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: character positions are stable
            <span key={i} className={`${getCharClass(i)} transition-colors`}>
              {char}
            </span>
          ))}
        </p>
      </div>

      <Input
        ref={inputRef}
        data-ocid="games.typing.input"
        value={typed}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Start typing here! ⌨️"
        disabled={finished}
        className="text-lg rounded-2xl border-2 mb-4 h-14"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="flex items-center gap-3 mb-6">
        <Button
          data-ocid="games.typing.secondary_button"
          variant="outline"
          onClick={reset}
          className="rounded-2xl font-bold border-2"
        >
          🔄 New Sentence
        </Button>
        {started && !finished && (
          <span className="text-muted-foreground text-sm font-body">
            {Math.round((typed.length / sentence.length) * 100)}% complete
          </span>
        )}
      </div>

      {scores && scores.length > 0 && (
        <div className="fun-card bg-muted/50">
          <h4 className="font-bold text-foreground mb-2">🏆 Fastest Typists</h4>
          <div className="space-y-1" data-ocid="games.typing.list">
            {scores.slice(0, 5).map((s, i) => (
              <div
                key={s.playerName || i.toString()}
                className="flex justify-between text-sm"
              >
                <span className="font-bold">
                  {["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]} {s.playerName}
                </span>
                <span className="text-muted-foreground">
                  {String(s.scoreValue)} WPM
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent data-ocid="games.typing.dialog" className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              ⚡ Amazing!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-2">
            <div className="text-6xl font-display font-bold text-accent mb-2">
              {wpm}
            </div>
            <p className="text-muted-foreground mb-4">
              words per minute! Enter your name to save:
            </p>
            <Input
              data-ocid="games.typing.input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name..."
              className="rounded-2xl border-2 text-center text-lg"
              onKeyDown={(e) => e.key === "Enter" && submitScore()}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              data-ocid="games.typing.cancel_button"
              variant="outline"
              onClick={() => setShowScoreDialog(false)}
              className="rounded-2xl flex-1"
            >
              Skip
            </Button>
            <Button
              data-ocid="games.typing.confirm_button"
              onClick={submitScore}
              disabled={!playerName.trim()}
              className="rounded-2xl flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Save Score! 🏆
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Pattern Game ---
const COLORS = [
  { id: "red", bg: "bg-red-400", text: "Red", hex: "#f87171" },
  { id: "blue", bg: "bg-blue-400", text: "Blue", hex: "#60a5fa" },
  { id: "green", bg: "bg-green-400", text: "Green", hex: "#4ade80" },
  { id: "yellow", bg: "bg-yellow-400", text: "Yellow", hex: "#facc15" },
];

function PatternGame() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSeq, setPlayerSeq] = useState<string[]>([]);
  const [phase, setPhase] = useState<
    "idle" | "showing" | "input" | "success" | "fail"
  >("idle");
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: clearTimeouts is stable
  const showSequence = useCallback((seq: string[]) => {
    setPhase("showing");
    setPlayerSeq([]);
    clearTimeouts();
    seq.forEach((color, i) => {
      const t1 = setTimeout(() => setActiveColor(color), i * 800 + 300);
      const t2 = setTimeout(() => setActiveColor(null), i * 800 + 600);
      timeouts.current.push(t1, t2);
    });
    const t3 = setTimeout(() => setPhase("input"), seq.length * 800 + 700);
    timeouts.current.push(t3);
  }, []);

  const startGame = () => {
    clearTimeouts();
    const first = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    const newSeq = [first];
    setSequence(newSeq);
    setRound(1);
    showSequence(newSeq);
  };

  const handleColorPress = (colorId: string) => {
    if (phase !== "input") return;
    const newPlayer = [...playerSeq, colorId];
    setPlayerSeq(newPlayer);
    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    if (colorId !== sequence[newPlayer.length - 1]) {
      setPhase("fail");
      clearTimeouts();
      return;
    }

    if (newPlayer.length === sequence.length) {
      setPhase("success");
      const nextSeq = [
        ...sequence,
        COLORS[Math.floor(Math.random() * COLORS.length)].id,
      ];
      setSequence(nextSeq);
      setRound((r) => r + 1);
      const t = setTimeout(() => showSequence(nextSeq), 1000);
      timeouts.current.push(t);
    }
  };

  return (
    <div className="max-w-sm">
      <div className="text-center mb-6">
        {phase === "idle" && (
          <motion.button
            data-ocid="games.pattern.primary_button"
            onClick={startGame}
            className="fun-btn bg-fun-purple text-white text-xl shadow-fun"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
          >
            🔮 Start Pattern Game!
          </motion.button>
        )}
        {phase !== "idle" && (
          <div className="fun-card bg-muted/50 inline-block px-8">
            <p className="font-bold text-foreground">
              {phase === "showing" && "👀 Watch the pattern..."}
              {phase === "input" && "👆 Now repeat it!"}
              {phase === "success" && "✅ Correct! Next round..."}
              {phase === "fail" && "❌ Oops! Wrong color!"}
            </p>
            <p className="text-muted-foreground text-sm">Round {round}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {COLORS.map((color) => (
          <motion.button
            key={color.id}
            data-ocid="games.pattern.button"
            onClick={() => handleColorPress(color.id)}
            className={`${color.bg} h-28 rounded-3xl text-white font-display font-bold text-xl border-4 border-white/30 transition-all ${
              activeColor === color.id
                ? "brightness-150 scale-105 border-white"
                : "hover:brightness-110"
            } ${phase !== "input" ? "opacity-70 cursor-default" : "cursor-pointer"}`}
            whileTap={phase === "input" ? { scale: 0.94 } : {}}
            animate={activeColor === color.id ? { scale: 1.08 } : { scale: 1 }}
          >
            {color.text}
          </motion.button>
        ))}
      </div>

      {phase === "fail" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-3 font-body">
            You reached round {round - 1}! 🎉
          </p>
          <Button
            data-ocid="games.pattern.secondary_button"
            onClick={startGame}
            className="fun-btn bg-accent text-accent-foreground"
          >
            Play Again!
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// --- Games Page ---
const games = [
  { id: "memory", label: "🃏 Memory", component: <MemoryGame /> },
  { id: "typing", label: "⌨️ Typing", component: <TypingGame /> },
  { id: "pattern", label: "🔮 Pattern", component: <PatternGame /> },
];

export default function GamesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-5xl font-bold text-foreground mb-2">
          🎮 Fun Games
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Challenge yourself and beat your high score!
        </p>
      </motion.div>

      <Tabs defaultValue="memory">
        <TabsList
          data-ocid="games.tab"
          className="grid grid-cols-3 gap-2 h-auto bg-muted/50 p-2 rounded-3xl mb-8"
        >
          {games.map((game) => (
            <TabsTrigger
              key={game.id}
              value={game.id}
              data-ocid={`games.${game.id}.tab`}
              className="rounded-2xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:shadow-fun text-base"
            >
              {game.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {games.map((game) => (
          <TabsContent key={game.id} value={game.id}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="fun-card"
            >
              {game.component}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
