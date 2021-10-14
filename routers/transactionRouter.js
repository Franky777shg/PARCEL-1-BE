const { TransactionController } = require("../controllers")
const { verifyToken } = require("../helpers/jwt")

const router = require("express").Router()

router.get("/fill-parcel-data/:idParcel", TransactionController.getFillParcelData)
router.get("/fill-parcel-product/:idCategory", TransactionController.getFillParcelProduct)
router.post("/new-order", TransactionController.newOrder)
router.get("/cart", verifyToken, TransactionController.getUserCart)
router.patch("/cart/qty", TransactionController.patchQtyCartDetail)
router.delete("/cart", TransactionController.deleteCartItem)

module.exports = router
