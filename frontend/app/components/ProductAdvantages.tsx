import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Bot, Zap } from "lucide-react"

const advantages = [
  {
    icon: <Bot className="h-8 w-8 text-blue-500" />,
    title: "AI 智能调度",
    description: "我们的 AI 系统能够分析所有参与者的日程，自动找出最佳会议时间，大大减少了来回协调的麻烦。",
  },
  {
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: "多渠道沟通",
    description: "通过邮件、IM、短信等多种方式与参会者确认，确保信息及时送达，提高响应率。",
  },
  {
    icon: <Clock className="h-8 w-8 text-purple-500" />,
    title: "节省宝贵时间",
    description: "自动化的会议安排流程可以为您节省大量时间，让您专注于更重要的工作。",
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "提升工作效率",
    description: "通过简化会议安排过程，Timely.AI 帮助您和您的团队显著提高整体工作效率。",
  },
]

export function ProductAdvantages() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选择 Timely.AI？</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {advantage.icon}
                  <span className="ml-2">{advantage.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{advantage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

