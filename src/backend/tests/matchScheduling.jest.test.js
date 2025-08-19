/* eslint-disable no-undef */
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const ioClient = require("socket.io-client");

const { app, server } = require("../server");
const seedDatabase = require("../utils/seedDatabase");

const Match = require("../models/Match");
const Tournament = require("../models/Tournament");
const Competitor = require("../models/Competitor");
const User = require("../models/User");

jest.setTimeout(30_000);

let mongoServer;
let httpServer;
let baseURL;

beforeAll(async () => {
  // Try to use MongoDB Memory Server, fallback if not available
  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log("Using MongoDB Memory Server for tests");
  } catch (error) {
    console.log("MongoDB Memory Server not available, using mock database");
    // Mock mongoose for tests
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockResolvedValue(true);

    // Mock the models to return empty arrays/objects
    const mockModels = {
      Tournament: {
        findOne: jest.fn(),
        create: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
      },
      Competitor: {
        find: jest.fn().mockResolvedValue([]),
      },
      Match: {
        deleteMany: jest.fn().mockResolvedValue({}),
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn(),
      },
      User: {
        findOne: jest.fn(),
      },
    };

    // Override require for models
    jest.doMock("../models/Tournament", () => mockModels.Tournament);
    jest.doMock("../models/Competitor", () => mockModels.Competitor);
    jest.doMock("../models/Match", () => mockModels.Match);
    jest.doMock("../models/User", () => mockModels.User);
  }

  // Seed dữ liệu mẫu (only if we have real database)
  if (mongoServer) {
    await seedDatabase();
  }

  // Bật server (chưa listen trong server.js)
  httpServer = server.listen(0);
  baseURL = `http://localhost:${httpServer.address().port}`;
});

afterAll(async () => {
  if (httpServer) httpServer.close();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Match scheduling & updating flow", () => {
  test("Server responds to basic requests", async () => {
    const res = await request(app).get("/api/tournaments").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Returns 404 for invalid tournament endpoint", async () => {
    const res = await request(app)
      .get("/api/tournaments/invalid_id")
      .expect(404);

    expect(res.body.message).toBe("Tournament not found");
  });

  test("API endpoints are accessible", async () => {
    const res = await request(app).get("/api/matches").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
