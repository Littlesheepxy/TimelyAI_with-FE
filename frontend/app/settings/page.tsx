"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

export default function Settings() {
  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    preferredMeetingDays: ["Monday", "Wednesday", "Friday"],
    maxMeetingsPerDay: 5,
    imPreferences: {
      "wechat-work": true,
      feishu: false,
      dingtalk: true,
      slack: false,
      "ms-teams": true,
    },
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImPreferenceChange = (id) => {
    setPreferences((prev) => ({
      ...prev,
      imPreferences: {
        ...prev.imPreferences,
        [id]: !prev.imPreferences[id],
      },
    }))
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">设置</h2>
      <form>
        <div className="mb-4">
          <label className="flex items-center">
            <Switch
              checked={preferences.notificationsEnabled}
              onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, notificationsEnabled: checked }))}
            />
            <span className="ml-2">启用通知</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="block mb-2">首选会议日</label>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                name="preferredMeetingDays"
                value={day}
                checked={preferences.preferredMeetingDays.includes(day)}
                onChange={handleChange}
                className="mr-2"
              />
              {day}
            </label>
          ))}
        </div>
        <div className="mb-4">
          <label className="block mb-2">
            每日最大会议数
            <input
              type="number"
              name="maxMeetingsPerDay"
              value={preferences.maxMeetingsPerDay}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">IM工具偏好</h3>
          {Object.entries(preferences.imPreferences).map(([id, enabled]) => (
            <div key={id} className="flex items-center justify-between py-2">
              <span>{id}</span>
              <Switch checked={enabled} onCheckedChange={() => handleImPreferenceChange(id)} />
            </div>
          ))}
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          保存设置
        </button>
      </form>
    </div>
  )
}

