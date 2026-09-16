const mongoose = require('mongoose');
const log = require('../utils/logger').child('db');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log.info(`Connected · ${conn.connection.host}`, { database: conn.connection.name });
  } catch (error) {
    log.error(`Connection failed — ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
