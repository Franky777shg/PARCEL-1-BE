const { db } = require("../database")

module.exports = {
  getFillParcelData: (req, res) => {
    const { idParcel } = req.params
    const getFillParcelData = `
    SELECT p.idparcel, p.parcel_name, p.parcel_price, p.parcel_image, pd.*
    FROM parcel p
    LEFT JOIN (
      SELECT pd.idparcel, group_concat(pd.idproduct_category) as idCategory, group_concat(category_name) as categoryLabel, group_concat(qty_parcel_category) as maxQtyPerCategory
        FROM parcel_detail pd
        LEFT JOIN product_category pc
        ON pd.idproduct_category=pc.idproduct_category
        WHERE idparcel=${db.escape(idParcel)}
    ) pd
    ON p.idparcel=pd.idparcel
    WHERE p.idparcel=${db.escape(idParcel)};
    `

    db.query(getFillParcelData, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      if (result.length === 0) return res.status(404).send("Data Parsel tidak ditemukan")

      let categories = []
      result[0].idCategory.split(",").map((id, index) => categories.push({ id: parseInt(id) }))
      result[0].categoryLabel.split(",").map((label, index) => (categories[index].label = label))
      result[0].maxQtyPerCategory
        .split(",")
        .map((maxQty, index) => (categories[index].maxQty = parseInt(maxQty)))

      delete result[0].idCategory
      delete result[0].categoryLabel
      delete result[0].maxQtyPerCategory

      const fillParcelData = {
        ...result[0],
        categories,
      }

      return res.status(200).send(fillParcelData)
    })
  },
  getFillParcelProduct: (req, res) => {
    const { idCategory } = req.params
    const getFillParcelProduct = `
    SELECT *
    FROM product
    WHERE idproduct_category=${db.escape(idCategory)};
    `

    db.query(getFillParcelProduct, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      if (result.length === 0) return res.status(404).send("Data Produk tidak ditemukan")

      const parcelProductData = result.map((product) => {
        delete product.product_price
        delete product.product_capital
        return product
      })

      return res.status(200).send(parcelProductData)
    })
  },
  newOrder: (req, res) => {
    const { orderData, orderDetailData } = req.body
    const { idusers } = orderData
    const { idparcel, parcel_qty, parcelContents } = orderDetailData

    if (parcelContents.length === 0) {
      return res.status(400).send("Oops, isi parselmu masih kosong!")
    }

    const checkQty = `
    SELECT *
    FROM product
    WHERE idproduct=?
    `

    const parcelContentsLastIndex = parcelContents.length - 1

    const resTemp = []
    parcelContents.map((product, index) => {
      const { idProduct, qty, productName } = product

      const pushResTemp = (item) => {
        resTemp.push(item)
      }

      db.query(checkQty, idProduct, (errQty, resQty) => {
        const currentStock = resQty[0].product_stock
        if (currentStock === 0) {
          pushResTemp({
            error: true,
            message: `Produk ${productName} habis. Mohon hapus dari isi parsel anda`,
          })
        } else if (qty > currentStock) {
          pushResTemp({
            idProduct,
            error: true,
            message: `Produk ${productName} tinggal ${currentStock} pcs. Mohon kurangi stok anda`,
          })
        }
        if (index === parcelContentsLastIndex) {
          setResultQty(resTemp)
        }
      })
    })

    const setResultQty = (resultQty) => {
      if (resultQty.length !== 0) return res.status(400).send(resultQty)

      // Generate Order Status Cart
      orderData.idorder_status = 1

      // Query Check Order User dengan status Cart
      const checkUserCart = `
      SELECT *
      FROM \`order\`
      WHERE idusers=${db.escape(idusers)} AND idorder_status=1
      `

      db.query(checkUserCart, (errCheckUserCart, resCheckUserCart) => {
        if (errCheckUserCart) return res.status(500).send("Terjadi kesalahan pada server")

        // Jika user masih memiliki order dengan status cart
        if (resCheckUserCart.length !== 0) {
          const { idorder } = resCheckUserCart[0]

          // Check parsel yang sama dalam cart
          const checkParcelExist = `
          SELECT *
          FROM order_detail
          WHERE idorder=${db.escape(idorder)} AND idparcel=${db.escape(idparcel)}
          `

          db.query(checkParcelExist, (errCheckParcelExist, resCheckParcelExist) => {
            if (errCheckParcelExist) return res.status(500).send("Terjadi kesalahan pada server")

            // Generate Parcel No Baru
            let parcel_no = 1

            // Jumlah hasil query order_detail
            const parcelExistLength = resCheckParcelExist.length

            // Jika ada parsel yang sama dalam cart
            if (parcelExistLength !== 0) {
              // Generate parcel no baru
              const newParcelNo = resCheckParcelExist[parcelExistLength - 1].parcel_no + 1
              parcel_no = newParcelNo
            }

            // Generate order detail data
            const orderDetail = [idorder, idparcel, parcel_no, parcel_qty]

            // Mapping value data product untuk insert order detail
            parcelContentData = parcelContents.map((product) => [
              ...orderDetail,
              product.idProduct,
              product.qty,
              product.idCategory,
            ])

            // Query insert order detail
            const insertOrderDetail = `
            INSERT INTO order_detail (idorder, idparcel, parcel_no, parcel_qty, idproduct, product_qty, idproduct_category)
            VALUES ?
            `

            db.query(
              insertOrderDetail,
              [parcelContentData],
              (errInsertOrderDetail, resInsertOrderDetail) => {
                if (errInsertOrderDetail)
                  return res.status(500).send("Terjadi kesalahan pada server!")
                // Kirim notfikasi berhasil menambahkan parsel ke dalam cart setelah mapping selesai
                return res.status(201).send("Berhasil menambahkan parsel ke dalam cart!")
              }
            )
          })
        } else {
          // Jika user tidak punya order dengan status cart
          // Generate No Order baru
          const newOrderNumber = Date.now()
          orderData.order_number = newOrderNumber

          // Query Generate Order Baru
          const insertOrderData = `
          INSERT INTO \`order\`
          SET ?
          `

          db.query(insertOrderData, orderData, (errInsertOrderData, resInsertOrderData) => {
            if (errInsertOrderData) return res.status(500).send("Terjadi kesalahan pada server")

            const idorder = resInsertOrderData.insertId

            // Generate Parcel No Baru
            let parcel_no = 1

            // Generate order detail data
            const orderDetail = [idorder, idparcel, parcel_qty, parcel_no]

            parcelContentData = parcelContents.map((product) => [
              ...orderDetail,
              product.idProduct,
              product.qty,
              product.idCategory,
            ])

            // Query insert order detail
            const insertOrderDetail = `
            INSERT INTO order_detail (idorder, idparcel, parcel_no, parcel_qty, idproduct, product_qty, idproduct_category)
            VALUES ?
            `

            db.query(
              insertOrderDetail,
              [parcelContentData],
              (errInsertOrderDetail, resInsertOrderDetail) => {
                if (errInsertOrderDetail)
                  return res.status(500).send("Terjadi kesalahan pada server!")
                // Kirim notfikasi berhasil menambahkan parsel ke dalam cart setelah mapping selesai
                return res.status(201).send("Berhasil menambahkan parsel ke dalam cart!")
              }
            )
          })
        }
      })
    }
  },
}
