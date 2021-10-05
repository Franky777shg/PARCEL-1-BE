const {db} = require('../database')

module.exports={

    //getAllProduct by Admin
    getProduct : (req,res)=>{
        let getProduct = 'select * from product'
        db.query(getProduct, (errGetProduct, resGetProduct)=>{
            if(errGetProduct){
                console.log(errGetProduct)
                res.status(400).send(errGetProduct)
            }
            res.status(200).send(resGetProduct)
        })
    },

    //get product by id 
    getProductId : (req,res)=>{
        let getProductId = `select * from product p
        left join product_category c
        on p.idproduct_category=c.idproduct_category
        where idproduct=${req.params.id};`
        db.query(getProductId, (errGetProductId, resGetProductId)=>{
            if(errGetProductId){
                console.log(errGetProductId)
                res.status(400).send(errGetProductId)
            }
            res.status(200).send(resGetProductId)
        })
    },

    //get all Product Categories
    getProductCategories: (req,res)=>{
        let getProdCate = `select * from product_category order by idproduct_category limit 7,36;`
        db.query(getProdCate, (errProdCate, resProdCate)=>{
            if(errProdCate){
                console.log(errProdCate)
                res.status(400).send(errProdCate)
            }
            res.status(200).send(resProdCate)
        })

    },

    //edit product
    editProduct : (req,res)=>{
        let editProduct = `update product set ? where idproduct=${req.params.id};`
        db.query(editProduct,req.body, (errEditProduct, resEditProduct)=>{
            if(errEditProduct){
                console.log(errEditProduct)
                res.status(400).send(errEditProduct)
            }
            
            let updateProduct = `select * from product p
            left join product_category c
            on p.idproduct_category=c.idproduct_category
            where idproduct=${req.params.id};`
            db.query(updateProduct, (errUpdateEditProduct, resUpdateEditProduct)=>{
                if(errUpdateEditProduct){
                    console.log(errUpdateEditProduct)
                    res.status(400).send(errUpdateEditProduct)
                }
                res.status(200).send(resUpdateEditProduct)
            })
        })

    },

    uploadEditProduct : (req,res)=>{
        console.log(req.file)

        if(!req.file){
            res.status(400).send('NO FILE')
        }
        
        let updatePhoto = `update product set product_image = '${req.file.filename}' where idproduct=${req.params.id};`
        db.query(updatePhoto, (errUpdatePhoto, resUpdatePhoto)=>{
            if(errUpdatePhoto){
                console.log(errUpdatePhoto)
                res.status(400).send(errUpdatePhoto)

            }

            let reUpdateProduct = `select * from product p
            left join product_category c
            on p.idproduct_category=c.idproduct_category
            where idproduct=${req.params.id};`
            db.query(reUpdateProduct, (errReUpdate, resReUpdate)=>{
                if(errReUpdate){
                    console.log(errReUpdate)
                    res.status(400).send(errReUpdate)
                }
                let resultUpload = resReUpdate
                resultUpload.push({success: true})
                res.status(200).send(resultUpload)
            })
            

        })

    },

    //getAllParcel by Admin
    getParcel : (req, res)=>{
        let getParcel = `select * from parcel`
        db.query(getParcel, (errGetParcel, resGetParcel)=>{
            if(errGetParcel){
                console.log(errGetParcel)
                res.status(400).send(errGetParcel)
            }
            res.status(200).send(resGetParcel)
        })
    },
    

}