const router = require("express").Router()
const { adminRevenueController } = require("../controllers")

router.get("/", adminRevenueController.getAllRevenue)
router.post("/date", adminRevenueController.getRevenueByDate)
router.post("/date-range", adminRevenueController.getRevenueByDateRange)
router.post("/month", adminRevenueController.getRevenueByMonth)

module.exports = router
