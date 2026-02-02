/* ============================================================================
   ErrorAnalysis.js — EduVerse vMAX-FINAL-R10
   ZERO Hook Errors | Fully Safe | Works with Result.js-R10
   ========================================================================== */

import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ErrorAnalysis.css";

export default function ErrorAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();

  // RAW INPUT
  const inputAnalysis = location.state?.analysis || null;

  // ==========================================================
  // ALWAYS DEFINE HOOKS — NO CONDITIONAL HOOKS EVER
  // ==========================================================

  const analysis = useMemo(() => {
    if (!inputAnalysis || typeof inputAnalysis !== "object") return null;
    return inputAnalysis;
  }, [inputAnalysis]);

  const byTopic = useMemo(() => {
    return analysis?.by_topic || {};
  }, [analysis]);

  const byQuestion = useMemo(() => {
    return analysis?.by_question || {};
  }, [analysis]);

  const summary = useMemo(() => {
    return analysis?.overall || null;
  }, [analysis]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="ea-wrapper">

      {/* HEADER */}
      <div className="ea-header">
        <h1>Error Analysis</h1>
        <p className="ea-sub">AI-powered breakdown of your performance</p>
      </div>

      {/* SUMMARY CARD */}
      <div className="ea-card">
        <h2>Summary</h2>

        {summary ? (
          <div className="ea-summary-grid">

            <div className="ea-summary-item">
              <small>Status</small>
              <div>{summary.passed ? "Pass" : "Fail"}</div>
            </div>

            <div className="ea-summary-item">
              <small>Score</small>
              <div>{summary.score_percent ?? "—"}%</div>
            </div>

            <div className="ea-summary-item">
              <small>Total Questions</small>
              <div>{summary.total_questions ?? "—"}</div>
            </div>

            <div className="ea-summary-item">
              <small>Correct</small>
              <div>{summary.correct_answers ?? "—"}</div>
            </div>

            <div className="ea-summary-item">
              <small>Incorrect</small>
              <div>{summary.incorrect_answers ?? "—"}</div>
            </div>

          </div>
        ) : (
          <p className="ea-muted">No summary available.</p>
        )}
      </div>

      {/* TOPIC ACCURACY */}
      <div className="ea-card">
        <h2>Topic Accuracy</h2>

        {Object.keys(byTopic).length ? (
          <div className="ea-topic-grid">
            {Object.entries(byTopic).map(([topic, data], idx) => (
              <div key={idx} className="ea-topic-item">
                <strong>{topic}</strong>
                <div className="ea-topic-acc">
                  Accuracy: {data.accuracy_percent ?? "—"}%
                </div>
                <div className="ea-topic-detail">
                  Correct: {data.correct ?? 0} / {data.total ?? 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ea-muted">No topic-specific data available.</p>
        )}
      </div>

      {/* QUESTION-LEVEL ANALYSIS */}
      <div className="ea-card">
        <h2>Question Breakdown</h2>

        {Object.keys(byQuestion).length ? (
          <div className="ea-q-list">
            {Object.values(byQuestion).map((q, idx) => (
              <div key={idx} className="ea-q-item">
                <div className="ea-q-header">
                  <strong>{q.id ?? `Q${idx + 1}`}</strong>
                  <span className="ea-q-topic">{q.topic}</span>
                </div>

                <div className="ea-q-text">{q.question}</div>

                <div className="ea-q-meta">
                  <span className="ea-chip">
                    Your: {String(q.user_answer ?? "—")}
                  </span>
                  <span className="ea-chip">
                    Expected: {String(q.expected_answer ?? "—")}
                  </span>
                </div>

                <div className="ea-q-analysis">
                  <strong>Why Wrong:</strong>{" "}
                  {q.analysis?.why_user_wrong || "—"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ea-muted">No question-level analysis available.</p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="ea-actions">
        <button className="ea-btn" onClick={() => navigate("/subjects")}>
          Take Another Quiz
        </button>

        <button className="ea-btn" onClick={() => navigate("/result", {
          state: { result: analysis }
        })}>
          Back to Result
        </button>

        <button className="ea-btn" onClick={() => navigate("/")}>
          Home
        </button>
      </div>
    </div>
  );
}
