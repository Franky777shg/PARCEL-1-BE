const { transactionController } = require("../controllers")
const { verifyToken } = require("../helpers/jwt")
const { upload } = require("../helpers/multer")
const uploader = upload()

const router = require("express").Router()

router.get("/fill-parcel-data/:idParcel", transactionController.getFillParcelData)
router.get("/fill-parcel-product/:idCategory", transactionController.getFillParcelProduct)
router.post("/new-order", transactionController.newOrder)
router.get("/cart", verifyToken, transactionController.getUserCart)
router.patch("/cart/qty", transactionController.patchQtyCartDetail)
router.delete("/cart", transactionController.deleteCartItem)
router.post("/checkout", transactionController.onCheckout)
router.get("/upload-payment/:idorder", verifyToken, transactionController.getUploadPayment)
router.get("/order-status", transactionController.getOrderStatus)
router.patch(
  "/upload-payment/:idorder/:type",
  verifyToken,
  uploader,
  transactionController.patchUploadPayment
)
router.get("/history", verifyToken, transactionController.getUserTransaction)
router.get("/history/:idOrderStatus", verifyToken, transactionController.getUserTransactionByStatus)
router.get("/detail/:idorder", verifyToken, transactionController.getUserTransactionDetail)

module.exports = router
