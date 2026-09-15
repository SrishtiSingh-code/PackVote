const mongoose = require('mongoose');

/**
 * Preference sub-schema.
 * This is what a single participant fills in on the Preference Page.
 * It is embedded inside a Participant, not stored as its own collection,
 * because preferences never need to be queried on their own -- they are
 * always read together with the participant who submitted them.
 */
const PreferenceSchema = new mongoose.Schema(
  {
    budget: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    duration: {
      type: String,
      enum: ['2-3', '4-6', '7+'],
    },
    travelStyles: [
      {
        type: String,
        enum: ['relaxation', 'adventure', 'culture', 'nature', 'nightlife', 'food'],
      },
    ],
    climate: {
      type: String,
      enum: ['cold', 'mild', 'warm'],
    },
    accommodation: {
      type: String,
      enum: ['budget', 'hotel', 'luxury', 'resort'],
    },
    activities: [
      {
        type: String,
        enum: [
          'beaches',
          'mountains',
          'museums',
          'hiking',
          'shopping',
          'food',
          'historical',
          'nightlife',
          'watersports',
          'photography',
        ],
      },
    ],
    additionalNotes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

module.exports = PreferenceSchema;
