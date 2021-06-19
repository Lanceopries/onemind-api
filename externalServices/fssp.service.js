const util = require("../utils/pattern.retry.request");
const ClientSearchFullData = require("../models/Entities/service.full.data");
const NameParser = require("../utils/name.parser");
const BaseUrl = "https://api-ip.fssp.gov.ru/api/v1.0";
const token = "X7PS7O9RRjg5";
const serviceName = "fssp";
const ServiceError = require("../models/CustomErrors/ServiceError");
const regionArray = [
  22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 75, 37, 38, 07, 39, 40, 41, 09, 42,
  43, 44, 23, 24, 45, 46, 47, 48, 49, 77, 50, 51, 52, 53, 54, 55, 56, 57, 58,
  59, 25, 60, 01, 04, 02, 03, 05, 06, 08, 10, 11, 82, 12, 13, 14, 16, 17, 19,
  61, 62, 63, 78, 64, 65, 66, 92, 15, 67, 26, 68, 69, 70, 71, 72, 18, 73, 99,
  27, 86, 74, 20, 21, 89, 76,
];

/**
 * Get info about person from egrp
 *
 * @param {ClientSearchFullData} data parameters from client
 * @returns array of rows and service name
 */
module.exports.getInfo = async function (data) {
  try {
    let resultArray = [];
    let countProcessed = 0;
    while (countProcessed < regionArray.length) {
      let result = await getInfoByPerson(data, countProcessed);
      countProcessed = result.countProcessed;
      resultArray = resultArray.concat(result.data);
    }
    return {
      serviceName: serviceName,
      data: resultArray,
    }; 
  } catch (error) {
    throw new ServiceError(error.message, serviceName);
  }
};

/**
 * Get info from fssp about organization or person
 * @param {ClientSearchFullData} data
 * @param {Number} countProcessed
 */
async function getInfoByPerson(data, countProcessed) {
  let taskObj = {};
  let name = await NameParser.parseName(data);
  switch (data.typePerson) {
    case ClientSearchFullData.TypePerson.Individual: {
      let personName = name;
      taskObj = await searchPhysicalGroup(
        personName.fName,
        personName.lName,
        personName.sName,
        null,
        countProcessed
      );
      break;
    }
    case ClientSearchFullData.TypePerson.Legal: {
      taskObj = await searchLegalGroup(name, null, countProcessed);
      break;
    }
    default: {
      throw new Error("Incorrect type of person or organization");
    }
  }

  while (true) {
    await util.delay(200);

    let status = await getStatusOfTask(taskObj.task);
    if (status != 1 && status != 2) {
      break;
    }
  }

  let response = await getResult(taskObj.task);
  let resultArray = [];
  for(let request of response){
    if(request.result.length == 0){
      continue;
    }
    resultArray = resultArray.concat(request.result);
  }
  return {
    data: resultArray,
    countProcessed: taskObj.countProcessed,
  };
}

/**
 * Get taskId from fssp for search by legal
 * @param {String} name
 * @param {String} address
 * @returns guid of taskId
 */
async function searchLegal(name, address) {
  let result = await sendRequestToApi(BaseUrl + "/search/legal", {
    name: name,
    region: -1,
  });
  return result.response.data.task;
}

/**
 * Get taskId from fssp for search by legal in group
 * @param {String} name
 * @param {String} address
 * @param {Number} countProcessed
 * @returns guid of taskId
 */
async function searchLegalGroup(name, address, countProcessed) {
  let result = await searchByAllRegions({
    name: name,
  }, 2, countProcessed);
  return result;
}

/**
 * Get taskId from fssp for search by physical
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} secondName
 * @param {String} birthDate
 * @returns guid of taskId
 */
async function searchPhysical(firstName, lastName, secondName, birthDate) {
  let result = await sendRequestToApi(BaseUrl + "/search/physical", {
    firstname: firstName,
    lastname: lastName,
    secondname: secondName,
    birthdate: birthDate,
    region: 0,
  });
  return result.data.response.task;
}

/**
 * Get taskId from fssp for search by physical
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} secondName
 * @param {String} birthDate
 * @param {Number} countProcessed
 * @returns guid of taskId
 */
async function searchPhysicalGroup(firstName, lastName, secondName, birthDate, countProcessed) {
  let result = await searchByAllRegions({
    firstname: firstName,
    lastname: lastName,
    secondname: secondName,
    birthdate: birthDate,
  }, 1, countProcessed);
  return result;
}

/**
 * Get status of task
 * @param {String} taskId
 * @returns status of task on search
 */
async function getStatusOfTask(taskId) {
  let result = await sendRequestToApi(
    BaseUrl + "/status",
    { task: taskId },
    false
  );
  return result.data.response.status;
}

/**
 * Get result by task
 * @param {String} taskId
 * @returns result of request
 */
async function getResult(taskId) {
  let result = await sendRequestToApi(
    BaseUrl + "/result",
    { task: taskId },
    false
  );
  return result.data.response.result;
}

async function searchByAllRegions(params, type, countProcessed = 0) {
  let countProcessRegions = countProcessed;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  while (countProcessRegions != regionArray.length) {
    let stepRequest = 0;
    let requestParams = [];
    while (stepRequest < 50 && countProcessRegions < regionArray.length) {
      countProcessRegions++;
      stepRequest++;
      let temp = Object.assign({}, params, {
        region: regionArray[countProcessRegions - 1],
      });
      requestParams.push({
        type: type,
        params: temp
      });
    }

    let result = await util.postRetry(
      BaseUrl + "/search/group",
      { token: token, request: requestParams },
      config
    );
    return {
      task: result.data.response.task,
      countProcessed: countProcessRegions,
    };
  }
}

/**
 * Send request to FSSP API
 * @param {String} url
 * @param {Object} data
 * @param {Boolean} withEncode
 * @returns
 */
async function sendRequestToApi(url, data, withEncode = true) {
  const paramsStr = await util.objectToGetParams(data, withEncode);

  const result = await util.getRetry(
    url + "?token=" + token + (paramsStr ? "&" + paramsStr : "")
  );
  return result;
}
