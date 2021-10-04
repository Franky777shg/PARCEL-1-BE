const crypto = require("crypto")
const { db } = require("../database")
const { isEmail } = require("validator")
const { createToken } = require("../helpers/jwt")
const { transporter } = require("../helpers/nodemailer")
const SECRET_KEY = process.env.SECRET_KEY

module.exports = {
  register: (req, res) => {
    const { username, email, password, name, address } = req.body

    // Check Input Kosong
    if (Object.keys(req.body).length === 0)
      return res.status(400).send("Mohon masukkan seluruh data!")

    // Check Email Valid
    if (!isEmail(email || "")) return res.status(422).send("Mohon masukkan email yang valid!")

    // Query Check Email or Username Exist
    const checkDoubleUsernameOrEmail = `
      SELECT *
      FROM users u
      LEFT JOIN profile p
        ON u.idusers=p.idusers
      WHERE u.username = ${db.escape(username)} OR p.email = ${db.escape(email)}
    `

    db.query(checkDoubleUsernameOrEmail, (errCheck, resCheck) => {
      if (errCheck) return res.status(500).send("Terjadi kesalahan pada server!")

      if (resCheck.length !== 0) {
        if (resCheck[0].username === username)
          return res.status(400).send("Username sudah digunakan!")

        if (resCheck[0].email === email) return res.status(400).send("Email sudah digunakan!")
      }

      // Hash Password
      const hashPassword = crypto.createHmac("sha1", SECRET_KEY).update(password).digest("hex")

      const newUserData = {
        username,
        password: hashPassword,
      }

      // Query Insert User Data
      const insertUserData = `
      INSERT INTO users
      SET ?
      `

      db.query(insertUserData, newUserData, (errInsertUserData, resInsertUserData) => {
        if (errInsertUserData) return res.status(500).send("Terjadi kesalahan pada server!")

        const idusers = resInsertUserData.insertId

        const token = createToken({
          idusers,
        })

        const newProfileData = {
          idusers,
          email,
          name,
          address,
        }

        // Query Insert Profile Data
        const insertProfileData = `
        INSERT INTO profile
        SET ?
        `

        db.query(
          insertProfileData,
          newProfileData,
          (errInsertProfileData, _resInsertProfileData) => {
            if (errInsertProfileData) return res.status(500).send("Terjadi kesalahan pada server!")

            transporter.sendMail({
              from: '"Admin ADJ Parcel" <adjparcel@gmail.com>', // sender address
              to: `${email}`, // list of receivers
              subject: `Verifikasi Akun untuk ${name}`, // Subject line
              html: `<p>Halo ${name}!,</p><br/><a href="http://localhost:3000/verify/${token}">Klik disini untuk verifikasi akun anda!</a>`, // html body
            })

            res.status(200).send(`Registrasi Berhasil! Silahkan cek email ${email} untuk memverifikasi akun anda!`)
          }
        )
      })
    })
  },
}
