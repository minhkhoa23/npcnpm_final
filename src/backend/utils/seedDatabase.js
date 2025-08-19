// src/backend/utils/seedDatabase.js

const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');

const Tournament = require('../models/Tournament');
const Competitor = require('../models/Competitor');
const User       = require('../models/User');

const dataDir = path.join(__dirname, 'seed');

function loadJSON(fileName) {
  const raw = fs.readFileSync(path.join(dataDir, fileName));
  return JSON.parse(raw);
}

module.exports = async function seed() {
  console.log('⏳ Dropping database & seeding …');
  await mongoose.connection.dropDatabase();

  // 1) Seed users
  const users = loadJSON('users.json').map(u => {
    delete u._id;     // nếu có
    return u;
  });
  const userDocs = await User.insertMany(users);
  const userId   = userDocs[0]._id;

  // 2) Seed tournaments – giữ nguyên _id từ JSON để giữ mapping competitorId → tournamentId
  const tours = loadJSON('tournaments.json').map(t => {
    if (!t.organizerId) t.organizerId = userId;
    return t;
  });
  await Tournament.insertMany(tours);

  // 3) Seed competitors – dùng chính tournamentId trong JSON
  const comps = loadJSON('competitors.json').map(c => {
    delete c._id;     // nếu có
    return c;
  });
  const compDocs = await Competitor.insertMany(comps);

  // 4) Cập nhật arrays 'teams' cho từng tournament
  const byTour = {};
  compDocs.forEach(c => {
    const tid = c.tournamentId.toString();
    if (!byTour[tid]) byTour[tid] = [];
    byTour[tid].push(c._id);
  });
  await Promise.all(Object.entries(byTour).map(([tid, teamIds]) =>
    Tournament.findByIdAndUpdate(tid, { teams: teamIds })
  ));

  console.log('✅ Seed database finished');
};
