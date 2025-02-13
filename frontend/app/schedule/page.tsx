"use client"

import { useState, useEffect, useCallback } from "react"
import { Tab } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ContactMethodsPriority } from "@/components/ContactMethodsPriority"
import { SchedulingProgress, type ProgressStep, type ContactMethod } from "@/components/SchedulingProgress"
import { ManualInterventionModal } from "@/components/ManualInterventionModal"
import { Confetti } from "@/components/Confetti"
import { ProgressBar } from "@/components/ProgressBar"
import { ChatInterface } from "@/components/ChatInterface"
import { updateStepContactMethods, createProgressStep } from "@/lib/utils"

interface DragResult {
  source: { index: number }
  destination: { index: number } | null
}

const initialContactMethods: ContactMethod[] = [
  { id: "email", name: "邮件", status: "pending" },
  { id: "im", name: "IM", status: "pending" },
  { id: "sms", name: "短信", status: "pending" },
  { id: "phone", name: "电话", status: "pending" },
]

const initialSteps: ProgressStep[] = [
  { id: "1", message: "正在解析会议需求", status: "completed" },
  { id: "2", message: "检查参与者日程", status: "completed" },
  { id: "3", message: "寻找合适的时间段", status: "completed" },
  { id: "4", message: "与参与者确认会议", status: "completed", contactMethods: [] },
  { id: "5", message: "发送会议邀请", status: "completed" },
]

export default function ScheduleMeeting() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [schedulingSteps, setSchedulingSteps] = useState<ProgressStep[]>(initialSteps)
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>(initialContactMethods)
  const [formData, setFormData] = useState({
    title: "",
    participants: "",
    date: "",
    time: "",
    duration: "",
    description: "",
  })
  const [isScheduling, setIsScheduling] = useState(false)
  const [needsManualIntervention, setNeedsManualIntervention] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [progress, setProgress] = useState(0)

  const testConfetti = useCallback(() => {
    setShowConfetti(false)
    setTimeout(() => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000) // 更新为 5 秒
    }, 100)
  }, [])

  useEffect(() => {
    setSchedulingSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === "4"
          ? createProgressStep(
              step.id,
              step.message,
              step.status,
              contactMethods.map((method) => ({ ...method, status: "pending" }))
            )
          : step
      )
    )
  }, [contactMethods])

  const simulateContactMethodProgress = async (stepIndex: number) => {
    const updatedSteps = [...schedulingSteps]
    const step = updatedSteps[stepIndex]

    if (step.contactMethods) {
      for (let methodIndex = 0; methodIndex < step.contactMethods.length; methodIndex++) {
        updatedSteps[stepIndex] = updateStepContactMethods(step, methodIndex, "in_progress")
        setSchedulingSteps(updatedSteps)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        if (methodIndex === 0) {
          updatedSteps[stepIndex] = updateStepContactMethods(
            step,
            methodIndex,
            "completed",
            "已通过邮件确认：example@company.com"
          )
        } else {
          break
        }
        setSchedulingSteps(updatedSteps)
      }
    }
  }

  const handleScheduling = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScheduling(true)
    setSchedulingSteps(initialSteps)
    setProgress(0)

    for (let i = 0; i < initialSteps.length; i++) {
      // 设置当前步骤为"进行中"
      setSchedulingSteps((prevSteps) =>
        prevSteps.map((step, index) => (index === i ? { ...step, status: "in_progress" } : step)),
      )
      setProgress((i + 1) * 20)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (i === 0) {
        setSchedulingSteps((prevSteps) =>
          prevSteps.map((step, index) =>
            index === i
              ? { ...step, status: "completed", details: "已解析：面试会议，参与者为面试官A和候选人B" }
              : step,
          ),
        )
      } else if (i === 1) {
        setSchedulingSteps((prevSteps) =>
          prevSteps.map((step, index) =>
            index === i
              ? {
                  ...step,
                  status: "completed",
                  details: "面试官A：周一至周五 9:00-17:00 可用\n候选人B：周二、周四 14:00-18:00 可用",
                }
              : step,
          ),
        )
      } else if (i === 2) {
        setSchedulingSteps((prevSteps) =>
          prevSteps.map((step, index) =>
            index === i ? { ...step, status: "completed", details: "建议时间段：周二 14:30-16:00" } : step,
          ),
        )
      } else if (i === 3) {
        await simulateContactMethodProgress(i)
      } else if (i === 4) {
        setSchedulingSteps((prevSteps) =>
          prevSteps.map((step, index) =>
            index === i ? { ...step, status: "completed", details: "已发送会议邀请至 example@company.com" } : step,
          ),
        )
      }
    }

    setIsScheduling(false)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 10000)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onDragEnd = (result: DragResult) => {
    if (!result.destination) return
    const items = Array.from(contactMethods)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setContactMethods(items)
  }

  const handleManualInterventionComplete = async () => {
    setNeedsManualIntervention(false)
    setSchedulingSteps((prev) => [
      ...prev,
      createProgressStep(String(prev.length + 1), "人工操作完成，继续AI安排", "completed"),
    ])
  }

  const simulateError = () => {
    setSchedulingSteps((prev) =>
      prev.map((step, index) =>
        index === 3
          ? createProgressStep(step.id, "无法联系到部分参与者，需要人工介入", "error", step.contactMethods)
          : step
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">安排会议</h1>
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl mb-6">
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium text-blue-700 rounded-lg
             ${selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white"}`
            }
          >
            自然语言模式
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium text-blue-700 rounded-lg
             ${selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white"}`
            }
          >
            普通模式
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="space-y-4">
              <ChatInterface />
              <ContactMethodsPriority contactMethods={contactMethods} onDragEnd={onDragEnd} />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <form onSubmit={handleScheduling} className="space-y-4">
              <div>
                <Label htmlFor="title">会议标题</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="participants">参与者</Label>
                <Input
                  id="participants"
                  name="participants"
                  value={formData.participants}
                  onChange={handleFormChange}
                  placeholder="用逗号分隔多个参与者"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">日期</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="time">时间</Label>
                  <Input id="time" name="time" type="time" value={formData.time} onChange={handleFormChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">时长（分钟）</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">会议描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>
              <ContactMethodsPriority contactMethods={contactMethods} onDragEnd={onDragEnd} />
              <Button type="submit" disabled={isScheduling}>
                {isScheduling ? "安排中..." : "安排会议"}
              </Button>
            </form>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <ProgressBar progress={progress} />
      <SchedulingProgress steps={schedulingSteps} onManualIntervention={() => setNeedsManualIntervention(true)} />
      <ManualInterventionModal
        isOpen={needsManualIntervention}
        onClose={() => setNeedsManualIntervention(false)}
        onComplete={handleManualInterventionComplete}
      />
      <Confetti isActive={showConfetti} />
      <div className="mt-4 space-x-2">
        <Button onClick={testConfetti}>测试撒花效果</Button>
        <Button onClick={simulateError} variant="outline">
          模拟错误
        </Button>
      </div>
    </div>
  )
}

