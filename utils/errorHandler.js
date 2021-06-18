const DbError = require("../models/CustomErrors/DbError");

module.exports = (res, error) => {
  let errMsg = error.message ? error.message : error;
  if (error instanceof DbError) {
    errMsg =
      "Пожалуйста, попоробуйте повторить действие позднее. Проблемы с соединением к базе данных.";
  }
  res.status(500).json({
    success: false,
    message: error.message ? error.message : error,
  });
};
