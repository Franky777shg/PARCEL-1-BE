const router = require('express').Router()

const {adminProductController} = require('../controllers/index')

const {uploadEditProduct}= require('../helpers/multer')
const uploadEditProd = uploadEditProduct()

router.get('/getProductAdmin', adminProductController.getProduct)
router.get('/getParcelAdmin', adminProductController.getParcel)
router.get('/getProductId/:id', adminProductController.getProductId)
router.get('/productCategories', adminProductController.getProductCategories)
router.post('/editProduct/:id',  adminProductController.editProduct)
router.post('/editUploadProduct/:id', uploadEditProd, adminProductController.uploadEditProduct)

module.exports= router