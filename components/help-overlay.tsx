"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, BookOpen, Clock, AlertTriangle, Settings } from "lucide-react"

export function HelpOverlay() {
  const { state, dispatch } = useGame()

  if (!state.showHelp) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-purple-400" />
              <span>flyd Operator Sim - Help & Guide</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "HIDE_HELP" })}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-white">
          {/* Game Overview */}
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Game Overview</span>
            </h3>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <p className="text-gray-200">
                You are an on-call engineer responsible for maintaining a Fly.io region. Your goal is to keep
                applications running smoothly while managing flyd instances and responding to operational challenges.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300">Each in-game day lasts exactly 5 minutes in real time</span>
              </div>
              <p className="text-gray-300 text-sm">
                🎯 <strong>Goal:</strong> Maintain 99%+ application uptime for 7 days (35 real minutes)
              </p>
            </div>
          </section>

          {/* Controls */}
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Game Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Header Controls</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>
                    ⏸️ <strong>Pause/Resume:</strong> Pause or resume the simulation
                  </li>
                  <li>
                    🔄 <strong>Restart:</strong> Restart the entire game
                  </li>
                  <li>
                    ❓ <strong>Help:</strong> Show this help overlay
                  </li>
                </ul>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Interaction</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>
                    🖱️ <strong>Click Workers:</strong> Select to see actions
                  </li>
                  <li>
                    🖱️ <strong>Click Incidents:</strong> Select to investigate
                  </li>
                  <li>
                    ⚡ <strong>Quick Actions:</strong> Use buttons in action panel
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Concepts */}
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Key Concepts</h3>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">flyd (Fly Daemon)</h4>
                <p className="text-gray-300 text-sm">
                  The worker-local orchestrator that manages containers using Finite State Machines (FSMs). When flyd
                  stalls, FSM operations back up and machines can't boot or migrate properly.
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">FSM Operations</h4>
                <p className="text-gray-300 text-sm">
                  Finite State Machines manage complex operations like machine creation and migration. States include:
                  pending → cloning → hydrating → booting_new → running_new → cleanup_old.
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Stateful Migrations</h4>
                <p className="text-gray-300 text-sm">
                  When draining workers, machines migrate using dm-clone technology. Monitor hydration progress and
                  watch for stuck migrations that may require intervention.
                </p>
              </div>
            </div>
          </section>

          {/* Common Incidents */}
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Common Incidents</span>
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <h4 className="font-semibold text-orange-400 text-sm">flyd Process Stalled</h4>
                <p className="text-gray-300 text-xs mt-1">
                  <strong>Cause:</strong> flyd becomes unresponsive
                  <br />
                  <strong>Solution:</strong> Restart flyd process on affected worker
                  <br />
                  <strong>Impact:</strong> FSM operations back up, new machines can't boot
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-400 text-sm">Migration FSM Stuck</h4>
                <p className="text-gray-300 text-xs mt-1">
                  <strong>Cause:</strong> dm-clone hydration stalls during migration
                  <br />
                  <strong>Solution:</strong> Monitor FSM visualizer, consider draining worker
                  <br />
                  <strong>Impact:</strong> Machines stuck in transition, potential data loss
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <h4 className="font-semibold text-blue-400 text-sm">containerd Sync Issue</h4>
                <p className="text-gray-300 text-xs mt-1">
                  <strong>Cause:</strong> flyd and containerd state mismatch
                  <br />
                  <strong>Solution:</strong> Restart flyd to resync state
                  <br />
                  <strong>Impact:</strong> Machine boot failures, inconsistent state
                </p>
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Scoring & Progression</h3>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-2">Key Metrics</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>
                      📈 <strong>Application Uptime:</strong> Primary KPI (aim for 99%+)
                    </li>
                    <li>
                      🔄 <strong>Migration Success Rate:</strong> Successful vs failed migrations
                    </li>
                    <li>
                      ⚡ <strong>Incident Resolution Time:</strong> How quickly you respond
                    </li>
                    <li>
                      ⚠️ <strong>Risky Actions:</strong> Penalty for overusing dangerous operations
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Final Ratings</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>
                      🧙‍♂️ <strong>Seasoned Infra Sage:</strong> 99%+ uptime, minimal risk
                    </li>
                    <li>
                      👨‍💻 <strong>Competent Operator:</strong> 95%+ uptime, controlled risk
                    </li>
                    <li>
                      📚 <strong>Learning Engineer:</strong> 90%+ uptime
                    </li>
                    <li>
                      🌱 <strong>Novice Operator:</strong> Below 90% uptime
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center pt-4">
            <Button
              onClick={() => dispatch({ type: "HIDE_HELP" })}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Got it! Let's operate some infrastructure 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
