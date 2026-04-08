import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { webhookMercadoPago } from './routes/webhookMercadoPago.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// ─── CORS ───
app.use(cors())

// ─── Body parsing ───
// Raw body needed for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

// ─── API Routes ───
app.post('/api/webhook/mercadopago', webhookMercadoPago)

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Serve frontend in production ───
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[Comand Server] Running on port ${PORT}`)
  console.log(`[Comand Server] Webhook endpoint: POST /api/webhook/mercadopago`)
})
