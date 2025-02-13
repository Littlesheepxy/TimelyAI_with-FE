import Link from "next/link"
import { useState } from "react"
import { AuthModal } from "@/app/components/AuthModal"

export default function HomeNavbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-md shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-bold text-2xl text-white">Timely.AI</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button
              className="py-2 px-4 font-medium text-white rounded border border-white hover:bg-white hover:text-purple-600 transition duration-300"
              onClick={() => setIsAuthModalOpen(true)}
            >
              登录 / 注册
            </button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  )
}

