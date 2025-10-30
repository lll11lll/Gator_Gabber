"use client"

import { useEffect, useRef } from "react"

// Use a different name to avoid colliding with the global `Symbol` type
interface LetterSymbol {
  id: number
  x: number
  y: number
  size: number
  symbol: string
  opacity: number
  speed: number
  rotation: number
  rotationSpeed: number
  color: string
}

const Letters = [
  "A",
  "B",
  "C",
  "CH",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "LL",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
]

export default function LettersAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const symbolsRef = useRef<LetterSymbol[]>([])
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Theme colors: orange and blue
    const themeColors = ["#FF7A00", "#0A74FF"]

    // Helper: convert hex like '#RRGGBB' to 'r,g,b'
    const hexToRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const bigint = parseInt(h, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return `${r},${g},${b}`
    }

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      initSymbols()
    }

    const initSymbols = () => {
      const symbols: LetterSymbol[] = []
      const count = Math.floor(canvas.width / 10) // Adjust symbol density

      for (let i = 0; i < count; i++) {
        // Alternate colors so both orange and blue appear across the canvas
        const color = themeColors[i % themeColors.length]
        symbols.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 14 + Math.random() * 24,
          symbol: Letters[Math.floor(Math.random() * Letters.length)],
          opacity: 0.2 + Math.random() * 0.6,
          speed: 0.5 + Math.random() * 1.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          color,
        })
      }

      symbolsRef.current = symbols
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      symbolsRef.current.forEach((symbol) => {
        // Update position
        symbol.y += symbol.speed
        symbol.rotation += symbol.rotationSpeed

        // Reset if out of bounds
        if (symbol.y > canvas.height) {
          symbol.y = -symbol.size
          symbol.x = Math.random() * canvas.width
        }

    // Draw symbol
    ctx.save()
    ctx.translate(symbol.x, symbol.y)
    ctx.rotate(symbol.rotation)
    ctx.font = `${symbol.size}px sans-serif`
    // use the symbol's assigned theme color, preserving per-symbol opacity
    ctx.fillStyle = `rgba(${hexToRgb(symbol.color)}, ${symbol.opacity})`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(symbol.symbol, 0, 0)
    ctx.restore()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ minHeight: "200px" }}
      aria-hidden="true"
    />
  )
}


// export const metadata: Metadata = {
//   title: "Gator Lawn Solutions Inc.",
//   description: "Sales of lawnmowers and professional lawn care equipment",
//   icons: {
//     icon: "/logo.png"
//   },
// }