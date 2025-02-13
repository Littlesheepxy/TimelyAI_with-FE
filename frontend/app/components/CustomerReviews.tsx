import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const reviews = [
  {
    id: 1,
    name: "张三",
    company: "科技创新有限公司",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Timely.AI 彻底改变了我们的会议安排方式。它不仅节省了大量时间，还提高了我们的工作效率。强烈推荐！",
  },
  {
    id: 2,
    name: "李四",
    company: "未来教育集团",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "作为一名教育工作者，我发现 Timely.AI 在协调学生、家长和教师会议时非常有用。它的多渠道沟通功能尤其出色。",
  },
  {
    id: 3,
    name: "王五",
    company: "全球物流股份公司",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "在我们跨国团队中使用 Timely.AI 后，会议安排变得轻而易举。它的 AI 功能真的很智能，总能找到最佳的会议时间。",
  },
]

export function CustomerReviews() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">客户评价</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={review.avatar} alt={review.name} />
                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.company}</p>
                  </div>
                </div>
                <p className="text-gray-700">{review.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

