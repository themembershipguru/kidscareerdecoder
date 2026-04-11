import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import quizRoutes from './routes/quiz.js'
import sessionRoutes from './routes/session.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'

const app = express()
const port = Number(process.env.PORT) || 5000
const aiProvider = process.env.AI_PROVIDER || 'claude'

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (_req, res) => {
  res.json({ ok: true, aiProvider })
})

app.listen(port, () => {
  console.log(`backend listening on ${port}`)
})
