/**
 * Thin wrapper around fetch() for every backend call the frontend makes.
 * Keeping all REST calls in one file makes it obvious how the frontend
 * and backend communicate: plain JSON over HTTP, no extra layers.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

export const createTrip = (creatorName, tripName) =>
  request('/trips', { method: 'POST', body: JSON.stringify({ creatorName, tripName }) });

export const joinTrip = (name, code) =>
  request('/trips/join', { method: 'POST', body: JSON.stringify({ name, code }) });

export const getTrip = (code) => request(`/trips/${code}`);

export const submitPreferences = (code, name, preferences) =>
  request(`/trips/${code}/preferences`, {
    method: 'POST',
    body: JSON.stringify({ name, preferences }),
  });

export const generateRecommendation = (code, requesterName) =>
  request(`/trips/${code}/recommend`, {
    method: 'POST',
    body: JSON.stringify({ requesterName }),
  });

export const generateAISummary = (code) =>
  request(`/trips/${code}/ai-summary`, { method: 'POST' });

export const getHelpData = () => request('/help');
