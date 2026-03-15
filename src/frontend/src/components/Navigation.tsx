import { motion } from "motion/react";
import type { Page } from "../App";

const navItems: { id: Page; label: string; emoji: string }[] = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "tools", label: "Tools", emoji: "🔧" },
  { id: "games", label: "Games", emoji: "🎮" },
  { id: "learn", label: "Learn", emoji: "📚" },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b-2 border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.button
          data-ocid="nav.home.link"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 group"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <img
            src="/assets/generated/francis-mascot-transparent.dim_200x200.png"
            alt="Francis robot mascot"
            className="w-10 h-10 object-contain"
          />
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            Francis
            <span className="text-accent">!</span>
          </span>
        </motion.button>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={`relative px-3 py-2 rounded-2xl font-bold text-sm sm:text-base transition-colors ${
                currentPage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <span className="hidden sm:inline mr-1">{item.emoji}</span>
              {item.label}
              {currentPage === item.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>
    </header>
  );
}
