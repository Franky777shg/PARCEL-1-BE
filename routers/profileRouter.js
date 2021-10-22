const profileController = require("../controllers/profileController");
const router = require("express").Router();
const { verifyToken } = require("../helpers/jwt");
const { upload } = require("../helpers/multer");
const uploader = upload();

router.put(
  "/updateProfileData",
  verifyToken,
  profileController.updateProfileData
);
router.put(
  "/updateProfilePhoto",
  uploader,
  verifyToken,
  profileController.updateProfilePhoto
);
router.post(
  "/changePassword",
  verifyToken,
  profileController.changeProfilePassword
);
module.exports = router;
