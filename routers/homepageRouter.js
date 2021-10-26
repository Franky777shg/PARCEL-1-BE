const router = require("express").Router();

const { homepageController } = require("../controllers/index");

router.get("/getHomepage/:page", homepageController.getHomepagePagination);
router.post("/sortParcel/:page", homepageController.sortParcel);
router.get("/parcelDetail/:idparcel", homepageController.getParcelDetail);
router.post("/filterParcel/:page", homepageController.filterParcel);

module.exports = router;
