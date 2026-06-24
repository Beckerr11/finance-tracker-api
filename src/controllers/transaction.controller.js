const Transaction = require('../models/Transaction.model')
const { AppError, catchAsync } = require('../middlewares/error.middleware')

exports.createTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.create({ ...req.body, user: req.user._id })
  res.status(201).json({ status: 'success', data: { transaction } })
})

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const { type, category, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query

  const filter = { user: req.user._id }
  if (type) filter.type = type
  if (category) filter.category = category
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate)
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ])

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: { transactions },
  })
})

exports.getTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
  if (!transaction) return next(new AppError('Transaction not found', 404))
  res.status(200).json({ status: 'success', data: { transaction } })
})

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  )
  if (!transaction) return next(new AppError('Transaction not found', 404))
  res.status(200).json({ status: 'success', data: { transaction } })
})

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!transaction) return next(new AppError('Transaction not found', 404))
  res.status(204).json({ status: 'success', data: null })
})
