/**
 * PackVote has no login system (by design -- it's a lightweight, code-based
 * app). We remember "which participant is this browser" per trip using
 * sessionStorage, so a page refresh doesn't lose the user's identity.
 */
const key = (code) => `packvote_name_${code}`;

export function getStoredName(code) {
  return sessionStorage.getItem(key(code)) || '';
}

export function setStoredName(code, name) {
  sessionStorage.setItem(key(code), name);
}
