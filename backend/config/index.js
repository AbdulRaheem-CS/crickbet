/**
 * Configuration Index
 * Export all configuration modules
 */

const db = require('./db');
const cors = require('./cors');
const env = require('./env');
const payment = require('./payment');

module.exports = {
  db,
  cors,
  env,
  payment,
};
