const axios = require("axios");

module.exports.postRetry = async function (url, data, config, countRetry = 3) {
  while (countRetry > 0) {
    countRetry--;
    try {
      return await axios.post(url, data, config);
    } catch (error) {
      if (countRetry == 0) {
        throw error;
      }
      await this.delay(200);
    }
  }
};

module.exports.getRetry = async function (url, countRetry = 3) {
  while (countRetry > 0) {
    countRetry--;
    try {
      return await axios.get(url);
    } catch (error) {
      if (countRetry == 0) {
        throw error;
      }
      await this.delay(200);
    }
  }
};

/**
 * Convertion object to string with params
 * @param {Object} params 
 * @param {Boolean} withEncode
 * @returns string with params
 */
module.exports.objectToGetParams = async function (params, withEncode = true) {
  let str = "";
  for (let key in params) {
    if(params[key] == null || params[key] == undefined){
      continue;
    }
    if (str != "") {
      str += "&";
    }
    str += key + "=" + (withEncode ? encodeURIComponent(params[key]) : params[key]);
  }
  return str;
};

module.exports.delay = async function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
