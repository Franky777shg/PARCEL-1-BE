const {db} = require('../database')

module.exports={

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

    //upload product
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

    //add product
    addProduct :(req,res)=>{
        const {idproduct_category, name, desc, capital, price, stock} = req.body
        // console.log(req.file)
        console.log(req.body)


        // if(!req.file){
        //     res.status(400).send('NO FILE')
        // }

        if(!idproduct_category || !name || !desc || !capital ||!price || !stock){
            res.status(400).send("data belum lengkap")
        }

        let inputProduct = `insert into product(idproduct_category,product_image, product_name, product_desc, product_capital, product_price, product_stock) values(${db.escape(idproduct_category)},"gambar", ${db.escape(name)}, ${db.escape(desc)}, ${db.escape(capital)}, ${db.escape(price)}, ${db.escape(stock)});`

        db.query(inputProduct,(errInput, resInput)=>{
            if(errInput){
                console.log(errInput)
                res.status(400).send(errInput)
            }
            let getIdProduct = `select idproduct from product where product_name=${db.escape(name)}`
            db.query(getIdProduct, (errGetId, resGetId)=>{
                if(errGetId){
                    console.log(errGetId)
                    res.status(400).send(errGetId)
                }
                res.status(200).send(resGetId[0])
            })
        })

    },

    //get product with pagination
    getProductPagination : (req,res)=>{
        const currentPage =parseInt(req.params.page) || 1

        const perPage = parseInt(req.params.perPage) ||9

        let totalProducts

        let countProducts = 'select count(*) as totalItems from product'
        db.query(countProducts, (errCount, resCount)=>{
            if(errCount){
                res.status(400).send(errCount)
            }
            totalProducts =resCount[0]
            let getData = `select * from product limit ${db.escape((currentPage-1)*perPage)}, ${db.escape(perPage)} `
    
            db.query(getData, (errGetData, resGetData)=>{
                if(errGetData){
                    res.status(400).send(errGetData)
                }
                let result =[]
                result.push(resGetData,{current :currentPage}, {perpage :perPage}, totalProducts)
                res.status(200).send(result)
            })
        })
    },

    //get Parcel with pagination
    getParcelPagination : (req,res)=>{
        const currenParcelPage = parseInt(req.params.page) || 1
        
        const parcelPerPage = parseInt(req.params.perPage) || 6

        let totalParcels

        let countParcel = `select count(*) as totalItems from parcel`
        db.query(countParcel, (errCountParcel, resCountParcel)=>{
            if(errCountParcel){
                res.status(400).send(errCountParcel)
            }
            totalParcels = resCountParcel[0]

            let getParcel = `select * from parcel limit ${db.escape((currenParcelPage-1)*parcelPerPage)}, ${db.escape(parcelPerPage)}`

            db.query(getParcel, (errGetParcel, resGetParcel)=>{
                if(errGetParcel){
                    res.status(400).send(errGetParcel)
                }
                let result =[]
                result.push(resGetParcel, {current : currenParcelPage}, {perpage : parcelPerPage}, totalParcels)

                res.status(200).send(result)
            })
        })
    },

    //delete Product
    deleteProduct :(req,res)=>{
        const productName = req.params.name
        let deleteProduct= `delete from product where idproduct = ${db.escape(req.params.id)}`

        db.query(deleteProduct, (errDeleteProduct, resDeleteProduct)=>{
            if(errDeleteProduct){
                console.log(errDeleteProduct)
                res.status(400).send(errDeleteProduct)
            }

            const currentPage =parseInt(req.params.page) || 1

            const perPage = parseInt(req.params.perPage) ||9

            let totalProducts

            let countProducts = 'select count(*) as totalItems from product'
            db.query(countProducts, (errCount, resCount)=>{
            if(errCount){
                res.status(400).send(errCount)
            }
            totalProducts =resCount[0]
            let getData = `select * from product limit ${db.escape((currentPage-1)*perPage)}, ${db.escape(perPage)} `
    
            db.query(getData, (errGetData, resGetData)=>{
                if(errGetData){
                    res.status(400).send(errGetData)
                }
                let result =[]
                result.push(resGetData,{current :currentPage}, {perpage :perPage}, totalProducts, {caption :`${productName} berhasil dihapus`})
                res.status(200).send(result)
            })
        })
        })
    },

    // addParcel : (req,res)=>{
    //     const {nama, price,desc} = req.body

    //     let addParcel = `insert into parcel (parcel_name, parcel_price, parcel_desc) values (${db.escape(nama)}, ${db.escape(price)}, ${db.escape(desc)})`

    //     db.query(addParcel, (errA, resA)=>{
    //         if(errA){
    //             console.log(errA)
    //             res.status(400).send(errA)
    //         }

    //         let getIdParcel = `select idparcel from parcel where parcel_name = ${db.escape(nama)}`

    //         db.query(getIdParcel, (errB, resB)=>{
    //             if(errB){
    //                 console.log(errB)
    //                 res.status(400).send(errB)
    //             }
    //             let idparcel = resB[0]
    //             res.status(200).send(idparcel)

    //         })
    //     })
    // }


    //add parcel
    addParcel:(req,res)=>{
        const { nama, price, desc} = req.body

        let addParcel = `insert into parcel (parcel_name, parcel_price, parcel_desc, parcel_image) values (${db.escape(nama)}, ${db.escape(price)}, ${db.escape(desc)}, '00000.jpg'); `

        db.query(addParcel, (errAddParcel, resAddParcel)=>{
            if(errAddParcel){
                console.log(errAddParcel)
                res.status(400).send(errAddParcel)
            }
                
            let newParcel = `select idparcel from parcel where parcel_name=${db.escape(nama)}`
            db.query(newParcel, (errParc, resParc)=>{
                if(errParc){
                res.status(400).send(errParc)
                }
                    res.status(200).send(resParc)
                })
             
        })
    },

    //insert new Parcel_detail
    newDetail:(req,res)=>{
        const {parcelDetail}= req.body

        let itemInput = parcelDetail.map(item => [item.idparcel, item.idproduct_category, item.qty_parcel_category])

        let ins = `insert into parcel_detail (idparcel, idproduct_category, qty_parcel_category) values ?`
        db.query(ins, [itemInput], (errS, resS)=>{
            if(errS){
                console.log(errS)
                res.status(400).send(errS)
            }
            
            let nPc = 'select * from parcel'
            db.query(nPc, (errN, resN)=>{
                if(errN){
                    console.log(errN)
                    res.status(400).send(errN)
                }
                res.status(200).send(resN)
            })
        })


    },

    //mainCategories
    mainCategories:(req,res)=>{
        let main =`select * from product_category order by idproduct_category limit 1,6;`
        db.query(main, (errMain, resMain)=>{
            if(errMain){
                console.log(errMain)
                res.status(400).send(errMain)
            }
            res.status(200).send(resMain)
        })
    },

    //subcategories by main Id
    subCategories : (req,res)=>{
        let subCategory = `select e.idproduct_category, e.category_name, p.idproduct_category, p.parentID , p.category_name from product_category e
        inner join product_category p
        on e.idproduct_category=p.parentID
        where p.parentID=${req.params.id};`

        db.query(subCategory, (errSub, resSub)=>{
            if(errSub){
                console.log(errSub)
                res.status(400).send(errSub)
            }
            res.status(200).send(resSub)
        })
    },


    uploadParcel :(req,res)=>{
        console.log(req.file)

        if(!req.file){
            res.status(400).send('NO FILE')
        }
        
        let updatePhotoParcel = `update parcel set parcel_image = '${req.file.filename}' where idparcel=${req.params.id};
        `
        db.query(updatePhotoParcel, (errParc, resParc)=>{
            if(errParc){
                console.log(errParc)
                res.status(400).send(errParc)
            }
            select = [true, "Parcel Berhasil ditambahkan"]
            res.status(200).send(select)
        })
    }



    

}