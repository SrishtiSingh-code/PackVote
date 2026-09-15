const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the connection string from the
 * MONGODB_URI environment variable.
 *
 * IMPORTANT: the connection string is never hardcoded here. It is only
 * ever read from process.env.MONGODB_URI, which is set via a local .env
 * file (see .env.example) or, when running with Docker Compose, passed
 * through from the host's .env into the backend container.
 *
 * Kept in its own file so the connection logic is easy to find and
 * explain: "server.js calls connectDB() once on startup."
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      'MONGODB_URI is not set. Copy .env.example to .env and set MONGODB_URI ' +
        'to your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    // Only log that a connection succeeded -- never log the URI itself,
    // since it contains the database username and password.
    console.log('MongoDB Atlas connected.');
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
