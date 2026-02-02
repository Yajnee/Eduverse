import React from "react";
import { useNavigate } from "react-router-dom";
import "./SubjectSelection.css";

export default function SubjectSelection() {
  const navigate = useNavigate();

  // FINAL FIX — FULL TOPIC LIST
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

  const subjects = ["DSA", "OS", "ADA"];

  const handleSelect = (subject) => {
    navigate(`/topics/${subject}`, {
      state: {
        subject,
        topics: topicsData[subject], // 🔥 THE ONLY THING THAT WAS MISSING
      },
    });
  };

  return (
    <div className="subject-page">
      <h2>Select a Subject</h2>

      <div className="subject-grid">
        {subjects.map((sub) => (
          <div
            key={sub}
            className="subject-card"
            onClick={() => handleSelect(sub)}
          >
            {sub}
          </div>
        ))}
      </div>
    </div>
  );
}
