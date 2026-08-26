const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const User = require('../models/User.model')
const Transaction = require('../models/Transaction.model')

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance-tracker-test'

describe('Finance Tracker API', () => {
  beforeAll(async () => {
    await mongoose.connect(mongoUri)
  })

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Transaction.deleteMany({})])
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('exposes a health check', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  it('registers a user and returns a JWT session', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePassword123!',
      currency: 'BRL',
      monthlyBudget: 5000,
    })

    expect(response.status).toBe(201)
    expect(response.body.status).toBe('success')
    expect(response.body).toHaveProperty('token')
    expect(response.body.data.user).toHaveProperty('email', 'test@example.com')
    expect(response.body.data.user).not.toHaveProperty('password')
  })

  it('rejects a duplicate e-mail with a conflict response', async () => {
    const payload = {
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'SecurePassword123!',
    }

    await request(app).post('/api/v1/auth/register').send(payload)
    const response = await request(app).post('/api/v1/auth/register').send(payload)

    expect(response.status).toBe(409)
    expect(response.body.status).toBe('error')
  })

  it('rejects weak passwords through model validation', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'weak@example.com',
      password: '123',
    })

    expect(response.status).toBe(400)
  })

  it('logs in with valid credentials and rejects invalid ones', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'SecurePassword123!',
    })

    const success = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'SecurePassword123!',
    })
    expect(success.status).toBe(200)
    expect(success.body).toHaveProperty('token')

    const failure = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'WrongPassword123!',
    })
    expect(failure.status).toBe(401)
  })

  it('serves an authenticated monthly summary', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Summary User',
      email: 'summary@example.com',
      password: 'SecurePassword123!',
      monthlyBudget: 3000,
    })

    const response = await request(app)
      .get('/api/v1/summary/monthly?year=2026&month=8')
      .set('Authorization', `Bearer ${register.body.token}`)

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('success')
    expect(response.body.data).toMatchObject({ income: 0, expense: 0, balance: 0, transactionCount: 0 })
  })
})
