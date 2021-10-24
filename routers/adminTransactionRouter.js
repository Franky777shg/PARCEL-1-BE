const router = require("express").Router();
const adminTransactionControllers = require("../controllers/adminTransactionControllers");

router.get(
  "/getAllTransactions",
  adminTransactionControllers.getAllTransactions
);
router.get(
  "/getDetailTransaction/:idOrder",
  adminTransactionControllers.getTransactionDetail
);
router.get(
  "/getTransactions/:idOrderStatus",
  adminTransactionControllers.getTransactionsByStatus
);

module.exports = router;
