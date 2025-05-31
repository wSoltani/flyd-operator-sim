"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowRight } from "lucide-react"

export function FSMVisualizer() {
  const { state } = useGame()

  const selectedWorker = state.workers.find((w) => w.id === state.selectedWorker)
  if (!selectedWorker || selectedWorker.activeFSMs.length === 0) {
    return null
  }

  const fsm = selectedWorker.activeFSMs[0] // Show first FSM for simplicity

  const getMigrationStates = () => {
    if (fsm.state === "error_recovery") {
      return [
        { name: "pending", active: false, completed: true },
        { name: "cloning", active: false, completed: true },
        { name: "hydrating", active: false, completed: false },
        { name: "error_recovery", active: true, completed: false },
        { name: "rollback", active: false, completed: false },
        { name: "failed", active: false, completed: false },
      ]
    }

    return [
      { name: "pending", active: fsm.state === "pending", completed: false },
      { name: "cloning", active: fsm.state === "cloning", completed: fsm.state !== "pending" },
      {
        name: "hydrating",
        active: fsm.state === "hydrating",
        completed: ["booting_new", "running_new", "cleanup_old"].includes(fsm.state),
      },
      {
        name: "booting_new",
        active: fsm.state === "booting_new",
        completed: ["running_new", "cleanup_old"].includes(fsm.state),
      },
      { name: "running_new", active: fsm.state === "running_new", completed: fsm.state === "cleanup_old" },
      { name: "cleanup_old", active: fsm.state === "cleanup_old", completed: false },
    ]
  }

  const states = getMigrationStates()

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Activity className="h-5 w-5 text-purple-400" />
          <span>FSM Operation: {fsm.type.replace(/_/g, " ")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Machine ID:</span>
            <span className="font-mono text-white">{fsm.machineId}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Progress:</span>
            <span className="text-white">{fsm.progress.toFixed(1)}%</span>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="h-2 bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${fsm.progress}%` }}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-300">FSM States</h4>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {states.map((state, index) => (
                <div key={state.name} className="flex items-center space-x-2 flex-shrink-0">
                  <div
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      state.active
                        ? state.name === "error_recovery"
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                        : state.completed
                          ? "bg-green-500 text-white"
                          : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    {state.name.replace(/_/g, " ")}
                  </div>
                  {index < states.length - 1 && <ArrowRight className="h-4 w-4 text-gray-500" />}
                </div>
              ))}
            </div>
          </div>

          {fsm.type === "migration" && (
            <>
              <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                <h5 className="text-xs font-semibold text-gray-300 mb-2">Migration Details</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">dm-clone Status:</span>
                    <span className="text-blue-400">{fsm.state === "hydrating" ? "Active" : "Pending"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Hydration:</span>
                    <span className="text-white">{fsm.progress.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network Usage:</span>
                    <span className="text-yellow-400">
                      {fsm.state === "cloning" || fsm.state === "hydrating" ? "High" : "Normal"}
                    </span>
                  </div>
                </div>
              </div>

              {fsm.state === "error_recovery" && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <h5 className="text-xs font-semibold text-red-300 mb-2">FSM Error State</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-red-300">Error Type:</span>
                      <span className="text-red-400">dm-clone hydration failure</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-300">Recovery Action:</span>
                      <span className="text-red-400">Manual intervention required</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-300">Data Risk:</span>
                      <span className="text-red-400">High - potential data loss</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
