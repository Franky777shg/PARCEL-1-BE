const router = require('express').Router()

const {adminProductController} = require('../controllers/index')

router.get('/getProductAdmin', adminProductController.getProduct)
router.get('/getParcelAdmin', adminProductController.getParcel)

module.exports= router