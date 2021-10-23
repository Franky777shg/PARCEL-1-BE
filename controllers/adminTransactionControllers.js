const { db } = require("../database");

module.exports = {
  // Get All Transactions
  getAllTransactions: (req, res) => {
    const getAllTransactions = `SELECT o.idorder, o.order_number, o.order_date, o.order_price, o.idorder_status, s.order_status from final_project.order o
      LEFT JOIN final_project.order_status s
      ON o.idorder_status = s.idorder_status
      WHERE s.idorder_status > 1
      ORDER BY idorder DESC;`;
    db.query(
      getAllTransactions,
      (errGetAllTransactions, resGetAllTransactions) => {
        if (errGetAllTransactions)
          return res.status(500).send("Terjadi kesalahan pada server!");
        if (resGetAllTransactions.length === 0)
          return res.status(400).send("Daftar transaksi masih kosong!");
        res.status(200).send(resGetAllTransactions);
      }
    );
  },
  // Get Transactions by Its Status
  getTransactionsByStatus: (req, res) => {
    const { idOrderStatus } = req.params;
    const getTransactionStatus = `SELECT o.idorder, o.order_number, o.order_date, o.order_price, o.idorder_status, s.order_status from final_project.order o
    LEFT JOIN final_project.order_status s
    ON o.idorder_status = s.idorder_status
    WHERE s.idorder_status = ${db.escape(idOrderStatus)}
    ORDER BY idorder DESC;`;
    db.query(
      getTransactionStatus,
      (errGetTransactionStatus, resGetTransactionStatus) => {
        if (errGetTransactionStatus)
          return res.status(500).send("Terjadi kesalahan pada server!");
        if (resGetTransactionStatus.length === 0)
          return res.status(400).send("Daftar transaksi masih kosong!");
        res.status(200).send(resGetTransactionStatus);
      }
    );
  },
  // Get Transaction Detail
  getTransactionDetail: (req, res) => {
    const { idorder } = req.params;

    const getOrderBio = `SELECT o.*, u.name, s.order_status FROM final_project.order o
    LEFT JOIN final_project.profile u
    ON o.idusers = u.idusers
    LEFT JOIN final_project.order_status s
    ON o.idorder_status = s.idorder_status
    WHERE o.idorder = ${idorder};`;

    db.query(getOrderBio, (errGetOrderBio, resGetOrderBio) => {
      if (errGetOrderBio)
        return res.status(500).send("Terjadi kesalahan pada server");
      if (resGetOrderBio.length === 0)
        return res.status(400).send("Data transaksi tidak ditemukan!");

      const getOrderItems = `SELECT DISTINCT
        idorder_detail,
    parcel_name,
    parcel_price,
        parcel_qty,
        GROUP_CONCAT(product_name SEPARATOR ';') as productNameList,
        GROUP_CONCAT(category_name) as productCategory,
        GROUP_CONCAT(product_qty) as productQtyList
    FROM
        order_detail ode
    LEFT JOIN product_category pc ON ode.idproduct_category=pc.idproduct_category
    WHERE
        idorder = ${idorder}
    GROUP BY idorder , idparcel , parcel_no;`;
      db.query(getOrderItems, (errGetOrderItems, resGetOrderItems) => {
        if (errGetOrderItems)
          return res.status(500).send("Terjadi kesalahan pada server");
        if (resGetOrderItems.length === 0)
          return res.status(400).send("Data transaksi tidak ditemukan!");
        return res.status(200).send({ resGetOrderBio, resGetOrderItems });
      });
    });
  },
};
