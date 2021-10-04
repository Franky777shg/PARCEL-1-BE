const jwt = require("jsonwebtoken")
const SECRET_KEY = process.env.SECRET_KEY

module.exports = {
  createToken: (data) => {
    let token = jwt.sign(data, SECRET_KEY, { expiresIn: "5h" })
    return token
  },
  verifyToken: (req, res, next) => {
    if (!req.token) {
      return res.status(401).send("Anda tidak diizinkan untuk mengakses halaman ini")
    }

    jwt.verify(req.token, SECRET_KEY, (err, result) => {
      if (err) {
        return res.status(401).send(err.message)
      }
      req.payload = result
      next()
    })
  },
}
