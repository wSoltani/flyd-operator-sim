"use client"

import { GameProvider } from "@/components/game-provider"
import { GameDashboard } from "@/components/game-dashboard"

export default function Home() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
        <GameDashboard />
      </div>
    </GameProvider>
  )
}
