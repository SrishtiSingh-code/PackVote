require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const tripRoutes = require('./src/routes/tripRoutes');
const miscRoutes = require('./src/routes/destinationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'packvote-backend' }));

app.use('/api/trips', tripRoutes);
app.use('/api', miscRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`PackVote backend running on port ${PORT}`));
});
