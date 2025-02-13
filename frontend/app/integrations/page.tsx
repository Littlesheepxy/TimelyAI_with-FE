"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

const imTools = [
  { name: "企业微信", id: "wechat-work" },
  { name: "飞书", id: "feishu" },
  { name: "钉钉", id: "dingtalk" },
  { name: "Slack", id: "slack" },
  { name: "Microsoft Teams", id: "ms-teams" },
]

// 定义一个类型来表示集成状态
type IntegrationType = {
  "wechat-work": boolean;
  feishu: boolean;
  dingtalk: boolean;
  slack: boolean;
  "ms-teams": boolean;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationType>({
    "wechat-work": false,
    feishu: false,
    dingtalk: false,
    slack: false,
    "ms-teams": false,
  })

  const handleToggle = (id: keyof IntegrationType) => {
    setIntegrations((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleConnect = (id: keyof IntegrationType) => {
    // 这里应该实现实际的连接逻辑
    console.log(`Connecting to ${id}`)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">IM工具集成</h2>
      <p className="mb-4">连接您常用的IM工具，让AI助手直接在这些平台上工作。</p>
      <ul>
        {imTools.map((tool) => (
          <li key={tool.id} className="flex items-center justify-between py-4 border-b">
            <div>
              <h3 className="text-lg font-semibold">{tool.name}</h3>
              <p className="text-sm text-gray-500">{integrations[tool.id] ? "已连接" : "未连接"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Switch checked={integrations[tool.id]} onCheckedChange={() => handleToggle(tool.id as keyof IntegrationType)} />
              <Button onClick={() => handleConnect(tool.id as keyof IntegrationType)} disabled={integrations[tool.id]}>
                {integrations[tool.id] ? "已连接" : "连接"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

