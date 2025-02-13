import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, TrendingUp } from "lucide-react"

export function UserStats() {
  // 这些数据应该从后端API获取
  const stats = {
    meetingsScheduled: 47,
    timeSaved: 940, // 分钟
    efficiency: 85, // 百分比
  }

  // 平均用户数据
  const averageStats = {
    meetingsScheduled: 32,
    timeSaved: 640, // 分钟
    efficiency: 70, // 百分比
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">已安排会议</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.meetingsScheduled}</div>
          <p className="text-xs text-muted-foreground">
            比平均用户多 {stats.meetingsScheduled - averageStats.meetingsScheduled} 次
          </p>
          <Progress className="mt-2" value={(stats.meetingsScheduled / averageStats.meetingsScheduled) * 100} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节省时间</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(stats.timeSaved / 60)} 小时 {stats.timeSaved % 60} 分钟
          </div>
          <p className="text-xs text-muted-foreground">
            比平均用户多 {Math.floor((stats.timeSaved - averageStats.timeSaved) / 60)} 小时
          </p>
          <Progress className="mt-2" value={(stats.timeSaved / averageStats.timeSaved) * 100} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">效率提升</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.efficiency}%</div>
          <p className="text-xs text-muted-foreground">比平均用户高 {stats.efficiency - averageStats.efficiency}%</p>
          <Progress className="mt-2" value={stats.efficiency} />
        </CardContent>
      </Card>
    </div>
  )
}

