"use client"

import React, { useState, useEffect } from "react"

const phrases = ["会议安排，交给Timely.AI", "自动化邀约，精准安排", "节省时间，提高效率", "智能助手，让协作更顺畅"]

export default function TypewriterEffect() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isDeleting) {
        if (charIndex > 0) {
          setCharIndex((prev) => prev - 1)
        } else {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      } else {
        if (charIndex < phrases[phraseIndex].length) {
          setCharIndex((prev) => prev + 1)
        } else {
          setIsDeleting(true)
        }
      }
    }, 100) // 调整速度

    return () => clearInterval(typingInterval)
  }, [charIndex, isDeleting, phraseIndex])

  return (
    <p className="min-h-[2em] text-xl">
      {" "}
      {/* 使用 min-height 来防止布局偏移 */}
      {phrases[phraseIndex].substring(0, charIndex)}
      <span className="animate-blink">|</span>
    </p>
  )
}

