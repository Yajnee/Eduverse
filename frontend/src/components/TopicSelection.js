import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./TopicSelection.css";

export default function TopicSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject } = useParams(); // 🔥 URL PARAM FIX

  // FULL TOPIC MAP (SAME AS SUBJECT PAGE)
  const topicsData = {
    OS: [
      "Operating System Basics",
      "System Calls",
      "Process Management",
      "Threads & Multithreading",
      "CPU Scheduling",
      "Process Synchronization",
      "Semaphores & Monitors",
      "Deadlocks",
      "Memory Management",
      "Paging & Segmentation",
      "Virtual Memory",
      "File Systems",
      "I/O Systems",
      "Disk Scheduling",
      "Interprocess Communication (IPC)",
      "Case Studies Linux Windows"
    ],
    DSA: [
      "Arrays",
      "Linked Lists",
      "Stacks & Queues",
      "Trees and Traversals",
      "Binary Search Trees",
      "Heaps",
      "Graphs",
      "Searching Algorithms",
      "Sorting Algorithms",
      "Hash Tables",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Divide and Conquer",
      "Tries"
    ],
    ADA: [
      "Algorithm Basics",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Divide and Conquer",
      "Graph Algorithms",
      "Flow Networks",
      "Backtracking",
      "Branch and Bound",
      "NP-Hard & NP-Complete"
    ],
  };

  // 🔥 FIX: Load from state if available, otherwise load from topicsData
  const topics = location.state?.topics || topicsData[subject] || [];

  const handleTopicClick = (topic) => {
    navigate("/difficulty", {
      state: { subject, topic },
    });
  };

  return (
    <div className="topic-page">
      <div className="topic-container">

        <h2 className="topic-title">Select a Topic</h2>
        <p className="topic-subtitle">
          Subject: <strong>{subject}</strong>
        </p>

        <div className="topic-grid">
          {topics.map((t, idx) => (
            <div
              key={idx}
              className="topic-card"
              onClick={() => handleTopicClick(t)}
            >
              <div className="topic-name">{t}</div>
              <div className="topic-hint">Click to choose difficulty</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
