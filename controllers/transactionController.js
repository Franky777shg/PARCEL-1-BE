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
  getUserCart: (req, res) => {
    const { idusers } = req.payload
    const CART = 1

    const getIdOrderOnCart = `
    SELECT idorder
    FROM \`order\`
    WHERE idusers=${db.escape(idusers)}
    AND idorder_status=${db.escape(CART)}
    `

    db.query(getIdOrderOnCart, (errGetIdOrder, resGetIdOrder) => {
      if (errGetIdOrder) {
        return res.status(500).send("Terjadi kesalahan pada server!")
      }

      if (resGetIdOrder.length === 0) {
        return res.status(400).send("Keranjang Belanjamu masih kosong!")
      }

      const idOrder = resGetIdOrder[0].idorder

      const getTotalParcelOnCart = `
      SELECT count(*) as totalParcel FROM \`order\` o
      LEFT JOIN (
        SELECT DISTINCT idorder, idparcel, parcel_no FROM order_detail
      )
      od ON o.idorder=od.idorder
      WHERE o.idorder=${db.escape(idOrder)};
      `

      db.query(getTotalParcelOnCart, (errGetTotalParcel, resGetTotalParcel) => {
        if (errGetTotalParcel) {
          return res.status(500).send("Terjadi kesalahan pada server!")
        }

        if (resGetTotalParcel.length === 0) {
          return res.status(400).send("Keranjang belanjamu masih kosong")
        }

        const totalParcel = resGetTotalParcel[0].totalParcel

        const getCartItems = `
        SELECT 
            od.idparcel,
            od.idorder_detail,
            p.parcel_name,
            p.parcel_price,
            parcel_no,
            parcel_qty,
            GROUP_CONCAT(od.idproduct) as idProducts,
            GROUP_CONCAT(product_qty) as qtyProducts,
            GROUP_CONCAT(od.idproduct_category) as idCategories,
            GROUP_CONCAT(prod.product_name) as nameProducts,
            GROUP_CONCAT(pc.category_name) as labelCategories
        FROM
            order_detail od
        LEFT JOIN parcel p ON od.idparcel=p.idparcel
        LEFT JOIN product prod ON od.idproduct=prod.idproduct
        LEFT JOIN product_category pc ON od.idproduct_category=pc.idproduct_category
        WHERE
            idorder = ${db.escape(idOrder)}
        GROUP BY od.idparcel , parcel_no;
        `

        db.query(getCartItems, (errGetCartItems, resGetCartItems) => {
          if (errGetCartItems) {
            return res.status(500).send("Terjadi kesalahan pada server!")
          }

          if (resGetCartItems.length === 0) {
            return res.status(400).send("Keranjang belanjamu masih kosong")
          }

          const cartItems = resGetCartItems.map((cartItem, idx) => {
            let parcelDetailTemp = []
            cartItem.idProducts.split(",").map((idProduct, idx) => {
              parcelDetailTemp.push({ no: idx + 1, id: parseInt(idProduct) })
            })
            cartItem.qtyProducts.split(",").map((qtyProduct, idx) => {
              parcelDetailTemp[idx].qty = parseInt(qtyProduct)
            })
            cartItem.idCategories.split(",").map((idCategory, idx) => {
              parcelDetailTemp[idx].idCategory = parseInt(idCategory)
            })
            cartItem.nameProducts.split(",").map((nameProduct, idx) => {
              parcelDetailTemp[idx].name = nameProduct
            })
            cartItem.labelCategories.split(",").map((category, idx) => {
              parcelDetailTemp[idx].category = category
            })
            return {
              parcelData: {
                idOrder,
                idCartItem: cartItem.idorder_detail,
                idParcel: cartItem.idparcel,
                parcelName: cartItem.parcel_name,
                parcelNo: cartItem.parcel_no,
                parcelPrice: cartItem.parcel_price,
                qtyParcel: cartItem.parcel_qty,
                totalPrice: cartItem.parcel_price * cartItem.parcel_qty,
              },
              parcelDetail: parcelDetailTemp,
            }
          })

          res.status(200).send({
            totalParcel,
            cartItems,
          })
        })
      })
    })
  },
  patchQtyCartDetail: (req, res) => {
    const { idOrder, idParcel, noParcel, qty, parcelDetail } = req.body

    const checkQty = `
    SELECT *
    FROM product
    WHERE idproduct=?
    `

    const parcelDetailLastIndex = parcelDetail.length - 1

    const resTemp = []
    parcelDetail.map((product, index) => {
      const { id, name } = product

      const pushResTemp = (item) => {
        resTemp.push(item)
      }

      db.query(checkQty, id, (errQty, resQty) => {
        const currentStock = resQty[0].product_stock
        if (currentStock === 0) {
          pushResTemp({
            error: true,
            message: `Produk ${name} habis. Mohon hapus dari isi parsel anda`,
          })
        } else if (qty > currentStock) {
          pushResTemp({
            id,
            error: true,
            message: `Produk ${name} tinggal ${currentStock} pcs. Mohon kurangi stok anda`,
          })
        }
        if (index === parcelDetailLastIndex) {
          setResultQty(resTemp)
        }
      })
    })

    const setResultQty = (resultQty) => {
      if (resultQty.length !== 0) return res.status(400).send(resultQty)

      const patchQtyCartDetail = `
      UPDATE order_detail
      SET 
        parcel_qty = ${db.escape(qty)},
        product_qty = ${db.escape(qty)}
      WHERE idorder=${db.escape(idOrder)} AND idparcel=${db.escape(
        idParcel
      )} AND parcel_no=${db.escape(noParcel)};
      `

      db.query(patchQtyCartDetail, (err, result) => {
        if (err) return res.status(500).send("Terjadi kesalahan pada server!")

        if (result.affectedRows === 0) return res.status(400).send("Gagal mengubah jumlah parsel!")

        return res.status(200).send("Berhasil mengubah jumlah parsel!")
      })
    }
  },
  deleteCartItem: (req, res) => {
    const { idOrder, idParcel, noParcel } = req.body

    const deleteCartItem = `
    DELETE FROM order_detail
    WHERE idorder=${db.escape(idOrder)} AND idparcel=${db.escape(
      idParcel
    )} AND parcel_no=${db.escape(noParcel)};
    `

    db.query(deleteCartItem, (err, result) => {
      if (err) return res.status(500).send("Terjadi kesalahan pada server!")

      if (result.affectedRows === 0) return res.status(400).send("Gagal menghapus parsel!")

      return res.status(200).send("Berhasil menghapus parsel!")
    })
  },
}
