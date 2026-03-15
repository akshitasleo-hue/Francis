import { motion } from "motion/react";
import type { Page } from "../App";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface Props {
  onNavigate: (page: Page) => void;
}

const featuredTools = [
  {
    emoji: "🎨",
    title: "Pixel Art Painter",
    desc: "Draw pixel art on a 16×16 grid!",
    color: "bg-fun-pink/10 border-fun-pink/30 hover:bg-fun-pink/20",
  },
  {
    emoji: "🎨",
    title: "Color Mixer",
    desc: "Mix red, green & blue to make any color!",
    color: "bg-fun-teal/10 border-fun-teal/30 hover:bg-fun-teal/20",
  },
  {
    emoji: "🔢",
    title: "Calculator",
    desc: "Big buttons for easy math!",
    color: "bg-fun-yellow/10 border-fun-yellow/30 hover:bg-fun-yellow/20",
  },
  {
    emoji: "💡",
    title: "Binary Converter",
    desc: "Speak the secret language of computers!",
    color: "bg-fun-purple/10 border-fun-purple/30 hover:bg-fun-purple/20",
  },
];

const featuredGames = [
  {
    emoji: "🃏",
    title: "Memory Game",
    desc: "Find matching pairs of cards!",
    color: "bg-fun-orange/10 border-fun-orange/30 hover:bg-fun-orange/20",
  },
  {
    emoji: "⌨️",
    title: "Typing Speed",
    desc: "How fast can you type?",
    color: "bg-fun-green/10 border-fun-green/30 hover:bg-fun-green/20",
  },
  {
    emoji: "🔮",
    title: "Pattern Game",
    desc: "Remember and repeat the sequence!",
    color: "bg-fun-pink/10 border-fun-pink/30 hover:bg-fun-pink/20",
  },
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="bg-dots">
      {/* Hero */}
      <section className="hero-gradient py-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="inline-block bg-accent text-accent-foreground text-sm font-bold px-4 py-1 rounded-full mb-4">
              🚀 Explore • Play • Learn
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-none">
              Tech is <span className="text-accent">super</span>
              <br />
              <span className="text-secondary">cool!</span> 🤩
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 font-body">
              Build, play, and discover the amazing world of technology with
              Francis — your friendly tech robot guide!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <motion.button
                data-ocid="home.primary_button"
                onClick={() => onNavigate("games")}
                className="fun-btn bg-accent text-accent-foreground shadow-fun-pink text-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                🎮 Play Games!
              </motion.button>
              <motion.button
                data-ocid="home.secondary_button"
                onClick={() => onNavigate("tools")}
                className="fun-btn bg-secondary text-secondary-foreground shadow-fun-teal text-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                🔧 Try Tools!
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <img
              src="/assets/generated/francis-hero-transparent.dim_800x600.png"
              alt="Francis tech world"
              className="w-full max-w-sm lg:max-w-md float"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-4xl font-bold text-foreground">
              🔧 Cool Tools
            </h2>
            <motion.button
              data-ocid="home.tools.link"
              onClick={() => onNavigate("tools")}
              className="fun-btn bg-primary text-primary-foreground text-base shadow-fun"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See All →
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {featuredTools.map((tool, i) => (
            <motion.div
              key={tool.title}
              data-ocid={`home.tools.item.${i + 1}`}
              variants={item}
              className={`fun-card border-2 cursor-pointer transition-all ${tool.color}`}
              onClick={() => onNavigate("tools")}
              whileHover={{ y: -4 }}
            >
              <div className="text-4xl mb-3">{tool.emoji}</div>
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                {tool.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Games */}
      <section className="py-16 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl font-bold text-foreground">
                🎮 Fun Games
              </h2>
              <motion.button
                data-ocid="home.games.link"
                onClick={() => onNavigate("games")}
                className="fun-btn bg-accent text-accent-foreground text-base shadow-fun-pink"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See All →
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {featuredGames.map((game, i) => (
              <motion.div
                key={game.title}
                data-ocid={`home.games.item.${i + 1}`}
                variants={item}
                className={`fun-card border-2 cursor-pointer transition-all ${game.color}`}
                onClick={() => onNavigate("games")}
                whileHover={{ y: -4 }}
              >
                <div className="text-5xl mb-3">{game.emoji}</div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {game.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  {game.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learn CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="fun-card bg-gradient-to-br from-fun-purple/10 to-fun-teal/10 border-2 border-fun-purple/30"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Did You Know?
            </h2>
            <p className="text-muted-foreground font-body mb-6 text-lg">
              The first computer bug was an actual bug! Learn more amazing tech
              facts in our Learn section.
            </p>
            <motion.button
              data-ocid="home.learn.link"
              onClick={() => onNavigate("learn")}
              className="fun-btn bg-fun-purple text-white shadow-fun text-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              📚 Explore Fun Facts!
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
