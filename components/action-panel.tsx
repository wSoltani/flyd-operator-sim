"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, ArrowDown, Wrench, AlertTriangle, FileText, Zap, Search } from "lucide-react"

export function ActionPanel() {
  const { state, dispatch } = useGame()

  const selectedWorker = state.workers.find((w) => w.id === state.selectedWorker)
  const selectedIncident = state.incidents.find((i) => i.id === state.selectedIncident)

  if (!selectedWorker && !selectedIncident) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Settings className="h-5 w-5 text-violet-400" />
            <span>Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <p>Select a worker or incident</p>
            <p className="text-sm">to see available actions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if worker is actively draining (has migration FSM)
  const isWorkerDraining = selectedWorker?.activeFSMs.some((fsm) => fsm.type === "migration") || false

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Settings className="h-5 w-5 text-violet-400" />
          <span>Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedWorker && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-white">Worker: {selectedWorker.name}</h4>

            {isWorkerDraining && (
              <div className="mb-3 p-2 bg-amber-900/50 border border-amber-500 rounded text-xs text-amber-200">
                ⚠️ Worker is draining - most actions disabled during migration
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-slate-600 hover:bg-slate-500 text-white h-10"
                onClick={() => dispatch({ type: "RESTART_FLYD", workerId: selectedWorker.id })}
                disabled={isWorkerDraining} // Disable during drain
              >
                <RefreshCw className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">
                  {selectedWorker.flydStatus === "restarting" ? "Restarting flyd..." : "Restart flyd Process"}
                </span>
                {selectedWorker.flydStatus === "stalled" && !isWorkerDraining && (
                  <span className="text-xs text-amber-300 bg-amber-900/50 px-2 py-1 rounded">Recommended</span>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-slate-600 hover:bg-slate-500 text-white h-10"
                onClick={() => dispatch({ type: "DRAIN_WORKER", workerId: selectedWorker.id })}
                disabled={isWorkerDraining} // Already draining
              >
                <ArrowDown className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">
                  {isWorkerDraining ? "Draining in Progress..." : "Drain Worker"}
                </span>
                {!isWorkerDraining && (
                  <span className="text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded">Risky</span>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-slate-600 hover:bg-slate-500 text-white h-10"
                onClick={() => dispatch({ type: "CHECK_CONTAINERD", workerId: selectedWorker.id })}
                disabled={false} // Always allow investigation
              >
                <Wrench className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">Check containerd Status</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-slate-600 hover:bg-slate-500 text-white h-10"
                onClick={() => dispatch({ type: "INSPECT_LVM", workerId: selectedWorker.id })}
                disabled={false} // Always allow investigation
              >
                <AlertTriangle className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">Inspect LVM Health</span>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <h5 className="text-xs font-semibold text-gray-300 mb-2">Worker Status</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">flyd Status:</span>
                  <span
                    className={
                      selectedWorker.flydStatus === "running"
                        ? "text-emerald-400"
                        : selectedWorker.flydStatus === "restarting"
                          ? "text-amber-400"
                          : "text-red-400"
                    }
                  >
                    {selectedWorker.flydStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">containerd:</span>
                  <span
                    className={
                      selectedWorker.containerdHealth === "healthy"
                        ? "text-emerald-400"
                        : selectedWorker.containerdHealth === "degraded"
                          ? "text-amber-400"
                          : "text-red-400"
                    }
                  >
                    {selectedWorker.containerdHealth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Network:</span>
                  <span
                    className={
                      selectedWorker.networkStatus === "connected"
                        ? "text-emerald-400"
                        : selectedWorker.networkStatus === "degraded"
                          ? "text-amber-400"
                          : "text-red-400"
                    }
                  >
                    {selectedWorker.networkStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedIncident && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-white">Incident: {selectedIncident.title}</h4>

            <div className="space-y-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-violet-600 hover:bg-violet-700 text-white h-10"
                onClick={() => dispatch({ type: "INVESTIGATE_INCIDENT", incidentId: selectedIncident.id })}
                disabled={selectedIncident.investigated}
              >
                <Search className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">
                  {selectedIncident.investigated ? "Investigation Complete" : "Investigate & Diagnose"}
                </span>
                {selectedIncident.investigated && (
                  <span className="text-xs text-emerald-300 bg-emerald-900/50 px-2 py-1 rounded">Done</span>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-slate-600 hover:bg-slate-500 text-white h-10"
                onClick={() => dispatch({ type: "VIEW_FLYD_LOGS", incidentId: selectedIncident.id })}
                disabled={false} // Always allow log viewing
              >
                <FileText className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">View flyd Logs</span>
                {selectedIncident.logViewed && (
                  <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded">Viewed</span>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start bg-red-700 hover:bg-red-600 text-white h-10"
                onClick={() => dispatch({ type: "FORCE_FSM_TRANSITION", incidentId: selectedIncident.id })}
                disabled={isWorkerDraining} // Disable risky actions during drain
              >
                <Zap className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">Force FSM Transition</span>
                <span className="text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded">Very Risky</span>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <h5 className="text-xs font-semibold text-gray-300 mb-2">Incident Details</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Severity:</span>
                  <span
                    className={
                      selectedIncident.severity === "critical"
                        ? "text-red-400"
                        : selectedIncident.severity === "high"
                          ? "text-orange-400"
                          : selectedIncident.severity === "medium"
                            ? "text-amber-400"
                            : "text-blue-400"
                    }
                  >
                    {selectedIncident.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <span className="text-white">{selectedIncident.type.replace(/_/g, " ")}</span>
                </div>
                {selectedIncident.workerId && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Worker:</span>
                    <span className="text-violet-400">
                      {state.workers.find((w) => w.id === selectedIncident.workerId)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
