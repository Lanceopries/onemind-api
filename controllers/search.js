const PersonProcessService = require("../services/process.person.service");
const Validators = require("../utils/validators");
const ClientSearchData = require("../models/Entities/service.data");
const errorHandler = require("../utils/errorHandler");

module.exports.search = async function (req, res) {
  if (!req.body.data) {
    return res.status(409).json({
      message: "Error: inn and ogrn list is empty",
    });
  }
  let data = req.body.data;
  
  let persons = [];
  for (let param of data) {
    if (await Validators.isInnValid(param)) {
      persons.push(new ClientSearchData(param, null));
    }
    if (await Validators.isOgrnValid(param)) {
      persons.push(new ClientSearchData(null, param));
    }
  }

  try {
    let infoPromises = [];
    for(let person of persons){
      infoPromises.push(PersonProcessService.processPerson(person))
    }

    let viewModels = [];
    let personInfos = await Promise.allSettled(infoPromises);
    for(let personInfo of personInfos){
      if(personInfo.status == "fulfilled"){
        let viewModel = await PersonProcessService.getViewModel(personInfo.value);
        viewModels.push(viewModel);
      }
    }

    let result = {};
    if(viewModels.length != 0){
      result = viewModels[0];
      result.sameOrganizationList = viewModels.slice(1);
    }
    
    res.status(200).json(result);
  } catch (e) {
    errorHandler(res, e);
  }
};
