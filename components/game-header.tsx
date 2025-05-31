"use client"

import { useGame } from "@/components/game-provider"
import { Play, Pause, RotateCcw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GameHeader() {
  const { state, dispatch } = useGame()

  const formatTime = (timeInDay: number) => {
    const totalSeconds = timeInDay
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-purple-400">flyd Operator Sim</h1>
            <p className="text-sm text-gray-400">Region: ord (Chicago)</p>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-gray-400">Day:</span>
              <span className="ml-1 font-semibold text-white">{state.day}/7</span>
            </div>
            <div>
              <span className="text-gray-400">Time:</span>
              <span className="ml-1 font-mono text-white">{formatTime(state.timeInDay)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Score Display */}
          <div className="flex items-center space-x-4 text-sm bg-slate-800 rounded-lg px-4 py-2">
            <div>
              <span className="text-gray-400">Uptime:</span>
              <span className="ml-1 font-semibold text-green-400">{state.score.uptime.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Migrations:</span>
              <span className="ml-1 font-semibold text-blue-400">
                {state.score.successfulMigrations}/{state.score.successfulMigrations + state.score.failedMigrations}
              </span>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                onClick={() => dispatch({ type: state.paused ? "RESUME_GAME" : "PAUSE_GAME" })}
              >
                {state.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {state.paused ? "Resume Game" : "Pause Game"}
              </div>
            </div>

            <div className="relative group">
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Restart Game
              </div>
            </div>

            <div className="relative group">
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                onClick={() => dispatch({ type: "SHOW_HELP" })}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Help & Tutorial
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
