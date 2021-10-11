const { TransactionController } = require("../controllers")

const router = require("express").Router()

router.get("/fill-parcel-data/:idParcel", TransactionController.getFillParcelData)
router.get("/fill-parcel-product/:idCategory", TransactionController.getFillParcelProduct)
router.post("/new-order", TransactionController.newOrder)
router.post("/check-stock", TransactionController.checkStock)

module.exports = router
