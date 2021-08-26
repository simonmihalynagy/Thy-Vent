const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  startDate: { type: Date, required: true },
  description: String,
  duration: Number,
  location: String,

  admin: [{ type: Schema.Types.ObjectId, ref: "User" }],
  guests: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Event = model("Event", eventSchema);

module.exports = Event;
