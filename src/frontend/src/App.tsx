import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import GamesPage from "./pages/GamesPage";
import HomePage from "./pages/HomePage";
import LearnPage from "./pages/LearnPage";
import ToolsPage from "./pages/ToolsPage";

export type Page = "home" | "tools" | "games" | "learn";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {currentPage === "home" && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === "tools" && <ToolsPage />}
        {currentPage === "games" && <GamesPage />}
        {currentPage === "learn" && <LearnPage />}
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
