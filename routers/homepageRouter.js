const router = require('express').Router()

const {homepageController} = require("../controllers/index")

router.get("/getHomepage/:page", homepageController.getHomepagePagination)
router.get("/sortParcel/:sort/:method",homepageController.sortParcel)
router.get("/parcelDetail/:idparcel", homepageController.getParcelDetail)

module.exports= router