const authControllers = require("../controllers/authControllers");
const router = require("express").Router();
const { verifyToken } = require("../helpers/jwt");

router.post("/register", authControllers.register);
router.post("/verify", verifyToken, authControllers.verify);
router.post("/login", authControllers.login);
router.post("/keep-login", verifyToken, authControllers.keepLogin);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", verifyToken, authControllers.resetPassword);

module.exports = router;
