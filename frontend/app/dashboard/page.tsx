import { UserStats } from "../components/UserStats"
import { MeetingList } from "../components/MeetingList"
import { MeetingStats } from "../components/MeetingStats"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <Link href="/schedule">
          <Button>安排新会议</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">您的Timely.AI使用统计</h2>
        <UserStats />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">即将到来的会议</h2>
          <MeetingList />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">会议统计</h2>
          <MeetingStats />
        </div>
      </div>
    </div>
  )
}

