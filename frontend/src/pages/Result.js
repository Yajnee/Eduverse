// ======================================================================
// Result.js — EduVerse vIMMORTAL-STABLE
// Zero ESLint Errors | No Conditional Hooks | Works With AI Analysis
// ======================================================================

import React, { useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Result.css";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------------------------------
  // RAW INPUT (NEVER CONDITIONAL)
  // -------------------------------------------------------
  const rawInput = location.state || {};
  const rawResult = rawInput.result || rawInput.analysis || null;

  // -------------------------------------------------------
  // HOOKS (NEVER CONDITIONAL)
  // -------------------------------------------------------
  const analysis = useMemo(() => {
    if (!rawResult) return null;
    if (rawResult.analysis) return rawResult.analysis; // backend wrapped
    return rawResult;
  }, [rawResult]);

  const score = useMemo(() => {
    if (!analysis || !analysis.overall) return null;
    return analysis.overall.score_percent ?? null;
  }, [analysis]);

  const weakTopics = useMemo(() => {
    if (!analysis?.by_topic) return [];
    return Object.entries(analysis.by_topic)
      .filter(([, v]) => v.accuracy_percent < 50)
      .map(([topic, v]) => ({ topic, accuracy: v.accuracy_percent }));
  }, [analysis]);

  const reviewTop = useMemo(() => {
    if (!analysis?.by_question) return [];
    return Object.values(analysis.by_question)
      .filter((q) => q.analysis)
      .slice(0, 5);
  }, [analysis]);

  // -------------------------------------------------------
  // REDIRECT AFTER RENDER
  // -------------------------------------------------------
  useEffect(() => {
    if (!rawResult) {
      navigate("/", { replace: true });
    }
  }, [rawResult, navigate]);

  // -------------------------------------------------------
  // SAFE EARLY RETURN AFTER HOOKS
  // -------------------------------------------------------
  if (!rawResult) return null;

  // -------------------------------------------------------
  // EXPORT
  // -------------------------------------------------------
  const downloadAnalysis = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduverse_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-container">
      <header className="res-header">
        <div>
          <h1>Quiz Result</h1>
          <p className="muted">Evaluated by EduVerse AI</p>
        </div>

        <div className={`score-pill ${score == null ? "neutral" : ""}`}>
          <div className="score-value">
            {score == null ? "—" : `${score.toFixed(2)}%`}
          </div>
          <div className="score-label">
            {analysis?.overall?.passed
              ? "Passed"
              : score == null
              ? "No Score"
              : "Needs Improvement"}
          </div>
        </div>
      </header>

      <main className="res-main">
        {/* SUMMARY */}
        <section className="res-card">
          <h2>Summary</h2>

          {analysis ? (
            <>
              <p>
                <strong>Status:</strong>{" "}
                {analysis.overall?.passed
                  ? "Passed the assessment"
                  : "Needs improvement"}
              </p>

              <div className="summary-grid">
                <div>
                  <small>Score</small>
                  <div>{score ?? "—"}%</div>
                </div>

                <div>
                  <small>Result</small>
                  <div>{analysis?.overall?.passed ? "Pass" : "Fail"}</div>
                </div>

                <div>
                  <small>Weak Topics</small>
                  <div>
                    {weakTopics.length
                      ? weakTopics.map((t) => t.topic).join(", ")
                      : "None"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="muted">AI analysis unavailable</p>
          )}
        </section>

        {/* TOP REVIEW */}
        <section className="res-card">
          <h2>Top Review Items</h2>

          {reviewTop.length ? (
            <ol className="review-list">
              {reviewTop.map((q, idx) => (
                <li key={q.id ?? idx} className="review-item">
                  <div className="q-head">
                    <strong>{q.id ?? `Q${idx + 1}`}</strong>
                    <span className="q-topic">{q.topic}</span>
                  </div>
                  <div className="q-text">{q.question}</div>

                  <div className="q-meta">
                    <span className="chip">
                      Your: {String(q.user_answer ?? "—")}
                    </span>
                    <span className="chip">
                      Expected: {String(q.expected_answer ?? "—")}
                    </span>
                  </div>

                  <div className="q-feedback">
                    <strong>Why wrong:</strong> {q.analysis?.why_user_wrong}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No review items</p>
          )}
        </section>

        {/* ACTION BUTTONS */}
        <section className="res-actions">
          <button
            className="res-btn primary"
            onClick={() =>
              navigate("/error-analysis", { state: { analysis } })
            }
          >
            View Detailed Analysis
          </button>

          <button className="res-btn" onClick={() => navigate("/subjects")}>
            Take Another Quiz
          </button>

          <button className="res-btn secondary" onClick={() => navigate("/")}>
            Home
          </button>

          <button className="res-btn small" onClick={downloadAnalysis}>
            Download
          </button>
        </section>
      </main>
    </div>
  );
}
