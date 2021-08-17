const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const eventSchema = new Schema({
  admin: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  guests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  

  //   username: {
  //     type: String,
  //     unique: true,
  //     required: [true, 'Username is required.'],
  //   },
  //   passwordHash: {
  //     type: String,
  //     required: [true, 'Password is required!'],
  //   },
  //   email: {
  //     type: String,
  //     match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  //     required: [true, 'Email is required.'],
  //     unique: true,
  //     lowercase: true,
  //     trim: true,
  //   },
});

const Event = model('Event', eventSchema);

module.exports = Event;
