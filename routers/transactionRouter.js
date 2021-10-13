const { TransactionController } = require("../controllers")

const router = require("express").Router()

router.get("/fill-parcel-data/:idParcel", TransactionController.getFillParcelData)
router.get("/fill-parcel-product/:idCategory", TransactionController.getFillParcelProduct)
router.post("/new-order", TransactionController.newOrder)

module.exports = router
