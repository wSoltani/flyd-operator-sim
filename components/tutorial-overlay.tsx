"use client"

import { useGame } from "@/components/game-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ArrowRight } from "lucide-react"

export function TutorialOverlay() {
  const { state, dispatch } = useGame()

  const tutorialSteps = [
    {
      title: "Welcome to flyd Operator Sim!",
      content:
        "You're now responsible for maintaining a Fly.io region. Your goal is to keep applications running smoothly while managing flyd instances and responding to operational challenges.",
      highlight: null,
    },
    {
      title: "Regional Overview",
      content:
        "This panel shows your region's health. Monitor application uptime, worker status, and active incidents. Your primary KPI is maintaining 99%+ uptime.",
      highlight: "regional-overview",
    },
    {
      title: "Worker Management",
      content:
        "Each worker runs flyd, which orchestrates containers using FSMs. Click on a worker to see its status and available actions. Watch for flyd stalls and resource issues.",
      highlight: "worker-grid",
    },
    {
      title: "Incident Response",
      content:
        "When incidents occur, investigate and apply fixes. Some incidents auto-resolve, but others require your intervention. Quick response times improve your score.",
      highlight: "incident-panel",
    },
    {
      title: "Actions & Tools",
      content:
        "Select workers or incidents to see available actions. Be careful with risky actions like worker draining - they can trigger complex migration FSMs.",
      highlight: "action-panel",
    },
    {
      title: "Ready to Begin",
      content:
        "You'll start with one worker and face increasingly complex challenges over 7 simulated days. Good luck, operator!",
      highlight: null,
    },
  ]

  const currentStep = tutorialSteps[state.tutorialStep] || tutorialSteps[tutorialSteps.length - 1]
  const isLastStep = state.tutorialStep >= tutorialSteps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{currentStep.title}</h3>
              <div className="text-sm text-gray-400 mt-1">
                Step {state.tutorialStep + 1} of {tutorialSteps.length}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SKIP_TUTORIAL" })}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">{currentStep.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index <= state.tutorialStep ? "bg-purple-400" : "bg-slate-600"}`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {!isLastStep ? (
                <Button
                  onClick={() => dispatch({ type: "NEXT_TUTORIAL_STEP" })}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => dispatch({ type: "SKIP_TUTORIAL" })}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Simulation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
