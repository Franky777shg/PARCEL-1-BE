const {db} = require("../database")

module.exports ={

    //getHomepagePagination
    getHomepagePagination : (req,res)=>{
        const currentParcelPage = parseInt(req.params.page) || 1

        const parcelPerPage = 5

        let totalParcels

        let countParcel = `select count(*) as totalItems from parcel`
        db.query(countParcel, (errCountParcel, resCountParcel)=>{
            if(errCountParcel){
                res.status(400).send(errCountParcel)
            }
            totalParcels = resCountParcel[0].totalItems
            console.log(totalParcels)
            

            let getParcel = `select * from parcel limit ${db.escape(parcelPerPage)} offset ${db.escape((currentParcelPage-1)*parcelPerPage)}`

            db.query(getParcel, (errGetParcel, resGetParcel)=>{
                if(errGetParcel){
                    res.status(400).send(errGetParcel)
                }
                
                let result = {
                    parcel: resGetParcel,
                    currentPage: currentParcelPage,
                    parcelPerPage: parcelPerPage,        
                    totalParcels: totalParcels
                }
                res.status(200).send(result)
            })
        })
    },
    

    //getParcelbyProductCategory


    //sortParcelbyName
    
    //sortParcelbyPrice
    

}