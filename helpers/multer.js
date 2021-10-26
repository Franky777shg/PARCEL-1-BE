const multer = require("multer")
const path = require("path")

module.exports={
    upload : (req,res)=>{
        // console.log(req)
        let storage = multer.diskStorage({
            destination: (req,file, cb)=>{
                cb(null,path.join(path.resolve("public"),`uploads/${req.params.type}`) )
            },
            filename: (req, file, cb)=>{
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            }
        })
        return multer({storage}).single("new")
    },

}