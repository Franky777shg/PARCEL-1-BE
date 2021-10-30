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
              html: `<p>Halo ${name}!,</p><br/><a href="https://parcel-1.purwadhikafs2.com/verify/${token}">Klik disini untuk verifikasi akun anda!</a>`, // html body
            })

            res
              .status(201)
              .send(
                `Registrasi Berhasil! Silahkan cek email ${email} untuk memverifikasi akun anda!`
              )
          }
        )
      })
    })
  },
  verify: (req, res) => {
    const { idusers } = req.payload

    const checkVerify = `
    SELECT idusers, verify
    FROM users
    WHERE idusers=${db.escape(idusers)}
    `

    db.query(checkVerify, (errCheckVerify, resCheckVerify) => {
      if (errCheckVerify) return res.status(500).send("Telah terjadi kesalahan pada server")

      if (resCheckVerify.length === 0) {
        return res.status(400).send("Akun tidak ditemukan")
      }

      if (resCheckVerify[0].verify === 1) {
        return res.status(200).send("Akun anda sudah diverifikasi")
      }

      const verifyUser = `
      UPDATE users
      SET verify=1
      WHERE idusers=${db.escape(idusers)}
      `

      db.query(verifyUser, (errVerifyUser, _resVerifyUser) => {
        if (errVerifyUser) return res.status(500).send("Telah terjadi kesalahan pada server")

        res.status(200).send("Akun anda berhasil diverifikasi")
      })
    })
  },
  login: (req, res) => {
    // Hash Password
    const { username, password = "" } = req.body
    const hashPassword = crypto.createHmac("sha1", SECRET_KEY).update(password).digest("hex")

    // Check Username dan Password
    const checkUsernameAndPassword = `
    SELECT u.idusers, username, password, role, verify, email, name, address, avatar, gender, age FROM users u
    LEFT JOIN profile p ON u.idusers=p.idusers
    WHERE username=${db.escape(username)} AND password=${db.escape(hashPassword)}
    `

    db.query(checkUsernameAndPassword, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      if (result.length === 0) return res.status(404).send("Username / Kata Sandi Salah!")

      const userData = result[0]

      // Check Verify
      if (userData.verify !== 1) return res.status(403).send("Akun anda belum diverifikasi!")

      delete userData.verify
      delete userData.password

      const { idusers } = userData

      const token = createToken({
        idusers,
      })

      res.status(200).send({ user: userData, token })
    })
  },
  keepLogin: (req, res) => {
    const { idusers } = req.payload

    const keepLogin = `
    SELECT u.idusers, username, role, email, name, address, avatar, gender, age FROM users u
    LEFT JOIN profile p ON u.idusers=p.idusers
    WHERE u.idusers=${db.escape(idusers)}
    `

    db.query(keepLogin, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const userData = result[0]

      return res.status(200).send(userData)
    })
  },
  forgotPassword: (req, res) => {
    const { email } = req.body

    const forgotPassword = `
    SELECT idusers, email, name
    FROM profile
    WHERE email=${db.escape(email)}
    `

    db.query(forgotPassword, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      if (result.length === 0) return res.status(404).send("Email tidak ditemukan!")

      const { idusers, name } = result[0]

      const token = createToken({
        idusers,
      })

      transporter.sendMail({
        from: '"Admin ADJ Parcel" <adjparcel@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: `Permintaan Lupa Kata Sandi untuk akun ${name}`, // Subject line
        html: `<p>Halo ${name}!, kamu baru saja meminta lupa kata sandi</p><br/><p>Link ini berlaku untuk 5 jam!</p><br /><a href="https://parcel-1.purwadhikafs2.com/reset-password/${token}">Klik disini untuk mereset ulang kata sandi anda!</a>`, // html body
      })

      res
        .status(200)
        .send(
          `Permintaan Lupa Kata Sandi Sukses! Silahkan cek email ${email} untuk mereset ulang kata sandi akun anda!`
        )
    })
  },
  resetPassword: (req, res) => {
    const { idusers } = req.payload
    const { password = "" } = req.body

    if (password === "") return res.status(400).send("Mohon masukkan seluruh data!")

    const hashPassword = crypto.createHmac("sha1", SECRET_KEY).update(password).digest("hex")

    const resetPassword = `
    UPDATE users
    SET password=${db.escape(hashPassword)}
    WHERE idusers=${db.escape(idusers)}
    `

    db.query(resetPassword, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      res
        .status(200)
        .send(
          `Kata sandi anda berhasil diubah! Silahkan masuk untuk melanjutkan sesi anda!`
        )
    })
  },
}
