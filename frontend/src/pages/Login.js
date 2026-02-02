// ==========================================
// EduVerse Login.js — vSUPERNOVA-ULTRA
// Google Icon FIXED | UI Polished | Zero ESLint Warnings
// ==========================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Login.css";

const GOOGLE_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABF0lEQVR4Xu3a0Q3CMBQF0P7/7x0oQAzMioAxoJ2iK/xlIETqdyBvIbK3VpKXoK7cYvUj3X0JQgghhBBCCCGEEEIIIYQQQvgG48MwywY9G4Gt1U7E7Dy7R76oQxjv/6D5B8MwywY1GsU1GoU1GqU1mqV1mqU9kqU1WqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqU1mqa9P0IsY7/i8z7vY/wfMwywY9G4Gt1U7E7Dy7R77oR4Ok8/CcQggghhBBCCCGEEEIIIYQQQnjAH3cxAtOpBQ/7AAAAAElFTkSuQmCC";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ----------------------
  // GOOGLE LOGIN
  // ----------------------
  const handleGoogleLogin = async () => {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);

      console.log("Google login successful");
      navigate("/subjects", { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed.");
    }
  };

  // ----------------------
  // EMAIL LOGIN
  // ----------------------
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");

      await signInWithEmailAndPassword(auth, email, password);

      console.log("Email login successful");
      navigate("/subjects", { replace: true });
    } catch (err) {
      console.error("Email login error:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome to EduVerse</h1>
        <p className="sub-text">Sign in to continue your learning journey 🎓</p>

        {/* GOOGLE LOGIN */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src={GOOGLE_ICON} alt="Google" className="google-icon" />
          Continue with Google
        </button>

        <div className="or-divider">or</div>

        {/* EMAIL FORM */}
        <form className="login-form" onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <p className="register-line">
          New here?
          <button className="link-btn" onClick={() => navigate("/register")}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
