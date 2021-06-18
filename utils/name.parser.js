module.exports.parseIndvidualName = async function getIndividualName(name) {
  let names = name.split(" ");
  let result = {};
  if (names.length > 0) {
    result.fName = names[0];
  }
  if (names.length > 1) {
    result.lName = names[1];
  }
  if (names.length > 2) {
    result.sName = names[2];
  }
  return result;
};
