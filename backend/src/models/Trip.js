const mongoose = require('mongoose');
const ParticipantSchema = require('./Participant');

/**
 * Trip is the main document in PackVote.
 *
 * Design decision (good to mention in an interview):
 * We embed `participants` (and each participant's `preferences`) directly
 * inside the Trip document instead of using separate collections with
 * foreign keys. In MongoDB, data that is always read and written together
 * is usually best embedded -- and a Trip Room always needs the full list
 * of participants and their submission status in a single read. This
 * avoids extra queries/joins and keeps the API fast and simple.
 */
const TripSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, default: 'Untitled Trip' },
  creatorName: { type: String, required: true },

  participants: { type: [ParticipantSchema], default: [] },

  status: {
    type: String,
    enum: ['waiting', 'ready', 'completed'],
    default: 'waiting',
  },

  // Filled in once the creator generates the recommendation.
  recommendation: {
    destinationId: String,
    name: String,
    country: String,
    image: String,
    description: String,
    groupScore: Number,
    alternatives: [
      {
        destinationId: String,
        name: String,
        country: String,
        score: Number,
      },
    ],
    factors: [String],
    aiSummary: String,
    generatedAt: Date,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trip', TripSchema);
