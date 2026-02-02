// frontend/src/authHelper.js

// If using Firebase, you may override these with Firebase methods.
// For now, using localStorage as your project currently does.

export function getAuthToken() {
  return localStorage.getItem("token") || null;
}

export function getUserId() {
  return localStorage.getItem("userId") || null;
}

export function setAuthCredentials(userId, token) {
  if (userId) localStorage.setItem("userId", userId);
  if (token) localStorage.setItem("token", token);
}
