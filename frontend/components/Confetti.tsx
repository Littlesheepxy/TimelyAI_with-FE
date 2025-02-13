import React, { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

interface ConfettiProps {
  isActive: boolean
}

export function Confetti({ isActive }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isActive && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      })

      const duration = 5000 // 5 seconds
      const animationEnd = Date.now() + duration

      const makeShot = (particleRatio: number, opts: confetti.Options) => {
        myConfetti(
          Object.assign(
            {},
            {
              particleCount: Math.floor(500 * particleRatio),
              spread: 100,
              origin: { y: 0.6 },
              scalar: 2,
              gravity: 0.8,
              drift: 0,
              ticks: 300,
            },
            opts,
          ),
        )
      }

      // First shot
      makeShot(0.5, { spread: 60, startVelocity: 50 })
      makeShot(0.5, { spread: 80, startVelocity: 70 })

      // Second shot after 2.5 seconds
      setTimeout(() => {
        makeShot(0.5, { spread: 70, startVelocity: 60 })
        makeShot(0.5, { spread: 90, startVelocity: 80 })
      }, 2500)

      // Gradual fade out
      const fadeOutInterval = setInterval(() => {
        if (Date.now() > animationEnd) {
          clearInterval(fadeOutInterval)
          myConfetti.reset()
        }
      }, 250)

      return () => {
        clearInterval(fadeOutInterval)
        myConfetti.reset()
      }
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  )
}

