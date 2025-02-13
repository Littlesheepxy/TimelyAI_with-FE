"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import HomeNavbar from "@/app/components/HomeNavbar"
import TypewriterEffect from "@/app/components/TypewriterEffect"
import { CustomerReviews } from "@/app/components/CustomerReviews"
import { ProductAdvantages } from "@/app/components/ProductAdvantages"
import { FAQ } from "@/app/components/FAQ"
import { AuthModal } from "@/app/components/AuthModal"
import { useState } from "react"

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <HomeNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl font-bold mb-6">让AI助力您的会议安排，从此高效无忧</h1>
          <div className="text-2xl mb-8">
            <TypewriterEffect />
          </div>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 mt-8"
            onClick={() => setIsAuthModalOpen(true)}
          >
            开始使用 <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="bg-white">
        <ProductAdvantages />
        <CustomerReviews />
        <FAQ />
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-8">准备好提升您的会议效率了吗？</h2>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => setIsAuthModalOpen(true)}
          >
            立即开始免费试用
          </Button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

