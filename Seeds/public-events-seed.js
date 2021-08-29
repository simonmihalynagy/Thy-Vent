const mongoose = require("mongoose");
const Event = require("../models/Event.model");

const DB_NAME = "event-project";

mongoose.connect(`mongodb://localhost/${DB_NAME}`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const events = [
  {
    title: "Teddy Comedy",
    public: true,
    startDate: "2021-03-12T00:00:00.000+00:00",
    description: "Teddy Teclebrhan live in concert! Toll toll toll!",
    duration: 10,
    address: {
      addressName: "Lanxess Arena",
      streetName: "Willy-Brandt-Platz ",
      streetNumber: "3",
      postalCode: "50569",
      country: "Germany",
      city: "Köln",
    },
  },
  {
    title: "Bosse",
    public: true,
    startDate: "2021-09-12T00:00:00.000+00:00",
    description:
      "Bosse endlich mal wieder live. Ganz ganz toll. echt so schön, blablabla",
    duration: 1222,
    address: {
      addressName: "Wuhlheide",
      streetName: "Straße zum FEZ",
      streetNumber: "4",
      postalCode: "12459",
      country: "Germany",
      city: "Berlin",
    },
  },
];

Event.create(events)
  .then((resFromDb) => {
    console.log(`Created ${resFromDb.length} events`);

    // Once created, close the DB connection
    mongoose.connection.close();
  })
  .catch((err) =>
    console.log(`An error occurred while creating books from the DB: ${err}`)
  );
