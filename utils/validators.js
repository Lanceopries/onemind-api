module.exports.isInnValid = async function (inn) {
  inn = String(inn)
    .replace(/[^0-9]+/g, "")
    .split("");
  if (inn.length == 10) {
    return (
      inn[9] ==
      String(
        ((2 * inn[0] +
          4 * inn[1] +
          10 * inn[2] +
          3 * inn[3] +
          5 * inn[4] +
          9 * inn[5] +
          4 * inn[6] +
          6 * inn[7] +
          8 * inn[8]) %
          11) %
          10
      )
    );
  } else if (inn.length == 12) {
    return (
      inn[10] ==
        String(
          ((7 * inn[0] +
            2 * inn[1] +
            4 * inn[2] +
            10 * inn[3] +
            3 * inn[4] +
            5 * inn[5] +
            9 * inn[6] +
            4 * inn[7] +
            6 * inn[8] +
            8 * inn[9]) %
            11) %
            10
        ) &&
      inn[11] ==
        String(
          ((3 * inn[0] +
            7 * inn[1] +
            2 * inn[2] +
            4 * inn[3] +
            10 * inn[4] +
            3 * inn[5] +
            5 * inn[6] +
            9 * inn[7] +
            4 * inn[8] +
            6 * inn[9] +
            8 * inn[10]) %
            11) %
            10
        )
    );
  }
  return false;
};

// проверка СНИЛС
module.exports.isGpsValid = async function (gps) {
  gps = String(gps).replace(/[^0-9]+/g, "");
  if (gps.length == 11) {
    var checksum = 0;
    for (var i = 0; i < 9; i++) {
      checksum += parseInt(gps.charAt(i)) * (9 - i);
    }
    if (checksum > 101) {
      checksum = checksum % 101;
    }
    if (checksum == 100 || checksum == 101) {
      checksum = 0;
    }
    return checksum == parseInt(gps.substr(9));
  }
  return false;
};

// проверка ОГРН и ОГРНИП
module.exports.isOgrnValid = async function (ogrn) {
  ogrn = String(ogrn).replace(/[^0-9]+/g, "");
  if (ogrn.length == 13) {
    // ОГРН
    return ogrn[12] == (parseInt(ogrn.slice(0, -1)) % 11).toString().slice(-1);
  } else if (ogrn.length == 15) {
    // ОГРНИП
    return ogrn[14] == (parseInt(ogrn.slice(0, -1)) % 13).toString().slice(-1);
  }
  return false;
};
