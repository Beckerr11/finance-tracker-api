const express = require('express')
const router = express.Router()
const transactionController = require('../controllers/transaction.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)

router.route('/').get(transactionController.getAllTransactions).post(transactionController.createTransaction)

router
  .route('/:id')
  .get(transactionController.getTransaction)
  .patch(transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction)

module.exports = router
