const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  passwordHash: {
    type: String,
    required: [true, "Password is required!"],
  },
  imageURL: { type: String, default: "" },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  address: {
    addressName: { type: String, default: "" },
    streetName: { type: String, default: "" },
    streetNumber: { type: Number, default: 0 },
    postalCode: { type: String, lenght: 5, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
  },
});

const User = model("User", userSchema);

module.exports = User;
