import React from "react"
import { CheckCircle2, Loader2, AlertTriangle, X, Hourglass } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ContactMethod {
  id: string
  name: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  details?: string
}

export interface ProgressStep {
  id: string
  message: string
  status: "in_progress" | "completed" | "error"
  contactMethods?: ContactMethod[]
  details?: string
}

interface SchedulingProgressProps {
  steps: ProgressStep[]
  onManualIntervention: () => void
}

export function SchedulingProgress({ steps, onManualIntervention }: SchedulingProgressProps) {
  return (
    <div className="mt-6 p-4 bg-blue-100 text-blue-700 rounded-md max-h-80 overflow-y-auto">
      <h3 className="font-semibold mb-2">安排进度：</h3>
      <ul className="space-y-4">
        {steps.map((step) => (
          <li key={step.id} className="flex flex-col">
            <div className="flex items-center">
              {step.status === "in_progress" && <Hourglass className="w-5 h-5 mr-2 text-blue-500 animate-pulse" />}
              {step.status === "completed" && <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />}
              {step.status === "error" && <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />}
              <span>{step.message}</span>
              {step.status === "error" && (
                <Button onClick={onManualIntervention} variant="outline" size="sm" className="ml-2">
                  人工接管
                </Button>
              )}
            </div>
            {step.details && <div className="ml-7 mt-1 text-sm text-gray-600 whitespace-pre-line">{step.details}</div>}
            {step.contactMethods && (
              <ul className="ml-7 mt-2 space-y-1">
                {step.contactMethods.map((method) => (
                  <li key={method.id} className="flex items-center text-sm">
                    {method.status === "in_progress" && (
                      <Hourglass className="w-3 h-3 mr-2 text-blue-500 animate-pulse" />
                    )}
                    {method.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />}
                    {method.status === "skipped" && <X className="w-3 h-3 mr-2 text-gray-500" />}
                    <span>{method.name}</span>
                    {method.details && <span className="ml-2 text-gray-600">{method.details}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

