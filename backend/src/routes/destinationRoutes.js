const express = require('express');
const router = express.Router();
const destinations = require('../data/destinations');
const helpData = require('../data/helpData');

// Small read-only endpoints, handy for the frontend and for demos.
router.get('/destinations', (req, res) => res.json(destinations));
router.get('/help', (req, res) => res.json(helpData));

module.exports = router;
