const { db } = require("../database");
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
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
      console.log(resUpdateProfile);
      const getNewProfileData = `SELECT * FROM profile  where idusers = ${db.escape(
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
};
