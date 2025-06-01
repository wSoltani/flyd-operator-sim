"use client";

import { useGame } from "@/components/game-provider";
import { RegionalOverview } from "@/components/regional-overview";
import { WorkerGrid } from "@/components/worker-grid";
import { IncidentPanel } from "@/components/incident-panel";
import { ActionPanel } from "@/components/action-panel";
import { ActionFeedback } from "@/components/action-feedback";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { GameHeader } from "@/components/game-header";
import { FSMVisualizer } from "@/components/fsm-visualizer";
import { HelpOverlay } from "@/components/help-overlay";
import { Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function GameDashboard() {
  const { state } = useGame();

  if (!state.gameStarted) {
    return <GameStartScreen />;
  }

  if (state.gameEnded) {
    return <GameEndScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader />

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-x-hidden">
        <div className="col-span-8 space-y-4 min-w-0">
          <RegionalOverview />
          <WorkerGrid />
          {state.actionFeedback && <ActionFeedback />}
          {state.selectedWorker && <FSMVisualizer />}
        </div>

        <div className="col-span-4 space-y-4 min-w-0">
          <IncidentPanel />
          <ActionPanel />
        </div>
      </div>

      {state.showTutorial && <TutorialOverlay />}
      <HelpOverlay />

      {/* Pause overlay that blocks interactions but excludes the header */}
      {state.paused && (
        <div className="fixed inset-0 top-[72px] bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Game Paused</h2>
            <p className="text-gray-300 mb-6">
              Use the controls in the header to resume
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function GameStartScreen() {
  const { dispatch } = useGame();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-auto shadow-xl bg-slate-900/90 border border-slate-700">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-violet-400">
                flyd Operator Sim
              </h1>
              <h2 className="text-2xl text-gray-300">Region Resilience</h2>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed">
              Take on the role of an on-call engineer responsible for
              maintaining the health and reliability of a Fly.io region. Manage
              flyd instances, FSM-driven operations, and respond to real-world
              operational challenges.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => dispatch({ type: "START_GAME" })}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Game
              </button>
              <div className="text-sm text-gray-500">
                <p>
                  <Target className="inline h-4 w-4" /> Goal: Maintain 99%+
                  uptime for 7 days
                </p>
                <p>
                  <Zap className="inline h-4 w-4" /> Learn: FSMs, flyd
                  operations, distributed systems
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GameEndScreen() {
  const { state } = useGame();

  const getFinalRating = () => {
    const { uptime, riskyActions, successfulMigrations, failedMigrations } =
      state.score;

    if (uptime >= 99 && riskyActions <= 5 && failedMigrations <= 2) {
      return "Seasoned Infra Sage 🧙‍♂️";
    } else if (uptime >= 95 && riskyActions <= 10) {
      return "Competent Operator 👨‍💻";
    } else if (uptime >= 90) {
      return "Learning Engineer 📚";
    } else {
      return "Novice Operator 🌱";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto p-8">
        <img
          src="/badge.png"
          alt="Completion Badge"
          className="mx-auto mb-4 w-52 h-52 rounded-lg shadow-md object-contain"
        />

        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
          <h1 className="text-4xl font-bold text-violet-400">
            Simulation Complete!
          </h1>
          <h2 className="text-2xl font-semibold text-white">Final Score</h2>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <div className="text-gray-400">Application Uptime</div>
              <div className="text-2xl font-bold text-emerald-400">
                {state.score.uptime.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">Successful Migrations</div>
              <div className="text-2xl font-bold text-blue-400">
                {state.score.successfulMigrations}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Failed Migrations</div>
              <div className="text-2xl font-bold text-red-400">
                {state.score.failedMigrations}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Risky Actions</div>
              <div className="text-2xl font-bold text-amber-400">
                {state.score.riskyActions}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="text-gray-400">Final Rating</div>
            <div className="text-2xl font-bold text-violet-400">
              {getFinalRating()}
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
