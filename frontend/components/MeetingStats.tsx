import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users } from "lucide-react"

export function MeetingStats() {
  // 这里应该从后端获取实际的统计数据
  const stats = {
    totalMeetings: 15,
    averageDuration: 45,
    participantsPerMeeting: 4,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>会议统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>本月总会议数：{stats.totalMeetings}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>平均会议时长：{stats.averageDuration} 分钟</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>平均参与人数：{stats.participantsPerMeeting} 人</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

