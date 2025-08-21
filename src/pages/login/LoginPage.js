// src/components/LoginForm.js

import React from 'react';
import './LoginPage.css'; // Import file CSS

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign In</h2>

        <form>
          <div className="form-group">
            <label htmlFor="username">Enter your Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Enter your Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;