class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`
    statusCode = 409
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ')
    statusCode = 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.'
    statusCode = 401
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.'
    statusCode = 401
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({ status: 'error', message, stack: err.stack })
  }

  res.status(statusCode).json({ status: 'error', message })
}

module.exports = { AppError, catchAsync, errorHandler }
