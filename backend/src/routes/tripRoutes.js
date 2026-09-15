const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/', tripController.createTrip);
router.post('/join', tripController.joinTrip);
router.get('/:code', tripController.getTrip);
router.post('/:code/preferences', tripController.submitPreferences);
router.post('/:code/recommend', tripController.recommend);
router.post('/:code/ai-summary', tripController.aiSummary);

module.exports = router;
