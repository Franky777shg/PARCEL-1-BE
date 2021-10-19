const { db } = require("../database")

module.exports = {
  getRevenue: (req, res) => {
    const { startDate, endDate } = req.body
    let getAllRevenue = ""
    let getCapital = ""
    let getParcelRevenue = ""
    let getEachParcelRevenue = ""
    if (startDate && endDate) {
      getAllRevenue = `
      SELECT SUM(order_price) as totalGrossRevenues
      FROM \`order\` o
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)};`

      getCapital = `
        SELECT 
        SUM(totalProductCapital) as totalProductCapital
        FROM
          \`order\` o
              LEFT JOIN
          (SELECT 
            idorder,
            SUM(product_qty * product_capital) AS totalProductCapital
          FROM
              order_detail
          GROUP BY idorder , idparcel , parcel_no) od ON o.idorder = od.idorder
          WHERE
          idorder_status = 4 AND order_date > ${db.escape(startDate)} AND order_date < ${db.escape(
        endDate
      )};`

      getParcelRevenue = `
      SELECT idparcel, parcel_name,COUNT(idparcel) as totalParcelOrdered, SUM(parcelPrice) as totalParcelPrice, SUM(totalProductCapital) as totalParcelCapital, SUM(parcelPrice - totalProductCapital) as parcelRevenue
      FROM \`order\` o
      LEFT JOIN (SELECT idorder, idparcel, parcel_name, SUM(DISTINCT parcel_price * parcel_qty) as parcelPrice, SUM(product_capital * product_qty) as totalProductCapital
      FROM order_detail od
      GROUP BY od.idorder, idparcel, parcel_no) od ON o.idorder=od.idorder
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)}
        GROUP BY idparcel
        ORDER BY idparcel;
      `

      getEachParcelRevenue = `
      SELECT idparcel, DATE_FORMAT(order_date, \'%Y-%m-%d\') as order_date, order_number, SUM(DISTINCT parcel_qty * parcel_price) as parcelPrice, SUM(product_qty * product_capital) as totalProductCapital, (parcel_qty * parcel_price) - SUM(product_qty * product_capital) as parcelRevenue FROM \`order\` o
      LEFT JOIN order_detail od on o.idorder=od.idorder
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)}
      GROUP BY o.idorder, idparcel, parcel_no
      ORDER BY parcel_name ASC, order_date ASC;
      `
    } else {
      getAllRevenue = `
      SELECT SUM(order_price) as totalGrossRevenues
      FROM \`order\`
      WHERE idorder_status = 4;
      `

      getCapital = `
      SELECT 
      SUM(totalProductCapital) as totalProductCapital
      FROM
          \`order\` o
              LEFT JOIN
          (SELECT 
              idorder,
                  SUM(product_qty * product_capital) AS totalProductCapital
          FROM
              order_detail
          GROUP BY idorder , idparcel , parcel_no) od ON o.idorder = od.idorder
      WHERE
          idorder_status = 4;`

      getParcelRevenue = `
      SELECT idparcel, parcel_name,COUNT(idparcel) as totalParcelOrdered, SUM(parcelPrice) as totalParcelPrice, SUM(totalProductCapital) as totalParcelCapital, SUM(parcelPrice - totalProductCapital) as parcelRevenue
      FROM \`order\` o
      LEFT JOIN (SELECT idorder, idparcel, parcel_name, SUM(DISTINCT parcel_price * parcel_qty) as parcelPrice, SUM(product_capital * product_qty) as totalProductCapital
      FROM order_detail od
      GROUP BY od.idorder, idparcel, parcel_no) od ON o.idorder=od.idorder
      WHERE idorder_status = 4
      GROUP BY idparcel
      ORDER BY idparcel;
      `

      getEachParcelRevenue = `
      SELECT idparcel, DATE_FORMAT(order_date, \'%Y-%m-%d\') as order_date, order_number, SUM(DISTINCT parcel_qty * parcel_price) as parcelPrice, SUM(product_qty * product_capital) as totalProductCapital, (parcel_qty * parcel_price) - SUM(product_qty * product_capital) as parcelRevenue FROM \`order\` o
      LEFT JOIN order_detail od on o.idorder=od.idorder
      WHERE idorder_status=4
      GROUP BY o.idorder, idparcel, parcel_no
      ORDER BY parcel_name ASC, order_date ASC;
      `
    }

    db.query(getAllRevenue, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const { totalGrossRevenues } = result[0]
      if (totalGrossRevenues === null) return res.status(400).send("Data Penghasilan Kosong!")

      db.query(getCapital, (errGetCapital, resGetCapital) => {
        if (errGetCapital) return res.status(500).send("Terjadi kesalahan pada server!")

        if (resGetCapital.length === 0) return res.status(200).send("Data Penghasilan Kosong!")

        const { totalProductCapital } = resGetCapital[0]
        const totalNetRevenues = totalGrossRevenues - totalProductCapital

        db.query(getParcelRevenue, (errGetParcelRevenue, resGetParcelRevenue) => {
          if (errGetParcelRevenue) return res.status(500).send("Terjadi kesalahan pada server!")

          if (resGetParcelRevenue.length === 0)
            return res.status(200).send("Data Penghasilan Kosong!")

          const parcelRevenueData = resGetParcelRevenue

          db.query(getEachParcelRevenue, (errGetEachParcelRevenue, resGetEachParcelRevenue) => {
            if (errGetEachParcelRevenue)
              return res.status(500).send("Terjadi kesalahan pada server!")

            if (resGetEachParcelRevenue.length === 0)
              return res.status(200).send("Data Penghasilan Kosong!")

            const eachParcelRevenueData = resGetEachParcelRevenue

            parcelRevenueData.map((parcel) => {
              parcel.parcelDetail = []
              eachParcelRevenueData.map((parcelDetail) => {
                if (parcel.idparcel === parcelDetail.idparcel) {
                  parcel.parcelDetail.push(parcelDetail)
                }
              })
            })

            return res.status(200).send({
              totalGrossRevenues,
              totalProductCapital,
              totalNetRevenues,
              parcelRevenueData,
            })
          })
        })
      })
    })
  },
}
