const router = require("express").Router()
const { adminRevenueController } = require("../controllers")

router.post("/", adminRevenueController.getRevenue)

module.exports = router
