const multer = require("multer")
const path = require("path")

module.exports={
    uploadEditProduct : ()=>{
        let storage = multer.diskStorage({
            destination: path.join(path.resolve("public"),`uploads/products`),
            filename: (req, file, cb)=>{
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            }
        })
        return multer({storage}).single("new")
    },

}