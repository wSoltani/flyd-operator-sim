"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Server, AlertTriangle, CheckCircle } from "lucide-react"

export function RegionalOverview() {
  const { state } = useGame()

  const healthyWorkers = state.workers.filter((w) => w.status === "healthy").length
  const totalWorkers = state.workers.length
  const activeIncidents = state.incidents.filter((i) => !i.resolved).length
  const criticalIncidents = state.incidents.filter((i) => !i.resolved && i.severity === "critical").length

  const getRegionalHealth = () => {
    if (criticalIncidents > 0) return "critical"
    if (activeIncidents > 2) return "degraded"
    if (healthyWorkers / totalWorkers < 0.8) return "degraded"
    return "healthy"
  }

  const regionalHealth = getRegionalHealth()

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Activity className="h-5 w-5 text-purple-400" />
          <span>Regional Overview - ORD</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-3">
              {regionalHealth === "healthy" ? (
                <CheckCircle className="h-10 w-10 text-green-400" />
              ) : regionalHealth === "degraded" ? (
                <AlertTriangle className="h-10 w-10 text-yellow-400" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-red-400" />
              )}
            </div>
            <div className="text-sm text-gray-400">Regional Health</div>
            <div
              className={`font-semibold capitalize text-lg ${
                regionalHealth === "healthy"
                  ? "text-green-400"
                  : regionalHealth === "degraded"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {regionalHealth}
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-white">{state.score.uptime.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Application Uptime</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-3">
              <Server className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-xl font-semibold text-white">
              {healthyWorkers}/{totalWorkers}
            </div>
            <div className="text-sm text-gray-400">Healthy Workers</div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-red-400">{activeIncidents}</div>
            <div className="text-sm text-gray-400">Active Incidents</div>
            {criticalIncidents > 0 && (
              <div className="text-xs text-red-300 font-semibold bg-red-900/50 px-2 py-1 rounded">
                {criticalIncidents} Critical
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
