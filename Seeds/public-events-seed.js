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
    duration: 100,
    url: "teddy01.jpg",
    address: {
      addressName: "Lanxess Arena",
      streetName: "Willy-Brandt-Platz ",
      streetNumber: "3",
      postalCode: "50569",
      country: "Germany",
      city: "Köln",
      latitude: 50.93872,
      longitude: 6.98424,
    },
  },
  {
    title: "Bosse",
    public: true,
    startDate: "2021-09-12T00:00:00.000+00:00",
    description:
      "Bosse endlich mal wieder live. Ganz ganz toll. echt so schön, blablabla",
    duration: 150,
    url: "bosse01.jpg",
    address: {
      addressName: "Wuhlheide",
      streetName: "Straße zum FEZ",
      streetNumber: "4",
      postalCode: "12459",
      country: "Germany",
      city: "Berlin",
      latitude: 52.46215,
      longitude: 13.54657,
    },
  },
  {
    title: "Der König der Löwen",
    public: true,
    startDate: "2021-10-02T00:00:00.000+00:00",
    description: "König der Löwen in Hamburch,.. mensch, wat toll!",
    duration: 90,
    url: "lionking01.jpg",
    address: {
      addressName: "Der König der Löwen",
      streetName: "Norderelbstr.",
      streetNumber: "6",
      postalCode: "20457",
      country: "Germany",
      city: "Hamburg",
      longitude: 9.9733,
      latitude: 53.53954,
    },
  },
  {
    title: "Mine",
    public: true,
    startDate: "2022-02-10T00:00:00.000+00:00",
    description: "MINE Live in Concert! cool, cool, cool.",
    duration: 120,
    url: "mine01.jpg",
    address: {
      addressName: "Festsaal Kreuzberg",
      streetName: "Am Flutgraben",
      streetNumber: "2",
      postalCode: "12435",
      country: "Germany",
      city: "Berlin",
      latitude: 52.49706,
      longitude: 13.4516,
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
