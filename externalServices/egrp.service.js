const util = require("../utils/pattern.retry.request");
const ClientSearchData = require("../models/Entities/service.data");
const ClientSearchFullData = require("../models/Entities/service.full.data");
const serviceName = "egrp";
const ServiceError = require("../models/CustomErrors/ServiceError");
const BaseUrl = "https://egrul.nalog.ru";

module.exports.getServiceName = function(){
  return serviceName;
}

/**
 * Get info about person from egrp
 *
 * @param {ClientSearchData} data parameters from client
 * @returns array of rows
 */
module.exports.getInfo = async function (data) {
  try {
    const params = new URLSearchParams();
    params.append("query", data.inn || data.ogrn);

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    let result = await util.postRetry(BaseUrl, params, config);

    let searchDetail = await util.getRetry(
      BaseUrl + "/search-result/" + result.data.t
    );
    return {
      serviceName: serviceName,
      data: searchDetail.data.rows.map(function (x) {
        return {
          inn: x.i,
          ogrn: x.o,
          type: getType(x),
          name: x.n,
          shortName: x.c,
          dateFrom: x.r,
          dateTo: x.e,
        };
      }),
    };
  } catch (error) {
    throw new ServiceError(error.message, serviceName);
  }
};

function getType(row) {
  switch (row.k) {
    case "fl":
      return ClientSearchFullData.TypePerson.Individual;
    case "ul":
      return ClientSearchFullData.TypePerson.Legal;
  }
}
