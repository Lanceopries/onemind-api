const egrp = require("../externalServices/egrp.service");
const fedsfm = require("../externalServices/terrorist.validation.service");
const fssp = require("../externalServices/fssp.service");
const ClientSearchData = require("../models/Entities/service.data");
const ClientSearchFullData = require("../models/Entities/service.full.data");

/**
 *
 * @param {ClientSearchData} personInfo
 */
module.exports.processPerson = async function (personInfo) {
  //all must be method getInfo
  // and parameter ClientSearchFullData data
  let services = [
    fedsfm,
    fssp,
    //https://kad.arbitr.ru/Kad/SearchInstances - not working... don't know why
  ];

  let egrpResult = await egrp.getInfo(personInfo);
  let mainData = egrpResult.data[0];
  let fullData = new ClientSearchFullData(
    mainData.inn,
    mainData.ogrn,
    mainData.type,
    mainData.name,
    mainData.shortName
  );

  let promises = [];
  for (service of services) {
    promises.push(service.getInfo(fullData));
  }

  let results = await Promise.allSettled(promises);
  let response = [];
  for (let data of results) {
    if (data.status == "fulfilled") {
      response.push({
        success: true,
        service: data.value.serviceName,
        data: data.value.data,
      });
    } else {
      response.push({
        success: false,
        service: data.reason.serviceName,
        errorMsg: data.reason.message,
      });
    }
  }
  response.push({
    success: true,
    service: egrpResult.serviceName,
    data: egrpResult.data[0],
  });

  return response;
};
