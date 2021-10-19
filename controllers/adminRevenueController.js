const { db } = require("../database")

module.exports = {
  getAllRevenue: (req, res) => {
    const getAllRevenue = `
    SELECT SUM(order_price) as totalGrossRevenues
    FROM \`order\`
    WHERE idorder_status = 4;
    `

    db.query(getAllRevenue, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const { totalGrossRevenues } = result[0]
      if (totalGrossRevenues === null) return res.status(400).send("Data Penghasilan Kosong!")

      const getCapital = `
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
          idorder_status = 4;
      `

      db.query(getCapital, (errGetCapital, resGetCapital) => {
        if (errGetCapital) return res.status(500).send("Terjadi kesalahan pada server!")

        if (resGetCapital.length === 0) return res.status(200).send("Data Penghasilan Kosong!")

        const { totalProductCapital } = resGetCapital[0]
        const totalNetRevenues = totalGrossRevenues - totalProductCapital

        return res.status(200).send({ totalGrossRevenues, totalProductCapital, totalNetRevenues })
      })
    })
  },
  getRevenueByDateRange: (req, res) => {
    const { startDate, endDate } = req.body

    const getRevenueByDateRange = `
    SELECT SUM(order_price) as totalGrossRevenues
    FROM \`order\` o
    WHERE idorder_status = 4 AND order_date > ${db.escape(startDate)} AND order_date < ${db.escape(
      endDate
    )};
    `

    db.query(getRevenueByDateRange, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const { totalGrossRevenues } = result[0]
      if (totalGrossRevenues === null) return res.status(400).send("Data Penghasilan Kosong!")

      const getCapital = `
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
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)};
      `

      db.query(getCapital, (errGetCapital, resGetCapital) => {
        if (errGetCapital) return res.status(500).send("Terjadi kesalahan pada server!")

        if (resGetCapital.length === 0) return res.status(200).send("Data Penghasilan Kosong!")

        const { totalProductCapital } = resGetCapital[0]
        const totalNetRevenues = totalGrossRevenues - totalProductCapital

        return res.status(200).send({ totalGrossRevenues, totalProductCapital, totalNetRevenues })
      })
    })
  },
  getRevenueByMonth: (req, res) => {
    const { startDate, endDate } = req.body

    const getRevenueByMonth = `
    SELECT SUM(order_price) as totalGrossRevenues
    FROM \`order\`
    WHERE idorder_status = 4 AND order_date > ${db.escape(startDate)} AND order_date < ${db.escape(
      endDate
    )};
    `

    db.query(getRevenueByMonth, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const { totalGrossRevenues } = result[0]
      if (totalGrossRevenues === null) return res.status(400).send("Data Penghasilan Kosong!")

      const getCapital = `
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
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)};
      `

      db.query(getCapital, (errGetCapital, resGetCapital) => {
        if (errGetCapital) return res.status(500).send("Terjadi kesalahan pada server!")

        if (resGetCapital.length === 0) return res.status(200).send("Data Penghasilan Kosong!")

        const { totalProductCapital } = resGetCapital[0]
        const totalNetRevenues = totalGrossRevenues - totalProductCapital

        return res.status(200).send({ totalGrossRevenues, totalProductCapital, totalNetRevenues })
      })
    })
  },
  getRevenueByDate: (req, res) => {
    const { startDate, endDate } = req.body

    const getRevenueByDate = `
    SELECT SUM(order_price) as totalGrossRevenues
    FROM \`order\`
    WHERE idorder_status = 4 AND order_date > ${db.escape(startDate)} AND order_date < ${db.escape(
      endDate
    )};
    `

    db.query(getRevenueByDate, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      const { totalGrossRevenues } = result[0]
      if (totalGrossRevenues === null) return res.status(400).send("Data Penghasilan Kosong!")

      const getCapital = `
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
      WHERE idorder_status = 4 AND order_date > ${db.escape(
        startDate
      )} AND order_date < ${db.escape(endDate)};
      `

      db.query(getCapital, (errGetCapital, resGetCapital) => {
        if (errGetCapital) return res.status(500).send("Terjadi kesalahan pada server!")

        if (resGetCapital.length === 0) return res.status(200).send("Data Penghasilan Kosong!")

        const { totalProductCapital } = resGetCapital[0]
        const totalNetRevenues = totalGrossRevenues - totalProductCapital

        return res.status(200).send({ totalGrossRevenues, totalProductCapital, totalNetRevenues })
      })
    })
  },
}
