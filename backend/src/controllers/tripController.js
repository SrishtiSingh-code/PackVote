const { customAlphabet } = require('nanoid');
const Trip = require('../models/Trip');
const destinations = require('../data/destinations');
const { generateRecommendation } = require('../services/recommendationEngine');
const { generateAISummary } = require('../services/aiService');

// Trip codes use uppercase letters + digits, no ambiguous characters (0/O, 1/I).
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

/**
 * POST /api/trips
 * Creates a new trip. The creator is automatically added as the first
 * participant (not yet submitted).
 */
async function createTrip(req, res) {
  try {
    const { creatorName, tripName } = req.body;

    if (!creatorName || !creatorName.trim()) {
      return res.status(400).json({ message: 'Your name is required.' });
    }

    let code;
    let exists = true;
    // Very small chance of collision -- regenerate until we get a unique code.
    while (exists) {
      code = generateCode();
      exists = await Trip.exists({ code });
    }

    const trip = await Trip.create({
      code,
      title: tripName && tripName.trim() ? tripName.trim() : `${creatorName}'s Trip`,
      creatorName: creatorName.trim(),
      participants: [{ name: creatorName.trim(), submitted: false }],
      status: 'waiting',
    });

    return res.status(201).json({ code: trip.code, title: trip.title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not create trip.' });
  }
}

/**
 * POST /api/trips/join
 * Adds a participant to an existing trip using its trip code.
 */
async function joinTrip(req, res) {
  try {
    const { name, code } = req.body;

    if (!name || !name.trim() || !code || !code.trim()) {
      return res.status(400).json({ message: 'Name and trip code are required.' });
    }

    const trip = await Trip.findOne({ code: code.trim().toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found. Please check the trip code.' });
    }

    const alreadyIn = trip.participants.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (!alreadyIn) {
      trip.participants.push({ name: name.trim(), submitted: false });
      await trip.save();
    }

    return res.status(200).json({ code: trip.code, title: trip.title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not join trip.' });
  }
}

/**
 * GET /api/trips/:code
 * Returns trip details, participant list and submission status.
 * Used by the Trip Room to poll for updates.
 */
async function getTrip(req, res) {
  try {
    const trip = await Trip.findOne({ code: req.params.code.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found. Please check the trip code.' });
    }

    const submittedCount = trip.participants.filter((p) => p.submitted).length;

    return res.status(200).json({
      code: trip.code,
      title: trip.title,
      creatorName: trip.creatorName,
      status: trip.status,
      participants: trip.participants.map((p) => ({ name: p.name, submitted: p.submitted })),
      submittedCount,
      totalCount: trip.participants.length,
      recommendation: trip.recommendation && trip.recommendation.name ? trip.recommendation : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not fetch trip.' });
  }
}

/**
 * POST /api/trips/:code/preferences
 * Stores one participant's preferences and marks them as submitted.
 */
async function submitPreferences(req, res) {
  try {
    const { name, preferences } = req.body;
    const trip = await Trip.findOne({ code: req.params.code.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found. Please check the trip code.' });
    }

    const participant = trip.participants.find(
      (p) => p.name.toLowerCase() === (name || '').trim().toLowerCase()
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in this trip.' });
    }

    participant.preferences = preferences;
    participant.submitted = true;

    const allSubmitted = trip.participants.every((p) => p.submitted);
    trip.status = allSubmitted ? 'ready' : 'waiting';

    await trip.save();

    return res.status(200).json({ message: 'Preferences submitted.', status: trip.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not submit preferences.' });
  }
}

/**
 * POST /api/trips/:code/recommend
 * Runs the deterministic recommendation algorithm. Only the trip
 * creator may trigger this, and only once everyone has submitted.
 */
async function recommend(req, res) {
  try {
    const { requesterName } = req.body;
    const trip = await Trip.findOne({ code: req.params.code.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found. Please check the trip code.' });
    }

    if (requesterName && requesterName.trim().toLowerCase() !== trip.creatorName.toLowerCase()) {
      return res.status(403).json({ message: 'Only the trip creator can generate the recommendation.' });
    }

    const allSubmitted = trip.participants.every((p) => p.submitted);
    if (!allSubmitted) {
      return res.status(400).json({ message: 'Not everyone has submitted their preferences yet.' });
    }

    const result = generateRecommendation(trip.participants);

    trip.recommendation = {
      destinationId: result.destination.id,
      name: result.destination.name,
      country: result.destination.country,
      image: result.destination.image,
      description: result.destination.description,
      groupScore: result.groupScore,
      alternatives: result.alternatives,
      factors: result.factors,
      aiSummary: '',
      generatedAt: new Date(),
    };
    trip.status = 'completed';

    await trip.save();

    return res.status(200).json({ recommendation: trip.recommendation });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not generate recommendation.' });
  }
}

/**
 * POST /api/trips/:code/ai-summary
 * Calls the AI service to turn the ALREADY-CHOSEN destination into a
 * natural language paragraph. The AI does not pick the destination here
 * -- it only explains a decision the algorithm already made.
 */
async function aiSummary(req, res) {
  try {
    const trip = await Trip.findOne({ code: req.params.code.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found. Please check the trip code.' });
    }

    if (!trip.recommendation || !trip.recommendation.name) {
      return res.status(400).json({ message: 'Generate a recommendation first.' });
    }

    const destination = destinations.find((d) => d.id === trip.recommendation.destinationId);
    const preferenceSummary = summarizeGroupPreferences(trip.participants);

    const summary = await generateAISummary({
      destination,
      groupScore: trip.recommendation.groupScore,
      factors: trip.recommendation.factors,
      preferenceSummary,
    });

    trip.recommendation.aiSummary = summary;
    await trip.save();

    return res.status(200).json({ aiSummary: summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not generate AI summary.' });
  }
}

/** Builds a short plain-English summary of the group's combined preferences. */
function summarizeGroupPreferences(participants) {
  const mostCommon = (arr) => {
    const counts = {};
    arr.forEach((item) => {
      if (!item) return;
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  };

  const climate = mostCommon(participants.map((p) => p.preferences?.climate));
  const budget = mostCommon(participants.map((p) => p.preferences?.budget));
  const styles = participants.flatMap((p) => p.preferences?.travelStyles || []);
  const topStyles = [...new Set(styles)].slice(0, 3).join(', ');

  return `a ${climate || 'pleasant'} destination with a focus on ${topStyles || 'a mix of experiences'} while staying within a ${budget || 'reasonable'} budget`;
}

module.exports = {
  createTrip,
  joinTrip,
  getTrip,
  submitPreferences,
  recommend,
  aiSummary,
};
