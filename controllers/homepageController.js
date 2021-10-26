const { db } = require("../database");

module.exports = {
  //parcels on homepage
  getHomepagePagination: (req, res) => {
    const currentParcelPage = parseInt(req.params.page) || 1;

    const parcelPerPage = 5;

    let totalParcels;

    let countParcel = `SELECT COUNT(*) AS totalItems FROM parcel`;
    db.query(countParcel, (errCountParcel, resCountParcel) => {
      if (errCountParcel) {
        res.status(400).send(errCountParcel);
      }
      totalParcels = resCountParcel[0].totalItems;

      let getParcel = `SELECT * FROM final_project.parcel ORDER BY parcel_name ASC LIMIT ${db.escape(
        parcelPerPage
      )} OFFSET ${db.escape((currentParcelPage - 1) * parcelPerPage)}`;

      db.query(getParcel, (errGetParcel, resGetParcel) => {
        if (errGetParcel) {
          res.status(400).send(errGetParcel);
        }

        let result = {
          parcel: resGetParcel,
          currentPage: currentParcelPage,
          parcelPerPage: parcelPerPage,
          totalParcels: totalParcels,
        };
        res.status(200).send(result);
      });
    });
  },
  //parcel detail
  getParcelDetail: (req, res) => {
    const parcelDetail = `SELECT p.idparcel, p.parcel_name, p.parcel_price, p.parcel_desc, p.parcel_image, c.category_name, d.qty_parcel_category FROM parcel p
        LEFT JOIN parcel_detail d
        ON p.idparcel = d.idparcel
        LEFT JOIN product_category c
        ON d.idproduct_category = c.idproduct_category
        WHERE p.idparcel = ${req.params.idparcel}`;
    db.query(parcelDetail, (errParcelDetail, resParcelDetail) => {
      if (errParcelDetail) {
        res.status(400).send(errParcelDetail);
      }

      res.status(200).send(resParcelDetail);
    });
  },
  //sort parcels
  sortParcel: (req, res) => {
    const currentParcelPage = parseInt(req.params.page) || 1;

    const parcelPerPage = 5;

    let totalParcels;

    let countParcel = `SELECT COUNT(*) AS totalItems FROM parcel`;
    db.query(countParcel, (errCountParcel, resCountParcel) => {
      if (errCountParcel) {
        res.status(400).send(errCountParcel);
      }
      totalParcels = resCountParcel[0].totalItems;
      //sort query
      const { sortMethod } = req.body;
      let getParcelSorted = `SELECT * FROM final_project.parcel ORDER BY parcel_price ${sortMethod} LIMIT ${db.escape(
        parcelPerPage
      )} OFFSET ${db.escape((currentParcelPage - 1) * parcelPerPage)}`;

      db.query(getParcelSorted, (errGetParcel, resGetParcel) => {
        if (errGetParcel) {
          res.status(400).send(errGetParcel);
        }
        let result = {
          parcel: resGetParcel,
          currentPage: currentParcelPage,
          parcelPerPage: parcelPerPage,
          totalParcels: totalParcels,
        };
        res.status(200).send(result);
      });
    });
  },
  //filter parcels
  filterParcel: (req, res) => {
    const currentParcelPage = parseInt(req.params.page) || 1;

    const parcelPerPage = 5;

    const { idProductCategory } = req.body;

    const listParentID = idProductCategory
      .map((item, index) => {
        if (index === 0) {
          return `parentID = ${item}`;
        }
        return `OR parentID = ${item}`;
      })
      .join(" ");

    let totalParcels;

    let countParcel = `SELECT COUNT(*) AS totalItems from (SELECT DISTINCT p.* FROM final_project.parcel p
      LEFT JOIN parcel_detail d
      ON p.idparcel = d.idparcel
      LEFT JOIN product_category c
      ON d.idproduct_category = c.idproduct_category where ${listParentID} order by parcel_name ASC) AS Parcel;`;
    db.query(countParcel, (errCountParcel, resCountParcel) => {
      if (errCountParcel) {
        res.status(400).send(errCountParcel.sqlMessage);
      }
      totalParcels = resCountParcel[0].totalItems;

      let getParcelFiltered = `SELECT DISTINCT p.* FROM final_project.parcel p
      LEFT JOIN parcel_detail d
      ON p.idparcel = d.idparcel
      LEFT JOIN product_category c
      ON d.idproduct_category = c.idproduct_category WHERE ${listParentID} ORDER BY parcel_name ASC LIMIT ${db.escape(
        parcelPerPage
      )} OFFSET ${db.escape((currentParcelPage - 1) * parcelPerPage)}`;

      db.query(getParcelFiltered, (errGetParcel, resGetParcel) => {
        if (errGetParcel) {
          res.status(400).send(errGetParcel);
        }
        let result = {
          parcel: resGetParcel,
          currentPage: currentParcelPage,
          parcelPerPage: parcelPerPage,
          totalParcels: totalParcels,
        };
        res.status(200).send(result);
      });
    });
  },
};
