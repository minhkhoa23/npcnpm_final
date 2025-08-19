const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/tournament_db';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connection successful');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });