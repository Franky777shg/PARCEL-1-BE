const router = require('express').Router()

const {homepageController} = require("../controllers/index")

router.get("/getHomepage/:page", homepageController.getHomepagePagination)

module.exports= router