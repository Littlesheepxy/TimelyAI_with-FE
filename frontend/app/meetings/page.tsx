import { MeetingList } from "@/components/MeetingList"
import { MeetingStats } from "@/components/MeetingStats"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MeetingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">会议</h1>
        <Link href="/schedule">
          <Button>安排新会议</Button>
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MeetingList />
        </div>
        <div>
          <MeetingStats />
        </div>
      </div>
    </div>
  )
}

