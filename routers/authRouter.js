const authControllers = require("../controllers/authControllers")

const router = require("express").Router()

router.post("/register", authControllers.register)

module.exports = router
