import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import SubjectSelection from "./components/SubjectSelection";
import TopicSelection from "./components/TopicSelection";
import DifficultySelection from "./components/DifficultySelection";

import Upload from "./pages/Upload";
import Library from "./components/Library";
import Progress from "./components/Progress";
import Result from "./pages/Result";
import ErrorAnalysis from "./pages/ErrorAnalysis";

import Quiz from "./components/Quiz";
import Navbar from "./components/Navbar";

/* ============================================================================
   Wrapper components
   - These make the app robust even if location.state is missing
   - They pass safe config props to DifficultySelection and Quiz
   ========================================================================== */

function DifficultyWrapper() {
  const location = useLocation();

  // What came from TopicSelection via navigate("/difficulty", { state })
  const state = location.state || {};

  // Safe defaults (for direct URL access / refresh)
  const subject = state.subject || "ADA";
  const topic = state.topic || "Branch and Bound";

  const config = { subject, topic };

  // DifficultySelection can use props OR useLocation internally
  return (
    <DifficultySelection
      subject={subject}
      topic={topic}
      config={config}
    />
  );
}

function QuizWrapper() {
  const location = useLocation();

  const state = location.state || {};

  const subject = state.subject || "OS";
  const topic = state.topic || "Distributed Operating Systems";
  const difficulty = state.difficulty || "Medium";

  const config = { subject, topic, difficulty };

  // Quiz can use props OR useLocation internally
  return (
    <Quiz
      subject={subject}
      topic={topic}
      difficulty={difficulty}
      config={config}
    />
  );
}

/* ============================================================================
   Main App
   ========================================================================== */

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Home + Login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Subjects → Topics → Difficulty → Quiz */}
        <Route path="/subjects" element={<SubjectSelection />} />

        {/* /topics/ADA, /topics/DSA, /topics/OS */}
        <Route path="/topics/:subject" element={<TopicSelection />} />

        {/* Difficulty:
            - navigated via state: { subject, topic }
            - wrapper provides safe defaults if refreshed */}
        <Route path="/difficulty" element={<DifficultyWrapper />} />

        {/* Quiz:
            - navigated via state: { subject, topic, difficulty }
            - wrapper provides safe defaults if refreshed */}
        <Route path="/quiz" element={<QuizWrapper />} />

        {/* Results & Error Analysis */}
        <Route path="/result" element={<Result />} />
        <Route path="/analysis" element={<ErrorAnalysis />} />

        {/* Library / Upload / Progress */}
        <Route path="/upload" element={<Upload />} />
        <Route path="/library" element={<Library />} />
        <Route path="/progress" element={<Progress />} />

        {/* (Optional) simple 404 fallback */}
        {/* <Route path="*" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}
