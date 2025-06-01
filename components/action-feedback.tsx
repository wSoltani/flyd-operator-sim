"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Search, Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

export function ActionFeedback() {
  const { state, dispatch } = useGame()

  if (!state.actionFeedback) return null

  const getIcon = () => {
    switch (state.actionFeedback!.type) {
      case "investigation":
        return <Search className="h-5 w-5 text-violet-400" />
      case "action":
        return <Wrench className="h-5 w-5 text-blue-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Wrench className="h-5 w-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (state.actionFeedback!.type) {
      case "investigation":
        return "border-violet-500"
      case "action":
        return "border-blue-500"
      case "success":
        return "border-emerald-500"
      case "warning":
        return "border-amber-500"
      case "error":
        return "border-red-500"
      default:
        return "border-blue-500"
    }
  }

  const getBackgroundColor = () => {
    switch (state.actionFeedback!.type) {
      case "investigation":
        return "bg-violet-950/50"
      case "action":
        return "bg-blue-950/50"
      case "success":
        return "bg-emerald-950/50"
      case "warning":
        return "bg-amber-950/50"
      case "error":
        return "bg-red-950/50"
      default:
        return "bg-blue-950/50"
    }
  }

  return (
    <Card className={`${getBorderColor()} ${getBackgroundColor()} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getIcon()}
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">{state.actionFeedback.title}</h4>
              <p className="text-gray-200 text-sm leading-relaxed">{state.actionFeedback.message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "CLEAR_FEEDBACK" })}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
