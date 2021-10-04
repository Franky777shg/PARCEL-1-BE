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
    } 
}