/* ============================================================================
   EduVerse — DifficultySelection (vAURA-PRO R4)
   - Full theme upgrade: white card + purple glow
   - Logic preserved from vMAX-PRO
   - Clean, modern, consistent UI
   ========================================================================== */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DifficultySelection.css";

const difficulties = [
  {
    key: "Easy",
    tagline: "Warm-up",
    description: "Build intuition with simpler questions.",
    hint: "Good for first-time practice.",
  },
  {
    key: "Medium",
    tagline: "Standard",
    description: "Balanced difficulty, exam-oriented.",
    hint: "Ideal for steady GATE prep.",
  },
  {
    key: "Hard",
    tagline: "Challenge",
    description: "Edge-case heavy, tricky questions.",
    hint: "Use when you're confident.",
  },
];

const DifficultySelection = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  const subject =
    props.subject ||
    props?.config?.subject ||
    state.subject ||
    "ADA";

  const topic =
    props.topic ||
    props?.config?.topic ||
    state.topic ||
    "Branch and Bound";

  console.log("[DifficultySelection] Context:", { subject, topic });

  const handleDifficultyClick = (difficulty) => {
    navigate("/quiz", {
      state: {
        subject,
        topic,
        difficulty,
      },
    });
  };

  return (
    <div className="center-page">
      <div className="card difficulty-wrapper">
        <h2 className="difficulty-title">Select Difficulty</h2>

        <p className="difficulty-sub">
          {subject} • <strong>{topic}</strong>
        </p>

        <div className="difficulty-grid">
          {difficulties.map((d) => (
            <button
              key={d.key}
              className="difficulty-card"
              onClick={() => handleDifficultyClick(d.key)}
            >
              <h3 className="difficulty-name">{d.key}</h3>
              <p className="difficulty-tagline">{d.tagline}</p>
              <p className="difficulty-desc">{d.description}</p>
              <p className="difficulty-hint">{d.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelection;
