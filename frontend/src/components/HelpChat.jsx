import { useState } from 'react';
import './HelpChat.css';

/**
 * "How may I help you?" widget.
 * This is deliberately NOT an open-ended AI chatbot. It shows a fixed
 * list of questions; clicking one reveals its fixed answer. No API call
 * is made here at all -- see backend/src/data/helpData.js for the source
 * of truth, which we also mirror here so it works even if the backend
 * is briefly unavailable.
 */
const HELP_ITEMS = [
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
      "There is no manual voting — each participant fills out a preference form, and PackVote's scoring algorithm aggregates everyone's answers automatically to find the best fit.",
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

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggle = () => {
    setOpen((o) => !o);
    setActiveQuestion(null);
  };

  return (
    <div className="help-chat">
      {open && (
        <div className="help-panel">
          <div className="help-panel-header">
            <span>PackVote Assistant</span>
            <button className="help-close" onClick={toggle} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="help-panel-body">
            {activeQuestion === null ? (
              <>
                <p className="help-intro">Pick a question to get an instant answer.</p>
                <ul className="help-question-list">
                  {HELP_ITEMS.map((item) => (
                    <li key={item.question}>
                      <button onClick={() => setActiveQuestion(item.question)}>
                        {item.question}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="help-answer">
                <button className="help-back" onClick={() => setActiveQuestion(null)}>
                  ‹ Back to questions
                </button>
                <p className="help-answer-q">
                  {HELP_ITEMS.find((i) => i.question === activeQuestion)?.question}
                </p>
                <p className="help-answer-a">
                  {HELP_ITEMS.find((i) => i.question === activeQuestion)?.answer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button className="help-fab" onClick={toggle}>
        💬 {!open && <span className="help-fab-label">How may I help you?</span>}
      </button>
    </div>
  );
}
