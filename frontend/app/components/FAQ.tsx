import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Timely.AI 如何工作？",
    answer:
      "Timely.AI 使用先进的人工智能算法分析所有参与者的日程，自动找出最佳的会议时间。然后，它会通过多个渠道（如邮件、IM、短信等）与参与者确认，最后自动发送会议邀请。",
  },
  {
    question: "Timely.AI 支持哪些日历系统？",
    answer:
      "Timely.AI 支持所有主流的日历系统，包括 Google Calendar、Microsoft Outlook、Apple Calendar 等。我们还在不断扩展支持的系统范围。",
  },
  {
    question: "使用 Timely.AI 是否安全？",
    answer:
      "是的，Timely.AI 非常重视用户数据的安全性。我们使用最先进的加密技术保护您的信息，并严格遵守数据保护法规。我们不会出售或滥用您的个人信息。",
  },
  {
    question: "Timely.AI 适合什么规模的公司使用？",
    answer:
      "Timely.AI 适合各种规模的公司使用，从小型创业公司到大型跨国企业都能受益。我们提供灵活的定价方案，可以根据您的需求进行调整。",
  },
]

export function FAQ() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

