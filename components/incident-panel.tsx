"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, Search, Zap } from "lucide-react"

export function IncidentPanel() {
  const { state, dispatch } = useGame()

  const activeIncidents = state.incidents.filter((i) => !i.resolved)
  const resolvedIncidents = state.incidents.filter((i) => i.resolved).slice(-3)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-400/10"
      case "high":
        return "text-orange-400 bg-orange-400/10"
      case "medium":
        return "text-amber-400 bg-amber-400/10"
      case "low":
        return "text-blue-400 bg-blue-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const getQuickFixAction = (incidentType: string) => {
    const actions = {
      flyd_stalled: "Restart flyd",
      migration_stuck: "Cancel migration",
      containerd_sync: "Restart flyd",
      network_partition: "Restart networking",
      storage_corruption: "Mark read-only",
      memory_leak: "Restart flyd",
      disk_io_bottleneck: "Throttle I/O",
      kernel_panic: "Reboot worker",
      network_congestion: "Reset NIC",
      dns_failure: "Flush DNS cache",
      config_corruption: "Restore config",
      hardware_degradation: "Emergency drain",
      storage_spreading: "Emergency drain",
      network_hardware_failure: "Emergency drain",
    }
    return actions[incidentType as keyof typeof actions] || "Apply fix"
  }

  const getIncidentDescription = (incident: any) => {
    if (!incident.isFirstTime) return incident.description

    const firstTimeDescriptions = {
      flyd_stalled:
        "flyd manages FSM operations. When stalled, new deployments and migrations queue up. Investigation reveals root cause.",
      migration_stuck:
        "dm-clone handles live migration of machine state. Stuck hydration indicates network or storage issues.",
      containerd_sync:
        "flyd maintains a lease database of containers. Sync issues cause boot failures and inconsistent state.",
      memory_leak:
        "flyd's memory usage should be stable. Leaks can cause OOM kills and service disruption if not addressed.",
      disk_io_bottleneck:
        "High disk I/O can bottleneck all operations. Machines will experience slow boot and migration times.",
      kernel_panic: "Kernel panics indicate serious system issues. The worker may become completely unresponsive.",
      network_congestion:
        "Network congestion causes packet loss and high latency, affecting all network-dependent operations.",
      dns_failure:
        "DNS resolution is critical for service discovery. Failures prevent machines from finding dependencies.",
      config_corruption:
        "flyd relies on its config file for operation parameters. Corruption can cause unexpected behavior.",
      hardware_degradation:
        "Hardware degradation is progressive and fatal. ECC errors and thermal issues indicate imminent failure requiring immediate evacuation.",
      storage_spreading:
        "Storage corruption that spreads indicates systemic failure. LVM corruption can cascade to total data loss if not evacuated immediately.",
      network_hardware_failure:
        "Network hardware failures cause intermittent connectivity. NIC or switch issues require physical replacement after evacuation.",
    }

    return firstTimeDescriptions[incident.type as keyof typeof firstTimeDescriptions] || incident.description
  }

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>Incidents</span>
          </div>
          <div className="text-sm font-normal text-gray-400">{activeIncidents.length} active</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {activeIncidents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-white">No active incidents</p>
            <p className="text-sm">All systems operational</p>
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                state.selectedIncident === incident.id
                  ? "border-violet-400 bg-violet-400/5"
                  : "border-slate-600 hover:border-slate-500"
              }`}
              onClick={() => dispatch({ type: "SELECT_INCIDENT", incidentId: incident.id })}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{formatTimestamp(incident.timestamp)}</span>
                </div>
              </div>

              <h4 className="font-semibold text-sm mb-1 text-white">{incident.title}</h4>
              <p className="text-xs text-gray-300 mb-2">{incident.description}</p>

              {incident.workerId && (
                <div className="text-xs text-violet-400">
                  Affected: {state.workers.find((w) => w.id === incident.workerId)?.name}
                </div>
              )}

              {incident.requires_drain && (
                <div className="text-xs text-red-300 bg-red-900/50 px-2 py-1 rounded mt-1">⚠️ DRAIN REQUIRED</div>
              )}

              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: "INVESTIGATE_INCIDENT", incidentId: incident.id })
                  }}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Investigate
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs bg-slate-600 hover:bg-slate-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: "QUICK_FIX_INCIDENT", incidentId: incident.id })
                  }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {getQuickFixAction(incident.type)}
                </Button>
              </div>

              {incident.isFirstTime && (
                <div className="mt-2 p-2 bg-violet-900/50 border border-violet-500 rounded text-xs">
                  <div className="flex items-center space-x-1 text-violet-300 font-semibold mb-1">
                    <span>🎓</span>
                    <span>First Time Incident</span>
                  </div>
                  <p className="text-violet-200">{getIncidentDescription(incident)}</p>
                </div>
              )}
            </div>
          ))
        )}

        {resolvedIncidents.length > 0 && (
          <div className="pt-3 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Recently Resolved</h4>
            {resolvedIncidents.map((incident) => (
              <div key={incident.id} className="p-2 rounded bg-slate-700/50 mb-2">
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span className="text-gray-200">{incident.title}</span>
                  <span className="text-gray-400">{formatTimestamp(incident.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
