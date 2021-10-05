const authControllers = require("../controllers/authControllers")
const router = require("express").Router()
const { verifyToken } = require('../helpers/jwt')

router.post("/register", authControllers.register)
router.post("/verify", verifyToken, authControllers.verify)

module.exports = router
