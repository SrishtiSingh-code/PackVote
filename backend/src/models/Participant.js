const mongoose = require('mongoose');
const PreferenceSchema = require('./Preference');

/**
 * Participant sub-schema.
 * Each trip has a list of participants. A participant starts with
 * submitted = false, and once they fill in the Preference Page,
 * `preferences` and `submitted` get updated.
 */
const ParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    submitted: { type: Boolean, default: false },
    preferences: { type: PreferenceSchema, default: () => ({}) },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

module.exports = ParticipantSchema;
