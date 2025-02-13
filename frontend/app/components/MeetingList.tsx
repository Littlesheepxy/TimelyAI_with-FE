"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, Users, VideoIcon, Edit2Icon, XIcon } from "lucide-react"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  participants: string[]
  status: "upcoming" | "past"
}

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "项目进度讨论",
    date: "2023-05-25",
    time: "14:00",
    participants: ["张三", "李四", "王五"],
    status: "upcoming",
  },
  {
    id: "2",
    title: "客户需求分析",
    date: "2023-05-26",
    time: "10:00",
    participants: ["张三", "赵六"],
    status: "upcoming",
  },
  {
    id: "3",
    title: "团队周会",
    date: "2023-05-20",
    time: "09:00",
    participants: ["张三", "李四", "王五", "赵六"],
    status: "past",
  },
]

export function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)

  const upcomingMeetings = meetings.filter((meeting) => meeting.status === "upcoming")
  const pastMeetings = meetings.filter((meeting) => meeting.status === "past")

  const handleJoinMeeting = (id: string) => {
    console.log(`加入会议 ${id}`)
  }

  const handleEditMeeting = (id: string) => {
    console.log(`编辑会议 ${id}`)
  }

  const handleCancelMeeting = (id: string) => {
    setMeetings(meetings.filter((meeting) => meeting.id !== id))
  }

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <Card key={meeting.id} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{meeting.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <CalendarDays className="w-4 h-4 mr-2" />
          <span>{meeting.date}</span>
        </div>
        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 mr-2" />
          <span>{meeting.time}</span>
        </div>
        <div className="flex items-center mb-4">
          <Users className="w-4 h-4 mr-2" />
          <span>{meeting.participants.join(", ")}</span>
        </div>
        <div className="flex space-x-2">
          {meeting.status === "upcoming" && (
            <>
              <Button size="sm" onClick={() => handleJoinMeeting(meeting.id)}>
                <VideoIcon className="w-4 h-4 mr-2" />
                加入
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleEditMeeting(meeting.id)}>
                <Edit2Icon className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleCancelMeeting(meeting.id)}>
                <XIcon className="w-4 h-4 mr-2" />
                取消
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="upcoming">
      <TabsList className="mb-4">
        <TabsTrigger value="upcoming">即将到来</TabsTrigger>
        <TabsTrigger value="past">历史会议</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        {upcomingMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </TabsContent>
      <TabsContent value="past">
        {pastMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

