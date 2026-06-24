const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const { AppError, catchAsync } = require('../middlewares/error.middleware')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  })
}

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, currency, monthlyBudget } = req.body
  const user = await User.create({ name, email, password, currency, monthlyBudget })
  createSendToken(user, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  createSendToken(user, 200, res)
})

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { user: req.user } })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /update-password.', 400))
  }

  const allowedFields = ['name', 'currency', 'monthlyBudget']
  const filteredBody = {}
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) filteredBody[field] = req.body[field]
  })

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ status: 'success', data: { user: updatedUser } })
})
