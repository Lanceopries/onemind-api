const ClientSearchFullData = require("../models/Entities/service.full.data");

module.exports.parseIndvidualName = async function (name) {
  let names = name.split(" ");
  let result = {};
  if (names.length > 0) {
    result.lName = names[0];
  }
  if (names.length > 1) {
    result.fName = names[1];
  }
  if (names.length > 2) {
    result.sName = names[2];
  }
  return result;
};

/**
 * Get name from data
 * @param {ClientSearchFullData} data 
 * @returns name of organization or people
 */
module.exports.parseName = async function(data) {
  switch(data.typePerson){
    case ClientSearchFullData.TypePerson.Individual:{
      return await this.parseIndvidualName(data.name);
    }
    case ClientSearchFullData.TypePerson.Legal:{
      return data.shortName || data.name;
    }
  }
};