import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

// --- Pixel Art Painter ---
const PALETTE = [
  "#FF6B6B",
  "#FF8E53",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF6EB4",
  "#4ECDC4",
  "#000000",
  "#444444",
  "#888888",
  "#CCCCCC",
  "#FFFFFF",
  "#8B4513",
  "#FF69B4",
  "#00CED1",
];

const GRID_SIZE = 16;

function PixelPainter() {
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("#FFFFFF")),
  );
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [isPainting, setIsPainting] = useState(false);

  const paint = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = selectedColor;
      return next;
    });
  };

  const clearGrid = () => {
    setGrid(
      Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("#FFFFFF")),
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div>
        <div
          className="border-2 border-border rounded-xl overflow-hidden inline-block shadow-fun cursor-crosshair"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: "min(320px, 90vw)",
            height: "min(320px, 90vw)",
          }}
          onMouseLeave={() => setIsPainting(false)}
        >
          {grid.map((row, r) =>
            row.map((color, c) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: pixel grid positions are stable row/col indices
                key={`${r}-${c}`}
                data-ocid="tools.pixel.canvas_target"
                style={{ backgroundColor: color }}
                className="border-[0.5px] border-gray-100"
                onMouseDown={() => {
                  setIsPainting(true);
                  paint(r, c);
                }}
                onMouseEnter={() => {
                  if (isPainting) paint(r, c);
                }}
                onMouseUp={() => setIsPainting(false)}
              />
            )),
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-display text-lg font-bold mb-3 text-foreground">
          Pick a Color 🎨
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PALETTE.map((color) => (
            <button
              type="button"
              key={color}
              data-ocid="tools.pixel.toggle"
              style={{ backgroundColor: color }}
              className={`w-10 h-10 rounded-xl border-4 transition-all wobble ${
                selectedColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl border-2 border-border"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="font-mono text-sm text-muted-foreground">
            {selectedColor}
          </span>
        </div>
        <Button
          data-ocid="tools.pixel.delete_button"
          variant="outline"
          onClick={clearGrid}
          className="rounded-2xl border-2 font-bold"
        >
          🗑️ Clear Canvas
        </Button>
      </div>
    </div>
  );
}

// --- Color Mixer ---
function ColorMixer() {
  const [r, setR] = useState(128);
  const [g, setG] = useState(64);
  const [b, setB] = useState(200);

  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  const channels = [
    {
      label: "Red 🔴",
      value: r,
      setter: setR,
      color: "#FF4444",
      ocid: "tools.colorr.select",
    },
    {
      label: "Green 🟢",
      value: g,
      setter: setG,
      color: "#44BB44",
      ocid: "tools.colorg.select",
    },
    {
      label: "Blue 🔵",
      value: b,
      setter: setB,
      color: "#4444FF",
      ocid: "tools.colorb.select",
    },
  ];

  return (
    <div className="max-w-lg">
      <div
        className="w-full h-48 rounded-3xl mb-6 shadow-fun-lg border-2 border-border transition-colors duration-200"
        style={{ backgroundColor: rgb }}
        data-ocid="tools.color.canvas_target"
      />
      <div className="space-y-4 mb-6">
        {channels.map(({ label, value, setter, ocid }) => (
          <div key={label} data-ocid={ocid}>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-foreground text-sm">{label}</span>
              <span className="font-mono text-muted-foreground text-sm">
                {value}
              </span>
            </div>
            <div>
              <Slider
                min={0}
                max={255}
                step={1}
                value={[value]}
                onValueChange={([v]) => setter(v)}
                className="cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="fun-card bg-muted/50 text-center">
        <div className="flex items-center justify-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl border-2 border-border"
            style={{ backgroundColor: rgb }}
          />
          <div>
            <p className="font-mono font-bold text-xl text-foreground">{hex}</p>
            <p className="font-mono text-sm text-muted-foreground">{rgb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Calculator ---
function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) setDisplay(`${display}.`);
  };

  const handleOperator = (op: string) => {
    const current = Number.parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(prevValue, current, operator!);
      setDisplay(String(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (prevValue === null || operator === null) return;
    const current = Number.parseFloat(display);
    const result = calculate(prevValue, current, operator);
    setDisplay(String(Number.parseFloat(result.toFixed(8))));
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const calcButtons = [
    {
      label: "C",
      action: handleClear,
      style: "bg-destructive text-destructive-foreground col-span-2",
    },
    {
      label: "÷",
      action: () => handleOperator("÷"),
      style: "bg-secondary text-secondary-foreground",
    },
    {
      label: "×",
      action: () => handleOperator("×"),
      style: "bg-secondary text-secondary-foreground",
    },
    { label: "7", action: () => handleDigit("7"), style: "bg-card" },
    { label: "8", action: () => handleDigit("8"), style: "bg-card" },
    { label: "9", action: () => handleDigit("9"), style: "bg-card" },
    {
      label: "-",
      action: () => handleOperator("-"),
      style: "bg-secondary text-secondary-foreground",
    },
    { label: "4", action: () => handleDigit("4"), style: "bg-card" },
    { label: "5", action: () => handleDigit("5"), style: "bg-card" },
    { label: "6", action: () => handleDigit("6"), style: "bg-card" },
    {
      label: "+",
      action: () => handleOperator("+"),
      style: "bg-secondary text-secondary-foreground",
    },
    { label: "1", action: () => handleDigit("1"), style: "bg-card" },
    { label: "2", action: () => handleDigit("2"), style: "bg-card" },
    { label: "3", action: () => handleDigit("3"), style: "bg-card" },
    {
      label: "=",
      action: handleEquals,
      style: "bg-accent text-accent-foreground row-span-2",
    },
    { label: "0", action: () => handleDigit("0"), style: "bg-card col-span-2" },
    { label: ".", action: handleDecimal, style: "bg-card" },
  ];

  return (
    <div className="max-w-xs mx-auto">
      <div className="fun-card bg-foreground/5 mb-4">
        <div className="text-right">
          <p className="text-muted-foreground text-sm font-mono h-5">
            {prevValue !== null ? `${prevValue} ${operator}` : " "}
          </p>
          <p
            className="font-display text-4xl font-bold text-foreground truncate"
            data-ocid="tools.calc.panel"
          >
            {display}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {calcButtons.map((btn) => (
          <motion.button
            key={btn.label}
            data-ocid="tools.calc.button"
            onClick={btn.action}
            className={`${btn.style} rounded-2xl font-display font-bold text-2xl py-4 border-2 border-border shadow-sm active:scale-95 transition-transform`}
            whileTap={{ scale: 0.9 }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// --- Binary Converter ---
function BinaryConverter() {
  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [mode, setMode] = useState<"dec2bin" | "bin2dec">("dec2bin");

  const handleDecimalChange = (val: string) => {
    const num = Number.parseInt(val);
    setDecimal(val);
    if (!Number.isNaN(num) && num >= 0 && num <= 1048575) {
      setBinary(num.toString(2));
    } else if (val === "") {
      setBinary("");
    }
  };

  const handleBinaryChange = (val: string) => {
    if (/^[01]*$/.test(val)) {
      setBinary(val);
      if (val) setDecimal(Number.parseInt(val, 2).toString());
      else setDecimal("");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex gap-2 mb-6">
        <motion.button
          data-ocid="tools.binary.toggle"
          onClick={() => setMode("dec2bin")}
          className={`flex-1 fun-btn text-base ${mode === "dec2bin" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          whileTap={{ scale: 0.95 }}
        >
          123 → 101
        </motion.button>
        <motion.button
          data-ocid="tools.binary.toggle"
          onClick={() => setMode("bin2dec")}
          className={`flex-1 fun-btn text-base ${mode === "bin2dec" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          whileTap={{ scale: 0.95 }}
        >
          101 → 123
        </motion.button>
      </div>

      {mode === "dec2bin" ? (
        <div className="space-y-4">
          <div>
            <p className="font-bold text-foreground block mb-2">
              🔢 Enter a number (0 – 1,048,575)
            </p>
            <Input
              data-ocid="tools.binary.input"
              type="number"
              min="0"
              max="1048575"
              value={decimal}
              onChange={(e) => handleDecimalChange(e.target.value)}
              placeholder="Type a number..."
              className="text-2xl font-mono h-14 rounded-2xl border-2"
            />
          </div>
          <AnimatePresence mode="wait">
            {binary && (
              <motion.div
                key={binary}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fun-card bg-fun-teal/10 border-fun-teal/40"
              >
                <p className="text-muted-foreground text-sm mb-1 font-body">
                  In binary (computer language):
                </p>
                <p className="font-mono text-3xl font-bold text-secondary break-all">
                  {binary}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-body">
                  {binary.length} bits · {Math.ceil(binary.length / 8)} byte
                  {Math.ceil(binary.length / 8) !== 1 ? "s" : ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="font-bold text-foreground block mb-2">
              💻 Enter binary (only 0s and 1s)
            </p>
            <Input
              data-ocid="tools.binary.input"
              value={binary}
              onChange={(e) => handleBinaryChange(e.target.value)}
              placeholder="Type binary like 1010..."
              className="text-2xl font-mono h-14 rounded-2xl border-2"
            />
          </div>
          <AnimatePresence mode="wait">
            {decimal && (
              <motion.div
                key={decimal}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fun-card bg-fun-yellow/10 border-fun-yellow/40"
              >
                <p className="text-muted-foreground text-sm mb-1 font-body">
                  In regular numbers:
                </p>
                <p className="font-display text-5xl font-bold text-foreground">
                  {decimal}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-6 fun-card bg-muted/50">
        <p className="font-bold text-foreground mb-2">💡 Did you know?</p>
        <p className="text-muted-foreground text-sm font-body">
          Computers only understand 1s and 0s — called binary! Every letter,
          image, and video on your computer is secretly just a huge bunch of 1s
          and 0s.
        </p>
      </div>
    </div>
  );
}

// --- Tools Page ---
const tools = [
  { id: "pixel", label: "🎨 Pixel Painter", component: <PixelPainter /> },
  { id: "color", label: "🌈 Color Mixer", component: <ColorMixer /> },
  { id: "calc", label: "🔢 Calculator", component: <Calculator /> },
  { id: "binary", label: "💡 Binary", component: <BinaryConverter /> },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-5xl font-bold text-foreground mb-2">
          🔧 Cool Tools
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Explore, create, and experiment!
        </p>
      </motion.div>

      <Tabs defaultValue="pixel">
        <TabsList
          data-ocid="tools.tab"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto bg-muted/50 p-2 rounded-3xl mb-8"
        >
          {tools.map((tool) => (
            <TabsTrigger
              key={tool.id}
              value={tool.id}
              data-ocid={`tools.${tool.id}.tab`}
              className="rounded-2xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:shadow-fun text-sm sm:text-base"
            >
              {tool.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tools.map((tool) => (
          <TabsContent key={tool.id} value={tool.id}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="fun-card"
            >
              {tool.component}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
