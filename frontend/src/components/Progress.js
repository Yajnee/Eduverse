import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BACKEND_URL } from "../apiConfig";
import { getUserId } from "../authHelper";
import "./Progress.css";

export default function Progress() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const userId = getUserId();

    axios
      .get(`${BACKEND_URL}/api/quiz/history/${userId}`)
      .then((res) => {
        if (res.data.success) {
          setHistory(res.data.history);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // -------------------------------
  // NO DATA
  // -------------------------------
  if (history.length === 0) {
    return (
      <div className="progress-container">
        <div className="empty-state">
          <h2>No progress yet</h2>
          <p>Take a quiz to start tracking your learning!</p>
        </div>
      </div>
    );
  }

  // -------------------------------
  // STATS
  // -------------------------------
  const totalQuizzes = history.length;
  const avgAccuracy =
    history.reduce((a, b) => a + b.score / b.total, 0) / totalQuizzes;

  // Find best subject
  const subjectGroups = {};
  history.forEach((h) => {
    if (!subjectGroups[h.subject]) subjectGroups[h.subject] = [];
    subjectGroups[h.subject].push(h.score / h.total);
  });

  let bestSubject = "";
  let bestAccuracy = 0;

  for (let subject in subjectGroups) {
    const avg =
      subjectGroups[subject].reduce((a, b) => a + b, 0) /
      subjectGroups[subject].length;

    if (avg > bestAccuracy) {
      bestAccuracy = avg;
      bestSubject = subject;
    }
  }

  // -------------------------------
  // TREND DATA (LINE CHART)
  // -------------------------------
  const trendData = history.map((h, i) => ({
    index: i + 1,
    score: h.score,
  }));

  // -------------------------------
  // SUBJECT WISE BAR CHART
  // -------------------------------
  const subjectAccuracy = Object.entries(subjectGroups).map(
    ([subject, arr]) => ({
      subject,
      accuracy: parseFloat(
        ((arr.reduce((a, b) => a + b, 0) / arr.length) * 100).toFixed(1)
      ),
    })
  );

  return (
    <div className="progress-container">

      {/* stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <p className="stat-number">{totalQuizzes}</p>
        </div>

        <div className="stat-card">
          <h3>Average Accuracy</h3>
          <p className="stat-number">{(avgAccuracy * 100).toFixed(1)}%</p>
        </div>

        <div className="stat-card">
          <h3>Best Subject</h3>
          <p className="stat-number">{bestSubject || "N/A"}</p>
        </div>
      </div>

      {/* Line chart */}
      <div className="chart-box">
        <h3>Score Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: "Quiz #", dy: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#0066ff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div className="chart-box">
        <h3>Average Accuracy Per Subject</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectAccuracy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#00c49f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
