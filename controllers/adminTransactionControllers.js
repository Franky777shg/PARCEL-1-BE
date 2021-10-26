const { db } = require("../database");

module.exports = {
  // Get All Transactions
  getAllTransactions: (req, res) => {
    const getAllTransactions = `SELECT o.idorder, o.order_number, o.order_date, o.order_price, o.idorder_status, s.order_status FROM final_project.order o
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
    const getTransactionStatus = `SELECT o.idorder, o.order_number, o.order_date, o.order_price, o.idorder_status, s.order_status FROM final_project.order o
    LEFT JOIN final_project.order_status s
    ON o.idorder_status = s.idorder_status
    WHERE s.idorder_status = ${idOrderStatus}
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
    const { idOrder } = req.params;
    const getOrderBio = ` SELECT 
    DATE_FORMAT(order_date,\'%Y-%m-%d\') AS date_order, o.*, u.name, s.order_status FROM final_project.order o
        LEFT JOIN final_project.profile u
        ON o.idusers = u.idusers
        LEFT JOIN final_project.order_status s
        ON o.idorder_status = s.idorder_status
        WHERE o.idorder =  ${idOrder};`;

    db.query(getOrderBio, (errGetOrderBio, resGetOrderBio) => {
      if (errGetOrderBio)
        return res.status(500).send("Terjadi kesalahan pada server");
      if (resGetOrderBio.length === 0)
        return res.status(400).send("Data transaksi tidak ditemukan!");

      const getOrderItems = `SELECT DISTINCT
        idorder_detail,
    parcel_name,
    parcel_image,
    parcel_price,
        parcel_qty,
        GROUP_CONCAT(product_name SEPARATOR ';') as productNameList,
        GROUP_CONCAT(category_name) as productCategory,
        GROUP_CONCAT(product_qty) as productQtyList
    FROM
        order_detail ode
    LEFT JOIN product_category pc ON ode.idproduct_category=pc.idproduct_category
    WHERE
        idorder = ${idOrder}
    GROUP BY idorder , idparcel , parcel_no;`;
      db.query(getOrderItems, (errGetOrderItems, resGetOrderItems) => {
        if (errGetOrderItems)
          return res.status(500).send("Terjadi kesalahan pada server");
        if (resGetOrderItems.length === 0)
          return res.status(400).send("Data transaksi tidak ditemukan!");
        const orderDetailItems = resGetOrderItems.map((orderDetail) => {
          const productDetail = [];
          const { productNameList, productCategory, productQtyList } =
            orderDetail;
          orderDetail.productNameList = productNameList
            .split(";")
            .map((product) => productDetail.push({ name: product }));
          orderDetail.productCategory = productCategory
            .split(",")
            .map((category, idx) => (productDetail[idx].category = category));
          orderDetail.productQtyList = productQtyList
            .split(",")
            .map((qty, idx) => (productDetail[idx].qty = parseInt(qty)));
          delete orderDetail.productNameList;
          delete orderDetail.productCategory;
          delete orderDetail.productQtyList;
          orderDetail.productDetail = productDetail;
          return orderDetail;
        });
        return res
          .status(200)
          .send({ orderBio: resGetOrderBio[0], orderDetailItems });
      });
    });
  },
  confirmPayment: (req, res) => {
    const { idOrder, idOrderStatus } = req.body;
    const confirmPayment = `UPDATE final_project.order SET idorder_status = ${idOrderStatus} WHERE idorder = ${idOrder};`;
    db.query(confirmPayment, (errConfirmPayment, resConfirmPayment) => {
      if (errConfirmPayment) {
        res.status.send(errConfirmPayment);
      }
      res.status(200).send(resConfirmPayment);
    });
  },
};
