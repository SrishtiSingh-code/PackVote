/**
 * Fixed question -> answer pairs for the "How may I help you?" widget.
 * IMPORTANT: This is NOT an LLM-backed chatbot. It is a simple lookup
 * table, deliberately, so behaviour is 100% predictable and requires no
 * API calls. See HelpChat.jsx on the frontend for how this is rendered.
 */
const helpData = [
  {
    question: 'How does PackVote work?',
    answer:
      'One person creates a trip and shares the unique trip code with friends. Everyone joins the trip and submits their preferences. PackVote compares the preferences and finds the destination that best matches the entire group.',
  },
  {
    question: 'What is a trip code?',
    answer:
      'A trip code is a short, unique code (like GV7K2P) generated when a trip is created. Anyone with the code can join that trip and submit their travel preferences.',
  },
  {
    question: 'How is the destination selected?',
    answer:
      'PackVote compares the preferences submitted by every participant and calculates a compatibility score for each destination. The destination with the highest group compatibility score becomes the recommendation.',
  },
  {
    question: 'Can I join an existing trip?',
    answer:
      'Yes! Click "Join Trip" on the home page, enter your name and the trip code shared by the trip creator, and you will be added to the group.',
  },
  {
    question: 'How does group voting work?',
    answer:
      'There is no manual voting -- each participant fills out a preference form (budget, climate, activities, etc.), and PackVote\'s scoring algorithm aggregates everyone\'s answers automatically to find the best fit.',
  },
  {
    question: 'How is the AI used?',
    answer:
      'The AI does not choose your destination. Once the scoring algorithm picks the best match, the AI is only used to turn that result into a friendly, easy-to-read summary explaining the choice.',
  },
  {
    question: 'Who can generate the final recommendation?',
    answer:
      'Only the trip creator can click "Generate Recommendation", and only after every participant has submitted their preferences.',
  },
];

module.exports = helpData;
