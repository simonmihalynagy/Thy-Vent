const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  public: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  description: String,
  duration: Number,

  admin: [{ type: Schema.Types.ObjectId, ref: "User" }],
  guests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  address: {
    addressName: { type: String, default: "" },
    streetName: { type: String, default: "" },
    streetNumber: { type: Number, default: 0 },
    postalCode: { type: String, lenght: 5, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
  },
});

const Event = model("Event", eventSchema);

module.exports = Event;
