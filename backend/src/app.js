import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import plantRoutes from './routes/plantRoutes.js'
import observationRoutes from './routes/observationRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initDatabase } from './config/db.js'
import { seedDatabase } from './models/seedData.js'

dotenv.config()

const app = express()

// Initialize DB schema & seed default data
initDatabase()
seedDatabase()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// API Route mounts
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/observations', observationRoutes)
app.use('/api/teacher', teacherRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FloraAtlas API', timestamp: new Date() })
})

// Global Error Handler
app.use(errorHandler)

export default app
