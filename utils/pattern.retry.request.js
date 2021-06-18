const axios = require("axios");
const { delay } = require("lodash");

module.exports.postRetry = async function (url, data, config, countRetry = 3) {
  while (countRetry > 0) {
    countRetry--;
    try {
        return await axios.post(url, data, config);
    } catch (error) {
      if (countRetry == 0) {
        throw error;
      }
      await sleep(200);
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
      await sleep(200);
    }
  }
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
