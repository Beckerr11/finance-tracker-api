const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const transactionRoutes = require('./routes/transaction.routes')
const categoryRoutes = require('./routes/category.routes')
const summaryRoutes = require('./routes/summary.routes')
const { errorHandler } = require('./middlewares/error.middleware')

const app = express()

// Security middlewares
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', credentials: true }))
app.use(express.json({ limit: '10kb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/summary', summaryRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

module.exports = app
