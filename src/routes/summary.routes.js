const express = require('express')
const summaryController = require('../controllers/summary.controller')
const { protect } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(protect)

router.get('/monthly', summaryController.getMonthlySummary)
router.get('/category', summaryController.getCategoryBreakdown)
router.get('/yearly', summaryController.getYearlyOverview)

module.exports = router
