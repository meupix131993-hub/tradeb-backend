import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import { authMiddleware } from './middleware/authMiddleware'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    message: 'TradeB API online',
    status: 'ok',
  })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
  })
})

export { app }