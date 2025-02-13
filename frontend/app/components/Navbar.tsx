"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  if (pathname === "/") {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-70 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-bold text-2xl gradient-text">Timely.AI</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Dashboard
            </Link>
            <Link
              href="/schedule"
              className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Schedule Meeting
            </Link>
            <Link
              href="/meetings"
              className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Meetings
            </Link>
            <Link
              href="/integrations"
              className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Integrations
            </Link>
            <Link
              href="/settings"
              className="py-2 px-2 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

