const router = require('express').Router()

const {adminProductController} = require('../controllers/index')

const {upload}= require('../helpers/multer')
const uploader = upload()

router.get('/getProductId/:id', adminProductController.getProductId)
router.get('/productCategories', adminProductController.getProductCategories)
router.post('/editProduct/:id',  adminProductController.editProduct)
router.post('/editUploadProduct/:id/:type', uploader, adminProductController.uploadEditProduct)
router.post('/addProductAdmin', adminProductController.addProduct )
router.get(`/getProductPerPage/:page`, adminProductController.getProductPagination)
router.get('/getParcelPerPage/:page', adminProductController.getParcelPagination)
router.get('/deleteProduct/:id/:page/:name', adminProductController.deleteProduct)
router.post('/addParcel', adminProductController.addParcel)
router.post('/addParcelItens', adminProductController.newDetail)
router.get('/mainCategories', adminProductController.mainCategories)
router.get('/subCategories/:id', adminProductController.subCategories)
router.post('/uploadParcel/:id/:type', uploader, adminProductController.uploadParcel)

module.exports= router