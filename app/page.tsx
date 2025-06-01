"use client";

import { GameProvider } from "@/components/game-provider";
import { GameDashboard } from "@/components/game-dashboard";

export default function Home() {
  return (
    <GameProvider>
      <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: "url(/background.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <GameDashboard />
        </div>
      </div>
    </GameProvider>
  );
}
