/* ============================================================================
   Quiz.js — EduVerse Frontend (vMAX-FORTRESS-R10)
   Fully Stable | Correct Submit Route | AI Analysis Guaranteed
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizLoader from "../components/QuizLoader";
import api from "../apiConfig";

const Quiz = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // CONFIG HANDLING
  // ---------------------------------------------------------
  const rawState = location.state || {};
  const subject = props.subject || rawState.subject || "ADA";
  const topic = props.topic || rawState.topic || "Greedy Algorithms";
  const difficulty = props.difficulty || rawState.difficulty || "Medium";

  const configKey = `${subject}|${topic}|${difficulty}`;

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchKey = useRef(null);

  // ---------------------------------------------------------
  // FETCH QUIZ
  // ---------------------------------------------------------
  useEffect(() => {
    if (lastFetchKey.current === configKey) return;
    lastFetchKey.current = configKey;

    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await api.post(
          "/quiz/generate",
          { subject, topic, difficulty },
          { signal: controller.signal }
        );

        clearTimeout(timeout);

        const rawQuiz = Array.isArray(res.data?.quiz)
          ? res.data.quiz
          : [];

        if (!rawQuiz.length) throw new Error("Empty quiz");

        const cleaned = rawQuiz.map((q, i) => ({
          id: q.id || `q${i + 1}`,
          question: q.question || "",
          type: (q.type || "MCQ").toUpperCase(),
          difficulty: q.difficulty || difficulty,
          topic: q.topic || topic,
          correctAnswer: q.answer ?? q.answers ?? null,
          options: Array.isArray(q.options)
            ? q.options.map((v, idx) => ({
                key: String.fromCharCode(65 + idx),
                text: v,
              }))
            : q.options && typeof q.options === "object"
            ? Object.entries(q.options).map(([k, v]) => ({
                key: k,
                text: v,
              }))
            : [],
        }));

        setQuestions(cleaned);
        setAnswers({});
        setFlags({});
        setCurrentIndex(0);
      } catch (err) {
        console.error("⚠ Quiz fetch error:", err.message);
        setError("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [configKey]);

  // ---------------------------------------------------------
  // UTIL
  // ---------------------------------------------------------
  const currentQuestion = questions[currentIndex];

  if (loading) return <QuizLoader visible />;
  if (error)
    return (
      <div style={{ padding: "2rem", color: "red", fontSize: "20px" }}>
        {error}
      </div>
    );

  if (!currentQuestion)
    return <div style={{ padding: "2rem" }}>No questions found.</div>;

  const isOptionSelected = (q, idx) => {
    const a = answers[q.id];
    const key = q.options[idx].key;
    if (q.type === "MSQ") return Array.isArray(a) && a.includes(key);
    return a === key;
  };

  const isAnswered = (q) => {
    const a = answers[q.id];
    if (q.type === "NAT") return a && a.trim() !== "";
    if (q.type === "MSQ") return Array.isArray(a) && a.length > 0;
    return a !== undefined;
  };

  // ---------------------------------------------------------
  // ANSWER HANDLERS
  // ---------------------------------------------------------
  const handleMCQ = (id, key) => {
    setAnswers((p) => ({ ...p, [id]: key }));
    setTimeout(() => {
      if (currentIndex < questions.length - 1)
        setCurrentIndex((i) => i + 1);
    }, 150);
  };

  const handleMSQ = (id, key) => {
    setAnswers((p) => {
      const cur = Array.isArray(p[id]) ? p[id] : [];
      return cur.includes(key)
        ? { ...p, [id]: cur.filter((x) => x !== key) }
        : { ...p, [id]: [...cur, key] };
    });
  };

  const handleNAT = (id, val) =>
    setAnswers((p) => ({
      ...p,
      [id]: val.trim() === "" ? null : val.trim(),
    }));

  const toggleFlag = (id) =>
    setFlags((p) => ({ ...p, [id]: !p[id] }));

  // ---------------------------------------------------------
  // SUBMIT → AI ERROR ANALYSIS  (FINAL FIX)
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    const payload = questions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty,
      userAnswer: q.type === "NAT" ? answers[q.id] ?? null : answers[q.id],
      correctAnswer: q.correctAnswer,
    }));

    try {
      const res = await api.post(
        "/quiz/submit",
        { answers: payload },
        { timeout: 120000 }
      );

      navigate("/result", {
        state: {
          result: res.data.analysis,  // <-- EXACTLY what Result.js expects
          questions,
          answers,
          config: { subject, topic, difficulty },
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit quiz.");
    }
  };

  // ---------------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------------
  return (
    <div className="quiz-wrapper">
      {/* LEFT SIDE */}
      <div className="quiz-left">
        <div className="quiz-header">
          <h2>{subject} • {topic} • {difficulty}</h2>
          <div className="q-count">
            Question {currentIndex + 1} / {questions.length}{" "}
            <span className="q-type">({currentQuestion.type})</span>
          </div>
        </div>

        <div className="question-box">{currentQuestion.question}</div>

        {/* OPTIONS */}
        {currentQuestion.type !== "NAT" &&
          currentQuestion.options.map((o, i) => {
            const active = isOptionSelected(currentQuestion, i);
            return (
              <button
                key={i}
                className={`option-btn ${active ? "active" : ""}`}
                onClick={() =>
                  currentQuestion.type === "MCQ"
                    ? handleMCQ(currentQuestion.id, o.key)
                    : handleMSQ(currentQuestion.id, o.key)
                }
              >
                <span className="opt-key">{o.key}</span>
                <span>{o.text}</span>
              </button>
            );
          })}

        {currentQuestion.type === "NAT" && (
          <input
            type="text"
            className="nat-input"
            value={answers[currentQuestion.id] || ""}
            placeholder="Enter your answer"
            onChange={(e) => handleNAT(currentQuestion.id, e.target.value)}
          />
        )}

        {/* NAVIGATION */}
        <div className="nav-bar">
          <button
            className="nav-btn"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </button>

          <button
            className="nav-btn"
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
          </button>

          <button className="flag-btn" onClick={() => toggleFlag(currentQuestion.id)}>
            {flags[currentQuestion.id] ? "Unflag" : "Flag"}
          </button>

          <button
            className="submit-btn"
            disabled={Object.keys(answers).length === 0}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {/* RIGHT SIDE PALETTE */}
      <div className="quiz-right">
        <h3 className="palette-title">Question Palette</h3>

        <div className="palette-grid">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`palette-item
                ${i === currentIndex ? "current" : ""}
                ${flags[q.id] ? "flagged" : ""}
                ${isAnswered(q) ? "answered" : ""}
              `}
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
