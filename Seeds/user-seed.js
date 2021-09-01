const mongoose = require("mongoose");

const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");

const DB_NAME = "event-project";

mongoose.connect(`mongodb://localhost/${DB_NAME}`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function hashPassword(clearPassword) {
  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync(clearPassword, salt);
  return hashedPassword;
}

const users = [
  {
    email: "alex@alex.de",
    firstName: "Alex",
    lastName: "Bauer",
    passwordHash: hashPassword("Alex123"),
    address: {
      addressName: "Alex Bauer",
      streetName: "Krefelder Straße",
      streetNumber: "3",
      postalCode: "10555",
      country: "Germany",
      city: "Berlin",
    },
  },
  {
    email: "jan@jan.de",
    firstName: "Jan",
    lastName: "Schmidt",
    passwordHash: hashPassword("Jan123"),
    address: {
      addressName: "Jan Schmidt",
      streetName: "Grüntaler Straße",
      streetNumber: "44",
      postalCode: "13359",
      country: "Germany",
      city: "Berlin",
    },
  },
  {
    email: "mia@mia.de",
    firstName: "Mia",
    lastName: "San Mia",
    passwordHash: hashPassword("Mia123"),
    address: {
      addressName: "Mia San Mia",
      streetName: "Schillerstraße ",
      streetNumber: "3",
      postalCode: "13158",
      country: "Germany",
      city: "Berlin",
    },
  },
  {
    email: "shai@shai.de",
    firstName: "Shai",
    lastName: "Maestro",
    passwordHash: hashPassword("Shai123"),
    address: {
      addressName: "Shai Maestro",
      streetName: "Bassermannstraße",
      streetNumber: "4",
      postalCode: "68165",
      country: "Germany",
      city: "Berlin",
    },
  },
  {
    email: "neyla@neyla.de",
    firstName: "Neyla",
    lastName: "Mari",
    passwordHash: hashPassword("Neyla123"),
    address: {
      addressName: "Neyla Mari",
      streetName: "Bahrenfelderstraße",
      streetNumber: "156",
      postalCode: "22765",
      country: "Germany",
      city: "Hamburg",
    },
  },
];

User.create(users)
  .then((resFromDb) => {
    console.log(`Created ${resFromDb.length} users!`);

    // Once created, close the DB connection
    mongoose.connection.close();
  })
  .catch((err) =>
    console.log(`An error occurred while creating users: ${err}`)
  );
