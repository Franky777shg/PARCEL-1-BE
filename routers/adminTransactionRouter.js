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
  "/getTransactions",
  adminTransactionControllers.getTransactionsByStatus
);

module.exports = router;
