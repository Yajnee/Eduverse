import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";

/**
 * Helper to get Firebase Bearer Token for secured backend calls
 */
async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const DEVELOPER_EMAIL = "yourdevemail@example.com"; // 🔁 Replace with your email

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setAuthorized(u && u.email === DEVELOPER_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  // 🔒 Restrict access
  if (!authorized) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h3>🚫 Access Restricted</h3>
        <p>This section is only accessible to authorized developers.</p>
      </div>
    );
  }

  // 📤 Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file first.");

    const form = new FormData();
    form.append("file", file);

    try {
      const headers = await getAuthHeader();
      headers["Content-Type"] = "multipart/form-data";

      await axios.post("http://localhost:5000/api/upload", form, { headers });
      alert("✅ File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed or unauthorized.");
    }
  };

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 500,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>Developer Upload Portal</h2>
      <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: 20 }}>
        Upload study PDFs to EduVerse Library
      </p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            display: "block",
            margin: "0 auto 20px auto",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "6px",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background 0.2s ease-in-out",
          }}
        >
          Upload PDF
        </button>
      </form>
    </div>
  );
}
