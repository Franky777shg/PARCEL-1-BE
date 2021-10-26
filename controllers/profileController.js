const { db } = require("../database");
const SECRET_KEY = process.env.SECRET_KEY;
const crypto = require("crypto");

module.exports = {
  //input and edit profile
  updateProfileData: (req, res) => {
    const { name, email, address, gender, age } = req.body;
    const { idusers } = req.payload;

    const updateProfile = `UPDATE profile SET name = ${db.escape(
      name
    )}, email = ${db.escape(email)}, address = ${db.escape(
      address
    )}, age = ${db.escape(age)}, gender = ${db.escape(
      gender
    )} WHERE idusers = ${db.escape(idusers)}`;
    db.query(updateProfile, (errUpdateProfile, resUpdateProfile) => {
      if (errUpdateProfile) {
        return res.status(400).send(errUpdateProfile);
      }
      // console.log(resUpdateProfile);
      const getNewProfileData = `SELECT * FROM profile WHERE idusers = ${db.escape(
        idusers
      )}`;
      db.query(
        getNewProfileData,
        (errGetNewProfileData, resGetNewProfileData) => {
          if (errGetNewProfileData) {
            res.status(400).send(errGetNewProfileData);
          }
          res.status(200).send(resGetNewProfileData[0]);
        }
      );
    });
  },
  //upload profile photo
  updateProfilePhoto: (req, res) => {
    const { idusers } = req.payload;
    // console.log("req.file", req.file);

    if (!req.file) {
      res.status(400).send("NO FILE");
    }

    const updatePhoto = `UPDATE profile SET avatar = "${
      req.file.filename
    }" WHERE idusers = ${db.escape(idusers)}`;
    db.query(updatePhoto, (errUpdatePhoto, resUpdatePhoto) => {
      if (errUpdatePhoto) {
        // console.log(errUpdatePhoto);
        res.status(400).send(errUpdatePhoto);
      }

      res.status(200).send({ avatar: req.file.filename });
    });
  },
  //change password
  changeProfilePassword: (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { idusers } = req.payload;
    // Hash password
    const hashOldPassword = crypto
      .createHmac("sha1", SECRET_KEY)
      .update(oldPassword)
      .digest("hex");
    const hashNewPassword = crypto
      .createHmac("sha1", SECRET_KEY)
      .update(newPassword)
      .digest("hex");
    // Get old password query
    const getOldPassword = `SELECT password FROM users WHERE idusers = ${db.escape(
      idusers
    )} `;
    // Update new password query
    const updateUsersPassword = `UPDATE users SET password=${db.escape(
      hashNewPassword
    )} WHERE idusers=${db.escape(idusers)}`;
    db.query(getOldPassword, (errGetOldPassword, resGetOldPassword) => {
      // console.log(resGetOldPassword[0].password);
      if (errGetOldPassword)
        return res.status(500).send("Terjadi kesalahan pada server!");
      if (resGetOldPassword[0].password !== hashOldPassword)
        return res.status(400).send("Password lama salah!");
      if (resGetOldPassword[0].password === hashOldPassword)
        return db.query(updateUsersPassword, (err, result) => {
          if (err)
            return res.status(500).send("Terjadi kesalahan pada server!");
          res.status(200).send("Kata sandi anda berhasil diubah!");
        });
    });
  },
  //remove profile photo
  removeProfilePhoto: (req, res) => {
    const { idusers } = req.payload;
    const removePhoto = `UPDATE profile SET avatar = null WHERE idusers = ${db.escape(
      idusers
    )}`;
    db.query(removePhoto, (errRemovePhoto, resRemovePhoto) => {
      if (errRemovePhoto) {
        res.status(400).send(errRemovePhoto);
      }
      res.status(200).send("Foto berhasil dihapus");
    });
  },
};
