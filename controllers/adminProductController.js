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
        console.log(parcelDetail)

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


    // upload Parcel
    uploadParcel :(req,res)=>{
        // console.log(req.file)

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
    },

    //delete Parcel
    deleteParcel : (req,res)=>{
        const productName = req.params.name
        let deleteParcel = `delete from parcel where idparcel= ${req.params.id}`

        db.query(deleteParcel, (errDelParcel, resDelParcel)=>{
            if(errDelParcel){
                console.log(errDelParcel)
                res.status(400).send(errDelParcel)
            }
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
                result.push(resGetParcel, {current : currenParcelPage}, {perpage : parcelPerPage}, totalParcels,{caption :`${productName} berhasil dihapus`})

                res.status(200).send(result)
            })
        })
        })
    },

    //get Parcel by id
    getParcelId : (req, res)=>{
        const parcel = `select * from parcel where idparcel=${req.params.id}`

        db.query(parcel, (errPc, resPc)=>{
            if(errPc){
                console.log(errPc)
                res.status(400).send(errPc)
            }
            // result = resPc[0]
            // console.log(result)
            // res.status(200).send(result)

            const parcelDetail = `select d.idparcel_detail, e.category_name as parent_category_name, e.idproduct_category, d.idproduct_category, d.qty_parcel_category, d.idparcel, p.category_name from product_category e
            left join product_category p
            on e.idproduct_category=p.parentID
            left join parcel_detail d
            on p.idproduct_category=d.idproduct_category
            where d.idparcel=${req.params.id};`

            db.query(parcelDetail, (errPD, resPD)=>{
                if(errPD){
                    console.log(errPD)
                    res.status(400).send(errPD)
                }
                let parcelDet = []

                parcelDet.push(resPD, resPc[0])
                res.status(200).send(parcelDet)

            })
        })
    },

    

    //edit parcel
    editParcel : (req,res)=>{
        const {newDetail, idparcel, name} =req.body

        const deleteDetailParcel = `delete from parcel_detail where idparcel =${idparcel}`

        db.query(deleteDetailParcel, (errDDP, resDDP)=>{
            if(errDDP){
                console.log(errDDP)
                res.status(400).send(errDDP)
            }

            let itemInput = newDetail.map(item => [item.idparcel, item.idproduct_category, item.qty_parcel_category])

            let insertDetail = `insert into parcel_detail (idparcel, idproduct_category, qty_parcel_category) values ?`

            db.query(insertDetail, [itemInput], (errInsertDetail, resInsertDetail)=>{
                if(errInsertDetail){
                    console.log(errInsertDetail)
                    res.status(400).send(errInsertDetail)
                }
                const parcel = `select * from parcel where idparcel=${db.escape(idparcel)}`

        db.query(parcel, (errPc, resPc)=>{
            if(errPc){
                console.log(errPc)
                res.status(400).send(errPc)
            }
            // result = resPc[0]
            // console.log(result)
            // res.status(200).send(result)

            const parcelDetail = `select d.idparcel_detail, e.category_name as parent_category_name, e.idproduct_category, d.idproduct_category, d.qty_parcel_category, d.idparcel, p.category_name from product_category e
            left join product_category p
            on e.idproduct_category=p.parentID
            left join parcel_detail d
            on p.idproduct_category=d.idproduct_category
            where d.idparcel=${idparcel};`

            db.query(parcelDetail, (errPD, resPD)=>{
                if(errPD){
                    console.log(errPD)
                    res.status(400).send(errPD)
                }
                let parcelDet = []

                parcelDet.push(resPD, resPc[0], {success : [true , `Data parsel ${name} berhasil diubah`]})
                res.status(200).send(parcelDet)

            })
        })

            })
        })


    },

    //edit Parcel Deskripsi
    editDeskripsiParcel :(req,res)=>{
        const {parcel_name,parcel_price,parcel_desc, idparcel}= req.body

        const updateParcelDesc = `update parcel set ? where idparcel=${req.body.idparcel}`

        let data =[{parcel_name,parcel_price,parcel_desc}]


       db.query(updateParcelDesc,data, (errUPD, resUPD)=>{
           if(errUPD){
               console.log(errUPD)
               res.status(400).send(errUPD)
           }

        const parcel = `select * from parcel where idparcel=${db.escape(idparcel)}`

        db.query(parcel, (errPc, resPc)=>{
            if(errPc){
                console.log(errPc)
                res.status(400).send(errPc)
            }

            const parcelDetail = `select d.idparcel_detail, e.category_name as parent_category_name, e.idproduct_category, d.idproduct_category, d.qty_parcel_category, d.idparcel, p.category_name from product_category e
            left join product_category p
            on e.idproduct_category=p.parentID
            left join parcel_detail d
            on p.idproduct_category=d.idproduct_category
            where d.idparcel=${idparcel};`

            db.query(parcelDetail, (errPD, resPD)=>{
                if(errPD){
                    console.log(errPD)
                    res.status(400).send(errPD)
                }
                let parcelDet = []

                parcelDet.push(resPD, resPc[0], {success : [true , `Data parsel ${parcel_name} berhasil diubah`]})
                res.status(200).send(parcelDet)

            })
        })

       } )


    },

    //upload edit parcel 
    uploadEditParcel :(req,res)=>{
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
            const parcel = `select * from parcel where idparcel=${req.params.id}`

        db.query(parcel, (errPc, resPc)=>{
            if(errPc){
                console.log(errPc)
                res.status(400).send(errPc)
            }

            const parcelDetail = `select d.idparcel_detail, e.category_name as parent_category_name, e.idproduct_category, d.idproduct_category, d.qty_parcel_category, d.idparcel, p.category_name from product_category e
            left join product_category p
            on e.idproduct_category=p.parentID
            left join parcel_detail d
            on p.idproduct_category=d.idproduct_category
            where d.idparcel=${req.params.id};`

            db.query(parcelDetail, (errPD, resPD)=>{
                if(errPD){
                    console.log(errPD)
                    res.status(400).send(errPD)
                }
                let parcelDet = []

                parcelDet.push(resPD, resPc[0], {success : [true , `Gambar parsel berhasil diubah`]})
                res.status(200).send(parcelDet)

            })
        })    
        })

        
    },

    //get product report
    productReport : (req, res)=>{
        let productRep = `select d.product_name, count(*) as total_Items, sum(d.product_price) as total_price, o.order_date from \`order\`o
        left join order_detail d 
        on o.idorder = d.idorder
        where o.order_date >= date_sub(curdate(), interval 30 day) and o.idorder_status=4
        group by d.product_name
         ;`

        db.query(productRep, (errPR, resPR)=>{
            if(errPR){
                console.log(errPR)
                res.status(400).send(errPR)
            }
            let result = []
            let resultPR = resPR
            let resultName = []
            let resultData =[]
            for(let i=0; i<resultPR.length;i++){
                resultName.push(resultPR[i].product_name)
                resultData.push(resultPR[i].total_Items)

            }
            let date ="Selama 30 hari"
            result.push(resultPR,resultName, resultData, date )
            res.status(200).send(result)
        })
    },

    productReportbyDate : (req,res)=>{
        const {date1, date2}=req.body

        if(!date1 && !date2){
            return res.status(400).send([true, "pastikan semua form telah terisi"])
        }

        if(date1 && date2){
            let productRep = `select d.product_name, count(*) as total_Items, sum(d.product_price) as total_price, o.order_date from \`order\`o
        left join order_detail d 
        on o.idorder = d.idorder
        where o.order_date between ${db.escape(date1)} and ${db.escape(date2)}  and o.idorder_status=4
        group by d.product_name
         ;`

        db.query(productRep, (errPR, resPR)=>{
            if(errPR){
                console.log(errPR)
                res.status(400).send(errPR)
            }
            let result = []
            let resultPR = resPR
            let resultName = []
            let resultData =[]
            for(let i=0; i<resultPR.length;i++){
                resultName.push(resultPR[i].product_name)
                resultData.push(resultPR[i].total_Items)

            }
            let fixDate1 = date1.split(/\D/g)
            let trueDate1 = [fixDate1[2], fixDate1[1], fixDate1[0]].join("-")
            let fixDate2 = date2.split(/\D/g)
            let trueDate2 = [fixDate2[2], fixDate2[1], fixDate2[0]].join("-")
            let date = `selama ${trueDate1}- ${trueDate2}`
            result.push(resultPR,resultName, resultData, date )
            res.status(200).send(result)
        })
        }
        else if(date1 && !date2){
            let prodRep1 = `select d.product_name, count(*) as total_Items, sum(d.product_price) as total_price, o.order_date from \`order\`o
            left join order_detail d 
            on o.idorder = d.idorder
            where o.order_date =${db.escape(date1)}  and o.idorder_status=4
            group by d.product_name
             ;`

            db.query(prodRep1, (errPR1, resPR1)=>{
                if(errPR1){
                    console.log(errPR1)
                    res.status(400).send(errPR1)
                }
                let result = []
                let resultPR = resPR1
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].product_name)
                    resultData.push(resultPR[i].total_Items)
    
                }
                let fixDate1 = date1.split(/\D/g)
                let trueDate1 = [fixDate1[2], fixDate1[1], fixDate1[0]].join("-")
                let date =`selama ${trueDate1}`
                result.push(resultPR,resultName, resultData, date )
                res.status(200).send(result)
            })
        }
        else if(!date1 && date2){
            let prodRep2 = `select d.product_name, count(*) as total_Items, sum(d.product_price) as total_price, o.order_date from \`order\`o
            left join order_detail d 
            on o.idorder = d.idorder
            where o.order_date =${db.escape(date2)}  and o.idorder_status=4
            group by d.product_name
             ;`

            db.query(prodRep2, (errPR2, resPR2)=>{
                if(errPR2){
                    console.log(errPR2)
                    res.status(400).send(errPR2)
                }
                let result = []
                let resultPR = resPR2
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].product_name)
                    resultData.push(resultPR[i].total_Items)
    
                }
                let fixDate2 = date2.split(/\D/g)
                let trueDate2 = [fixDate2[2], fixDate2[1], fixDate2[0]].join("-")
                let date = `selama ${trueDate2}`
                result.push(resultPR,resultName, resultData, date )
                res.status(200).send(result)
            })
        }
    },


    //get Parcel Report
    parcelReport : (req,res)=>{
        let parcelRep = `select d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
        left join \`order\`o
        on d.idorder=o.idorder
        where o.order_date >= date_sub(curdate(), interval 30 day) and o.idorder_status=4
        group by d.parcel_name;`

        db.query(parcelRep, (errPaR, resPaR)=>{
            if(errPaR){
                console.log(errPaR)
                res.status(400).send(errPaR)
            }
            let result = []
                let resultPR = resPaR
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].parcel_name)
                    resultData.push(resultPR[i].total_Payment)
    
                }
                let date = `selama 30 hari`
                result.push(resultPR,resultName, resultData, date )
            
            res.status(200).send(result)
        })
    },

    parcelReportByDate : (req,res)=>{
        const {dateParcel1, dateParcel2}=req.body

        if(!dateParcel1 && !dateParcel2){
            return res.status(400).send([true,"Pastikan semua form telah terisi"])
        }

        if(dateParcel1 && dateParcel2){
        let parcelRep12 = `select d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
        left join \`order\`o
        on d.idorder=o.idorder
        where o.order_date between ${db.escape(dateParcel1)} and ${db.escape(dateParcel2)} and o.idorder_status=4
        group by d.parcel_name;`

        db.query(parcelRep12, (errPaR12, resPaR12)=>{
            if(errPaR12){
                console.log(errPaR12)
                res.status(400).send(errPaR12)
            }
            let result = []
                let resultPR = resPaR12
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].parcel_name)
                    resultData.push(resultPR[i].total_Payment)
    
                }
                let fixDate1 = dateParcel1.split(/\D/g)
                let trueDate1 = [fixDate1[2], fixDate1[1], fixDate1[0]].join("-")
                let fixDate2 = dateParcel2.split(/\D/g)
                let trueDate2 = [fixDate2[2], fixDate2[1], fixDate2[0]].join("-")
                let date = `selama ${trueDate1} - ${trueDate2}`
                result.push(resultPR,resultName, resultData, date )
            res.status(200).send(result)
        })
        }
        else if (dateParcel1 && !dateParcel2){
        let parcelRepOnly1 = `select d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
        left join \`order\`o
        on d.idorder=o.idorder
        where o.order_date =${db.escape(dateParcel1)} and o.idorder_status=4
        group by d.parcel_name;`

        db.query(parcelRepOnly1, (errPaR1, resPaR1)=>{
            if(errPaR1){
                console.log(errPaR1)
                res.status(400).send(errPaR1)
            }
            let result = []
                let resultPR = resPaR1
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].parcel_name)
                    resultData.push(resultPR[i].total_Payment)
    
                }
                let fixDate1 = dateParcel1.split(/\D/g)
                let trueDate1 = [fixDate1[2], fixDate1[1], fixDate1[0]].join("-")
                let date = `selama ${trueDate1}`
                result.push(resultPR,resultName, resultData, date )
            res.status(200).send(result)
        })
        }
        else if (!dateParcel1 && dateParcel2){
        let parcelRepOnly2 = `select d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
        left join \`order\`o
        on d.idorder=o.idorder
        where o.order_date =${db.escape(dateParcel2)} and o.idorder_status=4
        group by d.parcel_name;`

        db.query(parcelRepOnly2, (errPaR2, resPaR2)=>{
            if(errPaR2){
                console.log(errPaR2)
                res.status(400).send(errPaR2)
            }
            let result = []
                let resultPR = resPaR2
                let resultName = []
                let resultData =[]
                for(let i=0; i<resultPR.length;i++){
                    resultName.push(resultPR[i].parcel_name)
                    resultData.push(resultPR[i].total_Payment)
    
                }
                let fixDate2 = dateParcel2.split(/\D/g)
                let trueDate2 = [fixDate2[2], fixDate2[1], fixDate2[0]].join("-")
                let date = `selama ${trueDate2}`
                result.push(resultPR,resultName, resultData, date )
            res.status(200).send(result)
        })
        }
    },

    //sort parcel by
    sortParcelReportByDate :(req,res)=>{
        const {dateParcel1, dateParcel2} = req.body

        if(!dateParcel1 && dateParcel2){
            return res.status(400).send([true, "masukkan tanggal secara spesifik"])
        }
        else if (dateParcel1 && !dateParcel2){
            return res.status(400).send([true, "masukkan tanggal secara spesifik "])
        }

        if(!dateParcel1 && !dateParcel2){
            let sortParcel = `select o.order_date, d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
            left join \`order\`o
            on d.idorder=o.idorder
            where o.order_date >= date_sub(curdate(), interval 30 day) and o.idorder_status=4
            group by o.order_date;`

            db.query(sortParcel, (errSP, resSP)=>{
                if(errSP){
                    console.log(errSP)
                    res.status(400).send(errSP)
                }
                let result = []
                let resultPR = resSP
                let resultName = []
                let resultData =[]
                let newDate = ""
                let newNewDate =""
                for(let i=0; i<resultPR.length;i++){
                    newDate = resultPR[i].order_date.toString()
                    newNewDate = newDate.slice(0,15)
                    // resultName.push(resultPR[i].order_date)
                    resultName.push(newNewDate)
                    resultData.push(resultPR[i].total_Payment)
                    newDate =""
                    newNewDate = ""
    
                }
                let date = `selama 30 hari`
                result.push(resultPR,resultName, resultData,date )
                res.status(200).send(result)
            })
        }
        else if(dateParcel1 && dateParcel2){
            let sortParcel1 = `select o.order_date, d.parcel_name, count(distinct d.idorder)as item_sold, sum(distinct d.parcel_price) as total_Payment from order_detail d
            left join \`order\`o
            on d.idorder=o.idorder
            where o.order_date between ${db.escape(dateParcel1)} and ${db.escape(dateParcel2)} and o.idorder_status=4
            group by o.order_date;`

            db.query(sortParcel1, (errSP1, resSP1)=>{
                if(errSP1){
                    console.log(errSP1)
                    res.status(400).send(errSP1)
                }
                let result = []
                let resultPR = resSP1
                let resultName = []
                let resultData =[]
                let newDate = ""
                let newNewDate =""
                for(let i=0; i<resultPR.length;i++){
                    newDate = resultPR[i].order_date.toString()
                    newNewDate = newDate.slice(0,15)
                    resultName.push(newNewDate)
                    resultData.push(resultPR[i].total_Payment)
                    newDate =""
                    newNewDate = ""
    
                }
                let fixDate1 = dateParcel1.split(/\D/g)
                let trueDate1 = [fixDate1[2], fixDate1[1], fixDate1[0]].join("-")
                let fixDate2 = dateParcel2.split(/\D/g)
                let trueDate2 = [fixDate2[2], fixDate2[1], fixDate2[0]].join("-")
                let date = `selama ${trueDate1} - ${trueDate2}`
                result.push(resultPR,resultName, resultData, date )
                res.status(200).send(result)
            })
        }
    }


    

}