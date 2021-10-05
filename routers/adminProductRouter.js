const router = require('express').Router()

const {adminProductController} = require('../controllers/index')

router.get('/getProductAdmin', adminProductController.getProduct)
router.get('/getParcelAdmin', adminProductController.getParcel)
router.get('/getProductId/:id', adminProductController.getProductId)
router.get('/productCategories', adminProductController.getProductCategories)
router.post('/editProduct/:id', adminProductController.editProduct)

module.exports= router