const profileController = require("../controllers/profileController");
const router = require("express").Router();
const { verifyToken } = require("../helpers/jwt");

router.put(
  "/updateProfileData",
  verifyToken,
  profileController.updateProfileData
);

module.exports = router;
