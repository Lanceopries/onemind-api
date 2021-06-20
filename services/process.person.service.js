const egrp = require("../externalServices/egrp.service");
const fedsfm = require("../externalServices/terrorist.validation.service");
const fssp = require("../externalServices/fssp.service");
const ClientSearchData = require("../models/Entities/service.data");
const MoreInfo = require("../models/ViewModels/more.info");
const ClientSearchFullData = require("../models/Entities/service.full.data");

/**
 * Get information about person from services
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

module.exports.getViewModel = async function (serviceInfo) {
  let egrpInfo = serviceInfo.find((x) => x.service == egrp.getServiceName());
  let organization = {};
  if (egrpInfo) {
    let info = egrpInfo.data;
    organization = {
      inn: info.inn,
      name: info.name,
      ogrn: info.ogrn,
      typePerson: info.type,
      workFrom: info.dateFrom,
      workTo: info.dateTo,
      socialLinks: [],
    };
  }

  let reliabilityMoreInfo = [];
  let fsspInfo = serviceInfo.find((x) => x.service == fssp.getServiceName());
  if (fsspInfo && fsspInfo.success && fsspInfo.data.length > 0) {
    reliabilityMoreInfo.push(
      new MoreInfo("Исполнительных производств:", fsspInfo.data.length)
    );
  }
  let fedsfmInfo = serviceInfo.find(
    (x) => x.service == fedsfm.getServiceName()
  );
  if (fedsfmInfo && fedsfmInfo.success && fedsfmInfo.data.length > 0) {
    reliabilityMoreInfo.push(
      new MoreInfo(
        "Внимание эта организация мб включена в список экстремисских!!!",
        ""
      )
    );
  }
  reliabilityMoreInfo.push(new MoreInfo("Капитал:", "1 000 000 руб"));
  reliabilityMoreInfo.push(new MoreInfo("Филиалы:", "1"));
  reliabilityMoreInfo.push(new MoreInfo("Объектов недвижимости:", "3"));
  let reliability = {
    result: "100",
    moreInfo: reliabilityMoreInfo,
  };

  let freeLimitInfo = [];
  freeLimitInfo.push(new MoreInfo("Капитал:", "1 000 000 руб"));
  freeLimitInfo.push(new MoreInfo("Филиалы:", "1"));
  freeLimitInfo.push(new MoreInfo("Объектов недвижимости:", "3"));
  freeLimitInfo.push(new MoreInfo("Рост выручки:", "+5%"));
  let freeLimit = {
    result: "100",
    moreInfo: freeLimitInfo,
  };

  let companyPriceInfo = [];
  companyPriceInfo.push(new MoreInfo("Капитал:", "1 000 000 руб"));
  companyPriceInfo.push(new MoreInfo("Объектов недвижимости:", "3"));
  let companyPrice = {
    result: "100",
    moreInfo: companyPriceInfo,
  };

  let verdictInfo = [];
  let verdict = {
    result: "100",
    moreInfo: verdictInfo,
  };

  return {
    organization,
    reliability,
    freeLimit,
    companyPrice,
    verdict,
  };
};
