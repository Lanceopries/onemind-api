const egrp = require('../externalServices/egrp.service');
const fedsfm = require('../externalServices/terrorist.validation.service');
const ClientSearchData = require("../models/Entities/service.data");
const ClientSearchFullData = require("../models/Entities/service.full.data");

/**
 * 
 * @param {ClientSearchData} personInfo 
 */
module.exports.processPerson = async function(personInfo){
    //all must be method getInfo
    // and parameter ClientSearchFullData data
    let services = [
        fedsfm,
        //https://fssp.gov.ru/ - need registration to API - captcha
        //https://kad.arbitr.ru/Kad/SearchInstances - not working... don't know why
    ];

    let mainData = await egrp.getInfo(personInfo);
    let fullData = new ClientSearchFullData(mainData[0].inn, mainData[0].ogrn, mainData[0].type, mainData[0].name)

    let promises = [];
    for(service of services){
        promises.push(service.getInfo(fullData));
    }

    let results = await Promise.allSettled(promises);
    results.push(fullData);

    return results;
}