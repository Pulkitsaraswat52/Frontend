import React from "react";

function UsernameForm({
  username,
  setUsername,
  newUsername,
  setNewUsername,
  password,
  setPassword,
}) {
  return (
    <div className="usernameForm">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="inputField"
      />
      <input
        type="text"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        placeholder="New Username (optional)"
        className="inputField"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="inputField"
      />
    </div>
  );
}

export default UsernameForm;
