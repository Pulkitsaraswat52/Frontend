// src/auth/roles.js

// ✅ Lowercase roles only
const userRoles = {
  pulkit: { role: "employee", user_id: 1 },
  ankit: { role: "employee", user_id: 2 },
  deepak: { role: "employee", user_id: 6},
};

/**
 * Get role for a given username
 * @param {string} username
 * @returns {string} role or "guest" if username not found
 */
export function getRoleByUsername(username) {
  return userRoles[username?.toLowerCase()]?.role || "guest";
}

/**
 * Get user_id for a given username
 * @param {string} username
 * @returns {number|null} user_id or null if not found
 */
export function getUserIdByUsername(username) {
  return userRoles[username?.toLowerCase()]?.user_id || null;
}
