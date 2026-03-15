import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useGetFunFacts } from "../hooks/useQueries";

const FALLBACK_FACTS = [
  "The first computer bug was an actual bug! In 1947, a moth got stuck inside a relay in a computer and caused it to malfunction. 🦗",
  "The internet was invented in 1969. It was originally called ARPANET and only connected 4 computers! 🌐",
  "The word 'robot' comes from a Czech word 'robota' meaning 'forced labor'. Robots were fictional before they were real! 🤖",
  "The first video game was invented in 1958. It was called Tennis for Two and played on an oscilloscope! 🎮",
  "A smartphone has more computing power than all of NASA had in 1969 when they sent humans to the moon! 📱",
  "The first website ever made is still online! It was created by Tim Berners-Lee in 1991 and you can still visit it! 🌍",
  "Google processes over 8.5 billion searches every single day. That's more than 98,000 searches every second! 🔍",
  "The @ symbol used in email was chosen because it was rarely used in other contexts. It means 'at' — you are 'at' a place on the internet! 📧",
  "Coding languages have funny names like Python (named after Monty Python comedy), Ruby, Swift, and Rust! 🐍",
  "Wi-Fi doesn't actually stand for anything! The name was just created to sound like Hi-Fi (High Fidelity). 📶",
  "The first computer programmer was a woman named Ada Lovelace — way back in the 1840s, before computers even existed! 👩‍💻",
  "Pac-Man was designed to be appealing to women because the creator noticed arcades were mostly men. The design was inspired by a pizza with a slice missing! 🍕",
];

const CARD_COLORS = [
  "bg-fun-yellow/10 border-fun-yellow/30",
  "bg-fun-teal/10 border-fun-teal/30",
  "bg-fun-pink/10 border-fun-pink/30",
  "bg-fun-purple/10 border-fun-purple/30",
  "bg-fun-orange/10 border-fun-orange/30",
  "bg-fun-green/10 border-fun-green/30",
];

const EMOJIS = [
  "💡",
  "🤔",
  "🚀",
  "🌟",
  "🔬",
  "💻",
  "🎯",
  "🧠",
  "⚡",
  "🔮",
  "🌈",
  "🎨",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

export default function LearnPage() {
  const { data: backendFacts, isLoading } = useGetFunFacts();

  const facts =
    backendFacts && backendFacts.length > 0 ? backendFacts : FALLBACK_FACTS;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="font-display text-5xl font-bold text-foreground mb-2">
          📚 Fun Tech Facts
        </h1>
        <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">
          Amazing things about computers, the internet, robots, and more! Every
          fact will blow your mind! 🤯
        </p>
      </motion.div>

      {isLoading ? (
        <div
          data-ocid="learn.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton array
            <div key={i} className="fun-card space-y-3">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5 rounded-xl" />
              <Skeleton className="h-4 w-3/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {facts.map((fact, i) => (
            <motion.div
              key={fact.slice(0, 20)}
              data-ocid={`learn.item.${i + 1}`}
              variants={cardVariant}
              className={`fun-card border-2 ${CARD_COLORS[i % CARD_COLORS.length]}`}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="text-3xl mb-3">{EMOJIS[i % EMOJIS.length]}</div>
              <p className="text-foreground font-body leading-relaxed">
                {fact}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {facts.length === 0 && !isLoading && (
        <div data-ocid="learn.empty_state" className="text-center py-20">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            No facts yet!
          </h3>
          <p className="text-muted-foreground font-body">
            Check back soon for amazing tech facts.
          </p>
        </div>
      )}
    </div>
  );
}
