const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const User = require("../models/User");
const errorHandler = require("../utils/errorHandler")

module.exports.login = async function (req, res) {
  const candidate = await User.findOne({ email: req.body.email });

  if (candidate) {
    const passwordResult = bcrypt.compareSync(
      req.body.password,
      candidate.password
    );
    if (passwordResult) {
      const token = jwt.sign({
          email: candidate.email,
          userId: candidate._id
      }, keys.jwt, {expiresIn: 6000 * 60})

      res.status(200).json({
          token: token
      })
    } else {
      res.status(401).json({
        message: "Passwords not compare",
      });
    }
  } else {
    res.status(404).json({
      message: "Error, user with current Email not found",
    });
  }
};

module.exports.register = async function (req, res) {
  const candidate = await User.findOne({
    email: req.body.email,
  });

  if (candidate) {
    res.status(409).json({
      message: "Error, try another email",
    });
  } else {
    const salt = bcrypt.genSaltSync(10);
    const password = req.body.password;
    let role = 'user';

    if (req.body.role === 'admin') {
      role = 'admin';
    }

    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt),
      role: role
    });

    try {
      await user.save();
      res.status(201).json(user);
    } catch (e) {
        errorHandler(res, e)
    }
  }
};
