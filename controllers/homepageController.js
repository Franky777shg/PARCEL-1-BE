const { db } = require("../database");

module.exports = {
  //getHomepagePagination
  getHomepagePagination: (req, res) => {
    const currentParcelPage = parseInt(req.params.page) || 1;

    const parcelPerPage = 5;

    let totalParcels;

    let countParcel = `select count(*) as totalItems from parcel`;
    db.query(countParcel, (errCountParcel, resCountParcel) => {
      if (errCountParcel) {
        res.status(400).send(errCountParcel);
      }
      totalParcels = resCountParcel[0].totalItems;

      let getParcel = `select * from parcel limit ${db.escape(
        parcelPerPage
      )} offset ${db.escape((currentParcelPage - 1) * parcelPerPage)}`;

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

  //getParcelDetail
  getParcelDetail: (req, res) => {
    const parcelDetail = `select p.idparcel, p.parcel_name, p.parcel_price, p.parcel_desc, p.parcel_image, c.category_name, d.qty_parcel_category from parcel p
        left join parcel_detail d
        on p.idparcel = d.idparcel
        left join product_category c
        on d.idproduct_category = c.idproduct_category
        where p.idparcel = ${req.params.idparcel}`;
    db.query(parcelDetail, (errParcelDetail, resParcelDetail) => {
      if (errParcelDetail) {
        res.status(400).send(errParcelDetail);
      }

      res.status(200).send(resParcelDetail);
    });
  },
  //sort
  sortParcel: (req, res) => {
    const currentParcelPage = parseInt(req.params.page) || 1;

    const parcelPerPage = 5;

    let totalParcels;

    let countParcel = `select count(*) as totalItems from parcel`;
    db.query(countParcel, (errCountParcel, resCountParcel) => {
      if (errCountParcel) {
        res.status(400).send(errCountParcel);
      }
      totalParcels = resCountParcel[0].totalItems;
      // sort
      const { sortMethod } = req.body;
      let getParcelSorted = `select * from final_project.parcel ORDER BY parcel_price ${sortMethod} limit ${db.escape(
        parcelPerPage
      )} offset ${db.escape((currentParcelPage - 1) * parcelPerPage)}`;

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
};
