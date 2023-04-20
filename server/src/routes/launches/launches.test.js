//The supertest package has a lot of convinence tools
//we will be using.f
const request = require("supertest");
//This app is the express server file we made eariler
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");
//The describe block gives a simple description of
//what the test is trying to acomplish. The callback
//function will contain all the other blocks

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    //We will compare the following object in
    //multiple tests bellow. Having it this high
    //in scope allows it to be accessiable in all
    //tests.
    //The first object includes the date. The next
    //object is the same but without the date.
    const completeLaunchData = {
      mission: "Poopy Test Mission",
      rocket: "Farty",
      target: "Kepler-296 A f",
      launchDate: "November 5, 2025",
    };

    const launchDataWithoutDate = {
      mission: "Poopy Test Mission",
      rocket: "Farty",
      target: "Kepler-296 A f",
    };

    const launchDataWithInvalidDate = {
      mission: "Poopy Test Mission",
      rocket: "Farty",
      target: "Kepler-296 A f",
      launchDate: "that time is now",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid date format",
      });
    });
  });
});
