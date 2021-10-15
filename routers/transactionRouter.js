const { TransactionController } = require("../controllers")
const { verifyToken } = require("../helpers/jwt")
const { upload } = require("../helpers/multer")
const uploader = upload()

const router = require("express").Router()

router.get("/fill-parcel-data/:idParcel", TransactionController.getFillParcelData)
router.get("/fill-parcel-product/:idCategory", TransactionController.getFillParcelProduct)
router.post("/new-order", TransactionController.newOrder)
router.get("/cart", verifyToken, TransactionController.getUserCart)
router.patch("/cart/qty", TransactionController.patchQtyCartDetail)
router.delete("/cart", TransactionController.deleteCartItem)
router.post("/checkout", TransactionController.onCheckout)
router.get("/upload-payment/:idorder", verifyToken, TransactionController.getUploadPayment)
router.get("/order-status", TransactionController.getOrderStatus)
router.patch(
  "/upload-payment/:idorder/:type",
  verifyToken,
  uploader,
  TransactionController.patchUploadPayment
)
router.get("/history", verifyToken, TransactionController.getUserTransaction)
router.get("/history/:idOrderStatus", verifyToken, TransactionController.getUserTransactionByStatus)
router.get("/detail/:idorder", verifyToken, TransactionController.getUserTransactionDetail)

module.exports = router
