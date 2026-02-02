// ============================================================================
// Home.js — EduVerse vSUPERNOVA-PRO
// A true SaaS-grade premium hero section
// ============================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="super-hero">
      {/* GLOW BACKDROP */}
      <div className="super-glow-1"></div>
      <div className="super-glow-2"></div>

      {/* CENTER HERO CARD */}
      <div className="super-card">
        <h1 className="super-title">
          Welcome to <span>EduVerse</span>
        </h1>

        <p className="super-sub">
          Your AI-powered GATE preparation companion.
        </p>

        <p className="super-desc">
          Generate intelligent quizzes, analyze mistakes, and master every
          topic—powered by EduVerse AI.
        </p>

        <button
          className="super-btn"
          onClick={() => navigate("/login")}
        >
          Login to Start Learning
        </button>
      </div>
    </div>
  );
}
