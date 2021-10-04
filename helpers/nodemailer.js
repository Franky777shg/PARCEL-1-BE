const nodemailer = require("nodemailer")
const KEY = process.env.GOOGLE_KEY

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adjparcel@gmail.com",
    pass: KEY,
  },
  tls: {
    rejectUnauthorized: true,
  },
})

module.exports = { transporter }