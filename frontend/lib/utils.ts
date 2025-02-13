import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type ContactMethod, type ProgressStep } from "@/components/SchedulingProgress"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateContactMethodStatus(
  method: ContactMethod,
  status: ContactMethod["status"],
  details?: string
): ContactMethod {
  return {
    ...method,
    status,
    details,
  }
}

export function updateStepContactMethods(
  step: ProgressStep,
  methodIndex: number,
  status: ContactMethod["status"],
  details?: string
): ProgressStep {
  if (!step.contactMethods) return step

  return {
    ...step,
    contactMethods: step.contactMethods.map((method, index) =>
      index === methodIndex
        ? updateContactMethodStatus(method, status, details)
        : method
    ),
  }
}

export function createProgressStep(
  id: string,
  message: string,
  status: ProgressStep["status"] = "completed",
  contactMethods?: ContactMethod[],
  details?: string
): ProgressStep {
  return {
    id,
    message,
    status,
    contactMethods,
    details,
  }
}
