/* ============================================================================
   Library.js — EduVerse Frontend (vAURA-PRO R6)
   - Fully themed white-card UI
   - Correct /library/ endpoint
   - Uses BACKEND_URL for PDF access
   - Clean animations + responsive layout
   ========================================================================== */

import React, { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../apiConfig";
import "./Library.css";

const Library = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDFs = async () => {
      try {
        console.log("📡 Fetching PDFs from /library/ ...");

        // MUST USE TRAILING SLASH
        const res = await api.get("/library/");

        console.log("📄 Library Response:", res.data);

        if (Array.isArray(res.data)) {
          setPdfs(res.data);
        } else {
          setPdfs([]);
        }
      } catch (err) {
        console.error("❌ Library Fetch Error:", err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    loadPDFs();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading)
    return (
      <div className="center-page">
        <div className="card library-wrapper">
          <h3>Loading PDFs…</h3>
        </div>
      </div>
    );

  /* ---------------- EMPTY STATE ---------------- */
  if (!pdfs.length)
    return (
      <div className="center-page">
        <div className="card library-wrapper">
          <h3>No PDFs uploaded yet.</h3>
        </div>
      </div>
    );

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="center-page">
      <div className="card library-wrapper">

        <h2 className="library-title">📚 Study Library</h2>
        <p className="library-sub">Click any PDF to view it</p>

        <div className="pdf-grid">
          {pdfs.map((pdf) => (
            <div key={pdf.id} className="pdf-card">
              <div className="pdf-icon">📄</div>

              <div className="pdf-details">
                <h3 className="pdf-name">{pdf.name}</h3>
              </div>

              <button
                className="pdf-open-btn"
                onClick={() =>
                  window.open(`${BACKEND_URL}/${pdf.path}`, "_blank")
                }
              >
                Open PDF
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Library;
