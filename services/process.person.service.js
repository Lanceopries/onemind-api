const egrp = require("../externalServices/egrp.service");
const fedsfm = require("../externalServices/terrorist.validation.service");
const fssp = require("../externalServices/fssp.service");
const scoreService = require("../services/score.organization.service");
const moment = require("moment");
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
  let arraySocialLinks = [];
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
      socialLinks: arraySocialLinks,
    };
  }

  let randomValues = {
    capitalizationAmount: getRandomInt(10000, 2000000),
    filialCount: getRandomInt(0, 3),
    buildingCount: getRandomInt(0, 5),
    riskPercent: getRandomInt(0, 50),
    dynamicPercent: getRandomInt(0, 30),
  };

  let reliabilityMoreInfo = [];
  let fsspInfo = serviceInfo.find((x) => x.service == fssp.getServiceName());
  let fsspCount = -1;
  if (fsspInfo && fsspInfo.success) {
    fsspCount = fsspInfo.data.length;
    reliabilityMoreInfo.push(
      new MoreInfo("Исполнительных производств", fsspCount)
    );
  }
  let fedsfmInfo = serviceInfo.find(
    (x) => x.service == fedsfm.getServiceName()
  );
  let fedsfmInfoCount = -1;
  if (fedsfmInfo && fedsfmInfo.success) {
    fedsfmInfoCount = 0;
    if (fedsfmInfo.data.length > 0) {
      reliabilityMoreInfo.push(
        new MoreInfo(
          "Внимание эта организация мб включена в список экстремисских!!!",
          ""
        )
      );
    }
  }
  reliabilityMoreInfo.push(
    new MoreInfo("Капитализация", randomValues.capitalizationAmount)
  );
  reliabilityMoreInfo.push(new MoreInfo("Филиалы", randomValues.filialCount));
  reliabilityMoreInfo.push(
    new MoreInfo("Объектов недвижимости", randomValues.buildingCount)
  );
  let scoreReliablilty = await getScoreByReliability(
    egrpInfo.data,
    fsspCount,
    -1, //arraySocialLinks.length,
    fedsfmInfoCount > 0
  );
  let reliability = {
    result: scoreReliablilty,
    moreInfo: reliabilityMoreInfo,
  };

  let freeLimitInfo = [];
  freeLimitInfo.push(
    new MoreInfo("Капитализация", randomValues.capitalizationAmount)
  );
  freeLimitInfo.push(new MoreInfo("Филиалы", randomValues.filialCount));
  freeLimitInfo.push(
    new MoreInfo("Объектов недвижимости", randomValues.buildingCount)
  );
  freeLimitInfo.push(new MoreInfo("Рост выручки", randomValues.dynamicPercent));
  let freeLimit = {
    result: scoreService.getMaxAmountCredit(
      randomValues.capitalizationAmount,
      randomValues.riskPercent,
      randomValues.dynamicPercent
    ),
    moreInfo: freeLimitInfo,
  };

  let companyPriceInfo = [];
  companyPriceInfo.push(
    new MoreInfo("Капитализация", randomValues.capitalizationAmount)
  );
  let companyPrice = {
    result: randomValues.capitalizationAmount / 1000,
    moreInfo: companyPriceInfo,
  };

  let verdictInfo = [];
  let verdict = {
    result: await scoreService.getVerdict(scoreReliablilty),
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

/**
 *
 * @param {Object} egrpInfo
 * @param {Number} fsspCount
 * @param {Number} countSocialLinks
 * @param {Boolean} isFedsm
 * @returns
 */
async function getScoreByReliability(
  egrpInfo,
  fsspCount,
  countSocialLinks,
  isFedsm
) {
  let score = 0;
  let countOfParams = 0;

  if (isFedsm) {
    return 0;
  }

  if (egrpInfo && egrpInfo.dateFrom) {
    let dateFrom = moment(egrpInfo.dateFrom, "DD.MM.yyyy");
    let scoreForYear = await scoreService.getScoreForWorkPeriod(dateFrom._d);
    score += scoreForYear;
    countOfParams++;
  }

  if (countSocialLinks != -1) {
    let scoreForSocialLinks = await scoreService.getScoreForSocialLinks(
      countSocialLinks
    );
    score += scoreForSocialLinks;
    countOfParams++;
  }

  if (fsspCount != -1) {
    let scoreForCountFssp = await scoreService.getScoreForFssp(fsspCount);
    score += scoreForCountFssp;
    countOfParams++;
  }

  let maxScore = await scoreService.getMaxCountOfScore(countOfParams);
  return (score * 100) / maxScore;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}
