const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserRole = Object.freeze({
  User: "user",
  Admin: "admin",
});

/**
 * All users in the Application.
 */
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.User,
  },
});

Object.assign(userSchema.statics, {
  UserRole,
});

module.exports = mongoose.model("users", userSchema);
