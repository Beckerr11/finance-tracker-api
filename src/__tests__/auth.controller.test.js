import request from 'supertest'
import app from '../app'

const registerPayload = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecurePassword123!',
  ...overrides,
})

describe('Auth API', () => {
  it('registers a user and never returns the password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload())

    expect(response.status).toBe(201)
    expect(response.body.status).toBe('success')
    expect(response.body).toHaveProperty('token')
    expect(response.body.data.user.email).toBe('test@example.com')
    expect(response.body.data.user).not.toHaveProperty('password')
  })

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(registerPayload())

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ name: 'Another User' }))

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('error')
  })

  it('rejects a password shorter than the schema minimum', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ email: 'weak@example.com', password: '123' }))

    expect(response.status).toBe(400)
  })

  it('logs in with valid credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ email: 'login@example.com' }))

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'SecurePassword123!' })

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('success')
    expect(response.body).toHaveProperty('token')
    expect(response.body.data.user.email).toBe('login@example.com')
  })

  it('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'WrongPassword123!' })

    expect(response.status).toBe(401)
    expect(response.body.status).toBe('error')
  })

  it('returns the authenticated user for a valid bearer token', async () => {
    const registration = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ email: 'me@example.com' }))

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registration.body.token}`)

    expect(response.status).toBe(200)
    expect(response.body.data.user.email).toBe('me@example.com')
    expect(response.body.data.user).not.toHaveProperty('password')
  })
})
