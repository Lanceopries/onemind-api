module.exports = class ClientSearchData {
  constructor(inn, ogrn, typePerson, name) {
    this.inn = inn;
    this.ogrn = ogrn;
    this.name = name;
    this.typePerson = typePerson;
  }
};
const TypePerson = Object.freeze({ Individual: 1, Legal: 2 });
module.exports.TypePerson = TypePerson;