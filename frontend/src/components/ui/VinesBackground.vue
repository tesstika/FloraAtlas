<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Point {
  x: number
  y: number
}

type VineState = 'growing' | 'fading' | 'dead'

class Vine {
  points: Point[] = []
  maxPoints: number
  x: number
  y: number
  angle: number
  speed: number
  lineWidth: number
  colorRgb: string
  state: VineState = 'growing'
  age = 0
  maxAge: number
  curveSpeed: number

  constructor(width: number, height: number, isBranch = false, startX?: number, startY?: number, startAngle?: number) {
    this.maxPoints = Math.floor(Math.random() * 30) + 35
    this.maxAge = Math.floor(Math.random() * 180) + 140
    this.speed = Math.random() * 1.0 + 0.9
    this.lineWidth = Math.random() * 1.5 + 1.1
    this.curveSpeed = (Math.random() - 0.5) * 0.05

    const colors = [
      'rgba(47, 107, 79,',   // Emerald
      'rgba(110, 168, 134,', // Sage
      'rgba(72, 148, 110,',  // Mint
      'rgba(145, 196, 163,'  // Soft Leaf
    ]
    this.colorRgb = colors[Math.floor(Math.random() * colors.length)]

    if (isBranch && startX !== undefined && startY !== undefined && startAngle !== undefined) {
      this.x = startX
      this.y = startY
      this.angle = startAngle + (Math.random() - 0.5) * 0.8
    } else {
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) { // Top
        this.x = Math.random() * width
        this.y = 0
        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5
      } else if (edge === 1) { // Right
        this.x = width
        this.y = Math.random() * height
        this.angle = Math.PI + (Math.random() - 0.5) * 0.5
      } else if (edge === 2) { // Bottom
        this.x = Math.random() * width
        this.y = height
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
      } else { // Left
        this.x = 0
        this.y = Math.random() * height
        this.angle = (Math.random() - 0.5) * 0.5
      }
    }

    this.points.push({ x: this.x, y: this.y })
  }

  update(width: number, height: number, vines: Vine[]) {
    if (this.state === 'growing') {
      this.age++
      this.angle += this.curveSpeed + (Math.random() - 0.5) * 0.04
      this.x += Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed

      this.points.push({ x: this.x, y: this.y })

      if (this.points.length > this.maxPoints) {
        this.points.shift()
      }

      if (this.age < this.maxAge * 0.6 && Math.random() < 0.01 && vines.length < 16) {
        vines.push(new Vine(width, height, true, this.x, this.y, this.angle))
      }

      if (
        this.age >= this.maxAge ||
        this.x < -50 ||
        this.x > width + 50 ||
        this.y < -50 ||
        this.y > height + 50
      ) {
        this.state = 'fading'
      }
    } else if (this.state === 'fading') {
      this.points.shift()
      if (this.points.length === 0) {
        this.state = 'dead'
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const len = this.points.length
    if (len < 2) return

    ctx.lineWidth = this.lineWidth

    const chunkSize = Math.max(1, Math.floor(len / 3))

    for (let c = 0; c < 3; c++) {
      const startIdx = c * chunkSize
      const endIdx = c === 2 ? len - 1 : Math.min(len - 1, (c + 1) * chunkSize)

      if (startIdx >= endIdx) continue

      const avgFactor = (startIdx + endIdx) / (2 * len)
      const opacity = avgFactor * 0.25

      ctx.beginPath()
      ctx.strokeStyle = this.colorRgb + opacity + ')'
      ctx.moveTo(this.points[startIdx].x, this.points[startIdx].y)

      for (let i = startIdx + 1; i <= endIdx; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y)
      }
      ctx.stroke()
    }
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
const vines: Vine[] = []

function handleResize() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

function animate() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (vines.length < 9) {
      vines.push(new Vine(canvas.width, canvas.height))
    }

    for (let i = vines.length - 1; i >= 0; i--) {
      const vine = vines[i]
      vine.update(canvas.width, canvas.height, vines)
      vine.draw(ctx)

      if (vine.state === 'dead') {
        vines.splice(i, 1)
      }
    }
  }

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  if (canvasRef.value) {
    for (let i = 0; i < 8; i++) {
      vines.push(new Vine(canvasRef.value.width, canvasRef.value.height))
    }
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 w-full h-full pointer-events-none -z-50"
  ></canvas>
</template>

<style scoped>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -50;
}
</style>
