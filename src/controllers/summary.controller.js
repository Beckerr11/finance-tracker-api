const Transaction = require('../models/Transaction.model')
const { catchAsync } = require('../middlewares/error.middleware')

exports.getMonthlySummary = catchAsync(async (req, res, next) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const summary = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])

  const income = summary.find((s) => s._id === 'income') || { total: 0, count: 0 }
  const expense = summary.find((s) => s._id === 'expense') || { total: 0, count: 0 }
  const balance = income.total - expense.total
  const savingsRate = income.total > 0 ? ((balance / income.total) * 100).toFixed(2) : 0

  res.status(200).json({
    status: 'success',
    data: {
      period: { year: Number(year), month: Number(month) },
      income: income.total,
      expense: expense.total,
      balance,
      savingsRate: Number(savingsRate),
      transactionCount: income.count + expense.count,
      monthlyBudget: req.user.monthlyBudget,
      budgetUsed: req.user.monthlyBudget > 0 ? ((expense.total / req.user.monthlyBudget) * 100).toFixed(2) : null,
    },
  })
})

exports.getCategoryBreakdown = catchAsync(async (req, res, next) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1, type = 'expense' } = req.query

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const breakdown = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ])

  const grandTotal = breakdown.reduce((acc, item) => acc + item.total, 0)

  const result = breakdown.map((item) => ({
    category: item._id,
    total: item.total,
    count: item.count,
    percentage: grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(2) : 0,
  }))

  res.status(200).json({ status: 'success', data: { type, breakdown: result, grandTotal } })
})

exports.getYearlyOverview = catchAsync(async (req, res, next) => {
  const { year = new Date().getFullYear() } = req.query

  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)

  const overview = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ])

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    balance: 0,
  }))

  overview.forEach(({ _id, total }) => {
    const monthData = months[_id.month - 1]
    if (_id.type === 'income') monthData.income = total
    if (_id.type === 'expense') monthData.expense = total
    monthData.balance = monthData.income - monthData.expense
  })

  res.status(200).json({ status: 'success', data: { year: Number(year), months } })
})
