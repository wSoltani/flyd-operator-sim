"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Cpu, HardDrive, Wifi, Activity } from "lucide-react"

export function WorkerGrid() {
  const { state, dispatch } = useGame()

  return (
    <div className="grid grid-cols-2 gap-4">
      {state.workers.map((worker) => (
        <Card
          key={worker.id}
          className={`bg-slate-800 border-slate-600 cursor-pointer transition-all hover:bg-slate-750 hover:border-slate-500 ${
            state.selectedWorker === worker.id ? "ring-2 ring-purple-400 border-purple-400" : ""
          }`}
          onClick={() => dispatch({ type: "SELECT_WORKER", workerId: worker.id })}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-base text-white">
              <div className="flex items-center space-x-3">
                <Server className="h-5 w-5 text-blue-400" />
                <span className="text-white">{worker.name}</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full ${
                  worker.status === "healthy"
                    ? "bg-green-400"
                    : worker.status === "degraded"
                      ? "bg-yellow-400"
                      : worker.status === "critical"
                        ? "bg-red-400"
                        : "bg-gray-400"
                }`}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resource Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">CPU</span>
                </div>
                <span className="text-white font-medium">{worker.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    worker.cpu > 80 ? "bg-red-400" : worker.cpu > 60 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                  style={{ width: `${worker.cpu}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Memory</span>
                </div>
                <span className="text-white font-medium">{worker.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    worker.memory > 80 ? "bg-red-400" : worker.memory > 60 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                  style={{ width: `${worker.memory}%` }}
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">flyd:</span>
                <span
                  className={`font-semibold ${
                    worker.flydStatus === "running"
                      ? "text-green-400"
                      : worker.flydStatus === "restarting"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {worker.flydStatus}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-gray-400" />
                <span
                  className={`font-semibold ${
                    worker.networkStatus === "connected"
                      ? "text-green-400"
                      : worker.networkStatus === "degraded"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {worker.networkStatus}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-400 pt-2 border-t border-slate-700">
              <span className="text-white font-medium">{worker.activeMachines}</span> active machines
              {worker.activeFSMs.length > 0 && (
                <span className="text-blue-400 ml-3">• {worker.activeFSMs.length} FSM operations</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
