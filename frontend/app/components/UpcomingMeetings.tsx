export default function UpcomingMeetings() {
  // This would typically fetch data from your backend
  const meetings = [
    { id: 1, title: "Team Standup", time: "2023-05-20T09:00:00" },
    { id: 2, title: "Project Review", time: "2023-05-21T14:00:00" },
  ]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Upcoming Meetings</h2>
      <ul>
        {meetings.map((meeting) => (
          <li key={meeting.id} className="mb-2">
            <span className="font-semibold">{meeting.title}</span>
            <span className="text-gray-500 ml-2">{new Date(meeting.time).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

