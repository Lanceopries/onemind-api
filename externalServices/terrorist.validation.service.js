const util = require("../utils/pattern.retry.request");
const ClientSearchFullData = require("../models/Entities/service.full.data");
const serviceName = "terroristCheck";
const ServiceError = require("../models/CustomErrors/ServiceError");
const BaseUrl = "https://www.fedsfm.ru/documents/terrorists-catalog-portal-act?roistat_visit=187412";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/**
 * Get info about person from egrp
 *
 * @param {ClientSearchFullData} data parameters from client
 */
module.exports.getInfo = async function (data) {
  try {
    let htmlPage = await util.getRetry(BaseUrl);

    let terroristNames = [];

    const page = new JSDOM(htmlPage.data);
    //TODO: need cache or something like it
    var lists = page.window.document.getElementsByClassName("terrorist-list");
    for (list of lists) {
      let liList = list.getElementsByTagName("li");
      for (li of liList) {
        terroristNames.push(li.textContent);
      }
    }

    const result = terroristNames.filter(x => x == data.name);

    return {
      serviceName: serviceName,
      data: result,
    };
  } catch (error) {
    throw new ServiceError(error.message, serviceName);
  }
};
